"use client";

import { useEffect, useState } from "react";
import { getAllStudents } from "../../services/students";
import Image from "next/image";

type Student = {
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setLoading(false);
    }
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-[#181828] p-8 text-white font-sans">
      <div className="flex items-center gap-8 mb-8">
        <a
          href="/"
          className="transition-transform duration-200 ease-in-out cursor-pointer hover:scale-110 z-10"
        >
          <Image src="/assets/logo.png" alt="Logo" width={80} height={80} />
        </a>
        <h1 className="text-3xl font-bold">Listado de Estudiantes</h1>
      </div>
      <div className="w-full overflow-x-auto rounded-lg">
        <table className="min-w-[400px] w-full bg-[#23233a] rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left whitespace-nowrap">Nombre</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Correo</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-4 px-4 text-center">Cargando...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={3} className="py-4 px-4 text-center">No hay estudiantes registrados.</td></tr>
            ) : (
              students.map((student, idx) => (
                <tr key={student._id || idx} className="border-b border-[#333]">
                  <td className="py-2 px-4 whitespace-nowrap text-sm md:text-base">{student.name}</td>
                  <td className="py-2 px-4 whitespace-nowrap text-sm md:text-base">{student.email}</td>
                  <td className="py-2 px-4 whitespace-nowrap text-sm md:text-base">{new Date(student.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
