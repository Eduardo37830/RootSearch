"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar";
import { getUserProfile } from "@/services/users";
import { getAllStudents } from "@/services/students";
import { getCoursesByTeacher } from "@/services/courses";
import Toast from "@/components/Toast";

type Course = {
  _id: string;
  name: string;
  teacher: string | { _id: string; name?: string; email?: string };
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
            <div className="flex flex-col lg:flex-row flex-1 gap-4">
              <div className="flex-1 bg-[#101434] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">List of students</h2>
                <ul className="text-sm text-white/90">
                  {students.map((student: any) => (
                    <li key={student.id} className="mb-2">
                      {student.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`w-full lg:w-1/3 bg-[#35448e] rounded-lg shadow p-6 transition-all duration-300 ${expanded ? 'lg:w-full' : ''}`}
                onClick={() => setExpanded(!expanded)}
              >
                <h2 className="text-lg font-semibold mb-4 text-white">Cursos</h2>
                <p className="text-sm text-white/90">
                  {teacherCourses.length > 0 ? (
                    <ul>
                      {teacherCourses.map((course) => (
                        <li key={course._id}>{course.name}</li>
                      ))}
                    </ul>
                  ) : (
                    "No tienes cursos asignados."
                  )}
                </p>
              </div>
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