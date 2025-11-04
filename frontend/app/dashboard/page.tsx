"use client";
import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar";
import { getUserProfile } from "@/services/users";
import { getAllStudents } from "@/services/students";

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || null;

        if (!role || !["profesor", "estudiante"].includes(role.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          return;
        }

        setUser({ name: userData.name, role });

        if (role.toLowerCase() === "profesor") {
          const studentsData = await getAllStudents();
          setStudents(studentsData);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al obtener los datos del usuario o estudiantes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-4">Cargando datos...</div>;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181828] text-white">
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#181828] text-black">
      <SideBar user={user!} />

      <main className="flex-1 flex flex-col gap-4 p-6">
        {user?.role.toLowerCase() === "profesor" ? (
          <>
            <div className="flex flex-col lg:flex-row flex-1 gap-4">
              <div className="flex-1 bg-[#B4AEF6] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-black">Lista de Estudiantes</h2>
                <ul className="text-sm text-black/90">
                  {students.map((student: any) => (
                    <li key={student.id} className="mb-2">
                      {student.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full lg:w-1/3 bg-[#B4AEF6] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-black">Cursos</h2>
                <p className="text-sm text-black/90">
                  Aquí se muestra la cantidad de cursos.
                </p>
              </div>
            </div>
            <div className="w-full bg-[#B4AEF6] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-black">Notificaciones</h2>
              <p className="text-sm text-black/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row flex-1 gap-4">
              <div className="flex-1 bg-[#B4AEF6] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-black">Material de Clase</h2>
                <p className="text-sm text-black/90">
                  Aquí se muestra el material de clase dejado.
                </p>
              </div>
              <div className="w-full lg:w-1/3 bg-[#B4AEF6] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-black">Cursos</h2>
                <p className="text-sm text-black/90">
                  Aquí se muestra la cantidad de cursos.
                </p>
              </div>
            </div>
            <div className="w-full bg-[#B4AEF6] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-black">Notificaciones</h2>
              <p className="text-sm text-black/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}