"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "../../services/users";
import { getStudentMaterials } from "../../services/students";
import SideBar from "@/components/SideBar";
import { FaBook } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type Material = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
};

export default function HomeWorkPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || "";

        if (role.toLowerCase() !== "estudiante") {
          setError("No tienes permisos para acceder a esta sección.");
          setLoading(false);
          return;
        }

        setCurrentUser({ id: userData._id, name: userData.name, role });
        
        // Intentar cargar los materiales del estudiante
        try {
          const studentMaterials = await getStudentMaterials(userData._id);
          setMaterials(studentMaterials);
        } catch (materialError) {
          console.log("No se pudieron cargar los materiales:", materialError);
          // No mostrar error, solo dejar la lista vacía
        }
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        setError("Error al verificar permisos");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040418] text-white">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-4xl text-[#6356E5] mx-auto mb-4" />
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040418] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">⚠️ Acceso Denegado</h1>
          <p className="text-zinc-300">{error}</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#040418] text-white font-sans">
      <SideBar user={currentUser!} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaBook className="text-[#6356E5] text-xl sm:text-2xl" /> 
            <span>Mis Tareas</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base">
            Aquí podrás ver todas tus tareas y materiales asignados
          </p>
        </div>

        {/* Contenedor de tareas */}
        <div className="bg-[#101434] rounded-lg p-6 shadow-lg">
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="text-6xl text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-300">
                No hay tareas disponibles
              </h2>
              <p className="text-zinc-500">
                Actualmente no tienes tareas asignadas. Cuando tu profesor agregue nuevas tareas, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <div
                  key={material._id}
                  className="bg-[#1a1a2e] rounded-lg p-4 border border-[#333] hover:border-[#6356E5] transition cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2">{material.title}</h3>
                  <p className="text-zinc-400 text-sm mb-3">{material.description}</p>
                  <div className="text-xs text-zinc-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
