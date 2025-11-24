"use client";

import { getUserById } from '@/services/users';
import SideBar from '@/components/SideBar';
import { useState, useEffect } from "react";
import Image from 'next/image';

interface StudentProfileParams {
  id: string;
}

export default function StudentProfile({ params }: { params: StudentProfileParams }) {
  const { id } = params;

  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: 'NameStudent',
    email: 'example@email.com',
    cumulativeAverage: 3.7,
    tel: '300301302',
    dateOfBirth: '16/07/2004',
    gender: 'M',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserById(id);
        const role = userData.roles?.[0]?.name || "";

        if (!["docente", "administrador"].includes(role.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          return;
        }

        setUser({ id: userData._id, name: userData.name, role });
        setUserInfo((prev) => ({
          ...prev,
          name: userData.name,
          email: userData.email
        }));
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
    fetchUser();
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101434] text-white">
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
    <div className="flex min-h-screen bg-[#181828] text-white">
      
      {/* Sidebar como tenías */}
      <SideBar user={user!} />

      {/* Contenido principal ocupando TODA la pestaña */}
      <main className="flex-1 flex justify-center items-center p-10">

        <div className="bg-[#23233a] rounded-xl p-6 w-[1000px] shadow-xl">


          <div className="bg-[#73808e54] rounded-xl p-5">

            {/* Avatar */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-20 h-20 rounded-full bg-[#8fa3b7] flex items-center justify-center">
                <Image src="/assets/avatar.png" width={40} height={40} alt="avatar" />
              </div>
              <p className="mt-3 text-lg font-bold">{userInfo.name}</p>
            </div>

            {/* Tabla */}
            <div className="grid grid-cols-2 border border-gray-400 rounded-lg text-sm">

              <div className="border-b border-gray-400 p-2 font-medium">Email</div>
              <div className="border-b border-gray-400 p-2 text-blue-300 underline">
                {userInfo.email}
              </div>

              <div className="border-b border-gray-400 p-2 font-medium">Cumulative average</div>
              <div className="border-b border-gray-400 p-2">{userInfo.cumulativeAverage}</div>

              <div className="border-b border-gray-400 p-2 font-medium">Tel</div>
              <div className="border-b border-gray-400 p-2">{userInfo.tel}</div>

              <div className="border-b border-gray-400 p-2 font-medium">Date of birth</div>
              <div className="border-b border-gray-400 p-2">{userInfo.dateOfBirth}</div>

              <div className="p-2 font-medium">Gender</div>
              <div className="p-2">{userInfo.gender}</div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
