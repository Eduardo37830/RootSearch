"use client";

import { useEffect, useState } from "react";
import { getUserProfile, getAllUsers } from "../../../services/users";
import SideBar from "@/components/SideBar";
import CreateUserModal from "@/components/create_user";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaPlus } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type User = {
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  roles?: Array<{ name: string }>;
};

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"estudiante" | "docente" | "todos">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || "";

        if (role.toLowerCase() !== "administrador") {
          setError("No tienes permisos para acceder a esta sección.");
          setLoading(false);
          return;
        }

        setCurrentUser({ id: userData._id, name: userData.name, role });
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        setError("Error al verificar permisos");
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      if (currentUser) {
        setLoading(true);
        try {
          const allUsers = await getAllUsers();
          setUsers(allUsers);
          setFilteredUsers(allUsers);
        } catch (error) {
          console.error("Error al obtener usuarios:", error);
          setError("Error al cargar usuarios");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUsers();
  }, [currentUser]);

  // Filtrar usuarios por rol y búsqueda
  useEffect(() => {
    let filtered = users;

    // Filtrar por rol
    if (roleFilter !== "todos") {
      filtered = filtered.filter((user) => {
        const userRole = user.roles?.[0]?.name?.toLowerCase() || "";
        return userRole === roleFilter;
      });
    }

    // Filtrar por búsqueda de nombre
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [roleFilter, searchTerm, users]);

  const handleCreateUserSuccess = async () => {
    // Recargar la lista de usuarios
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error al recargar usuarios:", error);
    }
  };

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
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaUsers className="text-[#6356E5] text-xl sm:text-2xl" /> 
            <span className="hidden sm:inline">Gestión de Usuarios</span>
            <span className="sm:hidden">Gestión de Usuarios</span>
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#6356E5] hover:bg-[#4f48c7] text-white p-2 rounded-lg transition cursor-pointer"
            title="Crear nuevo usuario"
          >
            <FaPlus className="text-lg" />
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 sm:mb-6 bg-[#101434] rounded-lg p-4 sm:p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Búsqueda por nombre */}
            <div>
              <label htmlFor="search" className="block text-xs sm:text-sm font-medium mb-2 text-white/70">
                Buscar por nombre
              </label>
              <input
                id="search"
                type="text"
                placeholder="Escribe un nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 sm:px-4 bg-[#1a1a2e] border border-[#333] rounded-lg text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] transition"
              />
            </div>

            {/* Filtro por rol */}
            <div>
              <label htmlFor="roleFilter" className="block text-xs sm:text-sm font-medium mb-2 text-white/70">
                Filtrar por rol
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "estudiante" | "docente" | "todos")}
                className="w-full px-3 py-2 sm:px-4 bg-[#1a1a2e] border border-[#333] rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-[#6356E5] transition cursor-pointer"
              >
                <option value="todos">Todos los usuarios</option>
                <option value="estudiante">Estudiantes</option>
                <option value="docente">Docentes</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
            <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-[#6356E5]/20 rounded-full">
                Búsqueda: "{searchTerm}"
              </span>
            )}
            {roleFilter !== "todos" && (
              <span className="px-3 py-1 bg-[#6356E5]/20 rounded-full flex items-center gap-2">
                {roleFilter === "estudiante" ? (
                  <>
                    <FaUserGraduate /> Estudiantes
                  </>
                ) : (
                  <>
                    <FaChalkboardTeacher /> Docentes
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="w-full overflow-x-auto rounded-lg shadow-lg bg-[#101434]">
          <table className="min-w-[600px] w-full text-sm text-white">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Nombre</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Correo</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Rol</th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Fecha de registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-zinc-400">
                    {searchTerm || roleFilter !== "todos"
                      ? "No se encontraron usuarios con los filtros aplicados."
                      : "No hay usuarios registrados."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const userRole = user.roles?.[0]?.name?.toLowerCase() || "";
                  return (
                    <tr
                      key={user._id || idx}
                      className="border-b border-[#333] cursor-pointer hover:bg-[#2a2a3a] transition"
                      onClick={() => {
                        window.location.href = `/users/view?userId=${user._id}`;
                      }}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm md:text-base flex items-center gap-2 sm:gap-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 ${userRole === "docente" ? "bg-[#28a745]" : "bg-[#6356E5]"} text-white rounded-full flex items-center justify-center text-xs sm:text-base`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{user.name}</span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm md:text-base">
                        <span className="truncate max-w-[120px] sm:max-w-none inline-block">{user.email}</span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm md:text-base">
                        <span className={`px-2 py-1 sm:px-3 rounded-full text-xs font-semibold ${
                          userRole === "docente" 
                            ? "bg-[#28a745]/20 text-[#28a745]" 
                            : "bg-[#6356E5]/20 text-[#6356E5]"
                        }`}>
                          {userRole === "docente" ? "Docente" : "Estudiante"}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm md:text-base">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Crear Usuario */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  );
}
