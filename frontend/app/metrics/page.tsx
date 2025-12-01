"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import { getUserProfile } from "@/services/users";
import {
  getTeacherCoursesCount,
  getTeacherUniqueStudentsCount,
  getGeneratedMaterialsStats,
  getCourseStatistics,
  getCoursesWithoutMaterial,
} from "@/services/metrics";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type MaterialsStats = {
  PENDIENTE_REVISION: number;
  ERROR_GENERACION: number;
  PUBLICADO: number;
  total: number;
};

type CourseStats = {
  averageStudents: number;
  courseWithMostStudents: {
    name: string;
    studentCount: number;
  } | null;
  courseWithLeastStudents: {
    name: string;
    studentCount: number;
  } | null;
};

type CourseWithoutMaterial = {
  _id: string;
  name: string;
  description: string;
  studentCount: number;
};

export default function MetricsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<{
    coursesCount: number;
    studentsCount: number;
    materialsStats: MaterialsStats | null;
    courseStats: CourseStats | null;
    coursesWithoutMaterial: CourseWithoutMaterial[];
  }>({
    coursesCount: 0,
    studentsCount: 0,
    materialsStats: null,
    courseStats: null,
    coursesWithoutMaterial: [],
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || null;

        if (!role || !["docente", "administrador"].includes(role.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          return;
        }

        setUser({ id: userData._id, name: userData.name, role });

        // Cargar métricas según el rol
        if (role.toLowerCase() === "docente" || role.toLowerCase() === "administrador") {
          const [coursesCount, studentsCount, courseStats, coursesWithoutMaterial] = await Promise.all([
            getTeacherCoursesCount(userData._id),
            getTeacherUniqueStudentsCount(userData._id),
            getCourseStatistics(userData._id),
            getCoursesWithoutMaterial(userData._id),
          ]);

          const metricsData = {
            coursesCount,
            studentsCount,
            materialsStats: null as MaterialsStats | null,
            courseStats,
            coursesWithoutMaterial,
          };

          // Si es administrador, también obtener estadísticas de materiales
          if (role.toLowerCase() === "administrador") {
            const materialsStats = await getGeneratedMaterialsStats();
            metricsData.materialsStats = materialsStats;
          }

          setMetrics(metricsData);
        }
      } catch (err) {
        const errorMessage =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message ?? "Error desconocido"
            : "Error desconocido";

        setError("Error al obtener los datos del usuario: " + errorMessage);
        router.push("/users/login");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040418] text-white">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-4xl text-[#6356E5] mx-auto mb-4" />
          <span className="text-lg">Cargando métricas...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-screen">
        <SideBar user={user ?? undefined} />
        <main className="flex-1 p-8 bg-[#040418]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2 text-white">⚠️ Acceso Denegado</h1>
              <p className="text-zinc-300">{error || "No tienes permisos para acceder a esta sección"}</p>
              <a
                href="/"
                className="mt-4 inline-block bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderPieChart = () => {
    if (!metrics.materialsStats) return null;

    const { PENDIENTE_REVISION, ERROR_GENERACION, PUBLICADO, total } =
      metrics.materialsStats;

    // Calcular porcentajes
    const percentages = {
      PENDIENTE_REVISION: total > 0 ? (PENDIENTE_REVISION / total) * 100 : 0,
      ERROR_GENERACION: total > 0 ? (ERROR_GENERACION / total) * 100 : 0,
      PUBLICADO: total > 0 ? (PUBLICADO / total) * 100 : 0,
    };

    // Crear el gráfico SVG
    let currentAngle = 0;
    const radius = 100;
    const centerX = 120;
    const centerY = 120;

    const createSlice = (percentage: number, color: string) => {
      if (percentage === 0) return null;

      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const startX =
        centerX + radius * Math.cos((Math.PI * startAngle) / 180);
      const startY =
        centerY + radius * Math.sin((Math.PI * startAngle) / 180);
      const endX = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
      const endY = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        "Z",
      ].join(" ");

      currentAngle = endAngle;

      return <path d={pathData} fill={color} key={color} />;
    };

    const colors = {
      PENDIENTE_REVISION: "#FFA500", // Naranja
      ERROR_GENERACION: "#FF4444", // Rojo
      PUBLICADO: "#4CAF50", // Verde
    };

    return (
      <div className="bg-[#101434] rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Contenido Generado por IA
        </h2>
        <div className="flex items-center justify-center">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <svg width="240" height="240" viewBox="0 0 240 240">
              {createSlice(percentages.PENDIENTE_REVISION, colors.PENDIENTE_REVISION)}
              {createSlice(percentages.ERROR_GENERACION, colors.ERROR_GENERACION)}
              {createSlice(percentages.PUBLICADO, colors.PUBLICADO)}
            </svg>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors.PENDIENTE_REVISION }}
                ></div>
                <div>
                  <p className="text-sm text-white/70">Pendiente de Revisión</p>
                  <p className="text-lg font-semibold text-white">
                    {PENDIENTE_REVISION} ({percentages.PENDIENTE_REVISION.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors.ERROR_GENERACION }}
                ></div>
                <div>
                  <p className="text-sm text-white/70">Error de Generación</p>
                  <p className="text-lg font-semibold text-white">
                    {ERROR_GENERACION} ({percentages.ERROR_GENERACION.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors.PUBLICADO }}
                ></div>
                <div>
                  <p className="text-sm text-white/70">Publicado</p>
                  <p className="text-lg font-semibold text-white">
                    {PUBLICADO} ({percentages.PUBLICADO.toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="border-t border-white/20 pt-2 mt-2">
                <p className="text-sm text-white/70">Total de Materiales</p>
                <p className="text-xl font-bold text-white">{total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <SideBar user={user!} />
      <main className="flex-1 p-8 bg-[#040418] overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Métricas de Desempeño
          </h1>

          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cantidad de Cursos */}
            <div className="bg-[#101434] rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">
                    Cursos Activos
                  </p>
                  <p className="text-4xl font-bold text-[#6356E5]">
                    {metrics.coursesCount}
                  </p>
                </div>
                <div className="bg-[#6356E5] bg-opacity-20 rounded-full p-4">
                  <img
                    src="/assets/iconos/cursos.png"
                    alt="Courses"
                    className="w-12 h-12"
                  />
                </div>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Total de cursos que estás impartiendo
              </p>
            </div>

            {/* Cantidad de Estudiantes */}
            <div className="bg-[#101434] rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">
                    Estudiantes Únicos
                  </p>
                  <p className="text-4xl font-bold text-[#7a6eff]">
                    {metrics.studentsCount}
                  </p>
                </div>
                <div className="bg-[#7a6eff] bg-opacity-20 rounded-full p-4">
                  <img
                    src="/assets/iconos/students.png"
                    alt="Students"
                    className="w-12 h-12"
                  />
                </div>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Estudiantes diferentes a los que impartes clase
              </p>
            </div>
          </div>

          {/* Estadísticas de Cursos */}
          {metrics.courseStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Promedio de Estudiantes */}
              <div className="bg-[#101434] rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/70 text-sm font-medium">
                    Promedio de Estudiantes
                  </p>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-[#6356E5]">
                  {metrics.courseStats.averageStudents}
                </p>
                <p className="text-white/60 text-xs mt-2">
                  Por curso
                </p>
              </div>

              {/* Curso con Más Estudiantes */}
              <div className="bg-[#101434] rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/70 text-sm font-medium">
                    Curso Más Poblado
                  </p>
                  <span className="text-2xl">🏆</span>
                </div>
                {metrics.courseStats.courseWithMostStudents ? (
                  <>
                    <p className="text-2xl font-bold text-[#28a745] mb-1">
                      {metrics.courseStats.courseWithMostStudents.studentCount} estudiantes
                    </p>
                    <p className="text-white/80 text-sm truncate" title={metrics.courseStats.courseWithMostStudents.name}>
                      {metrics.courseStats.courseWithMostStudents.name}
                    </p>
                  </>
                ) : (
                  <p className="text-white/60 text-sm">Sin datos</p>
                )}
              </div>

              {/* Curso con Menos Estudiantes */}
              <div className="bg-[#101434] rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/70 text-sm font-medium">
                    Curso Menos Poblado
                  </p>
                  <span className="text-2xl">📉</span>
                </div>
                {metrics.courseStats.courseWithLeastStudents ? (
                  <>
                    <p className="text-2xl font-bold text-[#fd7e14] mb-1">
                      {metrics.courseStats.courseWithLeastStudents.studentCount} estudiante{metrics.courseStats.courseWithLeastStudents.studentCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-white/80 text-sm truncate" title={metrics.courseStats.courseWithLeastStudents.name}>
                      {metrics.courseStats.courseWithLeastStudents.name}
                    </p>
                  </>
                ) : (
                  <p className="text-white/60 text-sm">Sin datos</p>
                )}
              </div>
            </div>
          )}

          {/* Cursos sin Material Generado - Solo para Docentes */}
          {user.role.toLowerCase() === "docente" && metrics.coursesWithoutMaterial.length > 0 && (
            <div className="bg-[#101434] rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Cursos sin Material Generado
                  </h2>
                  <p className="text-white/60 text-sm">
                    {metrics.coursesWithoutMaterial.length} curso{metrics.coursesWithoutMaterial.length !== 1 ? 's' : ''} sin contenido de IA
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {metrics.coursesWithoutMaterial.map((course) => (
                  <div
                    key={course._id}
                    className="bg-[#0a0a1f] rounded-lg px-4 py-3 border border-[#2a2a4a] hover:border-[#fd7e14] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{course.name}</h3>
                        <p className="text-white/60 text-sm mt-1">{course.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-white/70 text-sm">
                          {course.studentCount} estudiante{course.studentCount !== 1 ? 's' : ''}
                        </p>
                        <a
                          href="/dashboard"
                          className="text-[#6356E5] hover:text-[#7a6eff] text-sm font-medium mt-1 inline-block"
                        >
                          Generar contenido →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje cuando todos los cursos tienen material */}
          {user.role.toLowerCase() === "docente" && metrics.coursesWithoutMaterial.length === 0 && metrics.coursesCount > 0 && (
            <div className="bg-[#101434] rounded-lg shadow-md p-6 mb-6 border border-[#28a745]/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-xl font-semibold text-[#28a745]">
                    ¡Excelente trabajo!
                  </h3>
                  <p className="text-white/70 text-sm">
                    Todos tus cursos tienen material generado por IA
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de pastel para administradores */}
          {user.role === "administrador" && renderPieChart()}
        </div>
      </main>
    </div>
  );
}
