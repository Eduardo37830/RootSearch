"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar";
import { getUserProfile } from "@/services/users";
import { getAllStudents } from "@/services/students";
import { getCoursesByTeacher, getCourseById } from "@/services/courses";
import Toast from "@/components/Toast";

type Student = {
  _id: string;
  name: string;
  email?: string;
};

type Course = {
  _id: string;
  name: string;
  description?: string;
  teacher: string | { _id: string; name?: string; email?: string };
  students?: Student[] | string[];
};

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [students, setStudents] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || null;

        if (!role || !["docente", "estudiante", "administrador"].includes(role.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          return;
        }

        setUser({ id: userData._id, name: userData.name, role });

        if (role.toLowerCase() === "docente" || role.toLowerCase() === "administrador") {
          const studentsData = await getAllStudents();
          setStudents(studentsData);
        }
      } catch (err) {
        const errorMessage =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message ?? "Error desconocido"
            : "Error desconocido";
        setToast({ message: "Error al cargar datos: " + errorMessage, type: "error" });
        setError("Error al obtener los datos del usuario o estudiantes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchTeacherCourses() {
      if (user?.role.toLowerCase() === "docente" && user.id) {
        const courses: Course[] = await getCoursesByTeacher(user.id);
        setTeacherCourses(courses);
      }
    }
    fetchTeacherCourses();
  }, [user]);

  if (loading) return <div className="text-white p-4">Cargando datos...</div>;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101434] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">⚠️ Acceso Denegado</h1>
          <p className="text-zinc-300">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#040418] text-black">
      <SideBar user={user!} />

      <main className="flex-1 flex flex-col gap-4 p-6">
        {user?.role.toLowerCase() === "docente"||user?.role.toLowerCase() === "administrador" ? (
          <>
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-4 text-white">Mis Cursos</h2>
              {teacherCourses.length > 0 ? (
                <div className="bg-[#101434] rounded-lg shadow overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead>
                      <tr className="border-b border-[#2a2a4a] bg-[#0f0f2e]">
                        <th className="px-6 py-4 text-left font-semibold">Nombre del Curso</th>
                        <th className="px-6 py-4 text-left font-semibold">Estudiantes Asignados</th>
                        <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherCourses.map((course) => (
                        <tr key={course._id} className="border-b border-[#2a2a4a] hover:bg-[#151540] transition">
                          <td className="px-6 py-4 font-medium">{course.name}</td>
                          <td className="px-6 py-4">
                            {Array.isArray(course.students) && course.students.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {course.students.map((student: any) => (
                                  <span
                                    key={typeof student === 'string' ? student : student._id}
                                    className="bg-[#6356E5] text-white px-3 py-1 rounded-full text-xs"
                                  >
                                    {typeof student === 'string' ? 'ID: ' + student : student.name || 'Estudiante'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white/50">Sin estudiantes</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex gap-2 justify-center flex-wrap">
                              <button
                                onClick={() => {
                                  setToast({
                                    message: `Mostrando PIA del curso: ${course.name}`,
                                    type: 'info',
                                  });
                                }}
                                className="bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                              >
                                Mostrar PIA
                              </button>
                              <button
                                onClick={() => {
                                  setToast({
                                    message: `Agregando contenido al curso: ${course.name}`,
                                    type: 'info',
                                  });
                                }}
                                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                              >
                                Agregar Contenido
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-[#101434] rounded-lg shadow p-6 text-center text-white/70">
                  No tienes cursos asignados.
                </div>
              )}
            </div>
            <div className="w-full bg-[#101434] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Notifications</h2>
              <p className="text-sm text-white/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row flex-1 gap-4">
              <div className="flex-1 bg-[#101434] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Material de Clase</h2>
                <p className="text-sm text-white/90">
                  Aquí se muestra el material de clase dejado.
                </p>
              </div>
              <div
                className={`w-full lg:w-1/3 bg-[#35448e] rounded-lg shadow p-6 transition-all duration-300 ${expanded ? 'lg:w-full' : ''}`}
                onClick={() => setExpanded(!expanded)}
              >
                <h2 className="text-lg font-semibold mb-4 text-white">Cursos</h2>
                <p className="text-sm text-white/90">
                </p>
              </div>
            </div>
            <div className="w-full bg-[#101434] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Notificaciones</h2>
              <p className="text-sm text-white/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}