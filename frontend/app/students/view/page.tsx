"use client";

import { getUserById, getUserProfile } from '@/services/users';
import SideBar from '@/components/SideBar';
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function StudentProfile() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    email: string;
    role: string;
    createdAt: string;
    phone: string;
    address: string;
    birthDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!studentId) {
          setError("ID de estudiante no proporcionado");
          setLoading(false);
          return;
        }

        // Obtener usuario actual (para el sidebar y permisos)
        const currentUserData = await getUserProfile();
        const currentRole = currentUserData.roles?.[0]?.name || "";
        setCurrentUser({ id: currentUserData._id, name: currentUserData.name, role: currentRole });

        // Verificar permisos
        if (!["docente", "administrador"].includes(currentRole.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          setLoading(false);
          return;
        }

        // Obtener información del estudiante
        const studentData = await getUserById(studentId);
        const studentRole = studentData.roles?.[0]?.name || "estudiante";
        
        // Formatear fecha de creación
        const createdDate = new Date(studentData.createdAt);
        const formattedDate = createdDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        setStudentInfo({
          name: studentData.name,
          email: studentData.email,
          role: studentRole.charAt(0).toUpperCase() + studentRole.slice(1),
          createdAt: formattedDate,
          phone: studentData.phone || 'No especificado',
          address: studentData.address || 'No especificado',
          birthDate: studentData.birthDate || 'No especificado',
        });
      } catch (error: any) {
        console.error('Error fetching user info:', error);
        setError(error.message || "Error al cargar la información del estudiante");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

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
    <div className="flex min-h-screen bg-[#040418] text-white">
      
      {/* Sidebar */}
      <SideBar user={currentUser!} />

      {/* Contenido principal */}
      <main className="flex-1 flex justify-center items-center p-10">

        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 w-full max-w-3xl shadow-2xl">

          <div className="bg-[#0f0f1e] bg-opacity-50 rounded-xl p-6">

            {/* Avatar y nombre */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6356E5] to-[#4f48c7] flex items-center justify-center text-4xl font-bold">
                {studentInfo?.name.charAt(0).toUpperCase()}
              </div>
              <p className="mt-4 text-2xl font-bold">{studentInfo?.name}</p>
              <span className="mt-1 px-3 py-1 bg-[#6356E5] bg-opacity-20 text-white rounded-full text-sm">
                {studentInfo?.role}
              </span>
            </div>

            {/* Tabla de información */}
            <div className="grid grid-cols-2 border border-gray-700 rounded-lg overflow-hidden">

              <div className="border-b border-gray-700 p-4 font-medium bg-[#1a1a2e]">Correo</div>
              <div className="border-b border-gray-700 p-4 text-blue-400">
                {studentInfo?.email}
              </div>
              
              <div className="border-b border-gray-700 p-4 font-medium bg-[#1a1a2e]">Fecha de registro</div>
              <div className="border-b border-gray-700 p-4">{studentInfo?.createdAt}</div>

              <div className="border-b border-gray-700 p-4 font-medium bg-[#1a1a2e]">Teléfono</div>
              <div className="border-b border-gray-700 p-4">{studentInfo?.phone}</div>

              <div className="border-b border-gray-700 p-4 font-medium bg-[#1a1a2e]">Dirección</div>
              <div className="border-b border-gray-700 p-4">{studentInfo?.address}</div>

              <div className="p-4 font-medium bg-[#1a1a2e]">Fecha de nacimiento</div>
              <div className="p-4">{studentInfo?.birthDate}</div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
