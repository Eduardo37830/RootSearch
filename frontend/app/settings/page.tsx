"use client";

import { useState, useEffect } from 'react';
import { getUserProfile } from '@/services/users';
import { updateUserProfile } from '@/services/users';
import SideBar from '@/components/SideBar';
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type UserData = {
  _id: string;
  name: string;
  email: string;
  roles?: Array<{ _id: string; name: string }>;
  phone?: string;
  address?: string;
  birthDate?: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    roleId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData: UserData = await getUserProfile();
        const role = userData.roles?.[0]?.name || "";
        
        setUser({ id: userData._id, name: userData.name, role });
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          birthDate: userData.birthDate || '',
          roleId: userData.roles?.[0]?._id || '',
        });
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        setError("Error al cargar el perfil del usuario");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar mensajes al editar
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      if (!user?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }
      
      const isAdmin = user.role.toLowerCase() === 'administrador';
      await updateUserProfile(user.id, formData, isAdmin);
      setSuccessMessage('Perfil actualizado exitosamente');
      
      // Actualizar el estado del usuario
      if (user) {
        setUser({ ...user, name: formData.name });
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil. Por favor, intenta de nuevo.');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
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

  return (
    <div className="flex min-h-screen bg-[#040418] text-white font-sans">
      <SideBar user={user!} />
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Configuración de Perfil</h1>
            <p className="text-gray-400">Actualiza tu información personal</p>
          </div>

          {/* Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#6356E5] to-[#4f48c7] rounded-full flex items-center justify-center text-4xl font-bold mb-4">
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-gray-400">ID: {user?.id}</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-white text-md text-center">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Correo Electrónico <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone and Birth Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                {/* Birth Date Field */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="text"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              {/* Row 3: Address (full width) */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Calle 123 # 45-67"
                />
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol {user?.role.toLowerCase() !== 'administrador' && <span className="text-xs text-gray-500">(Solo lectura)</span>}
                </label>
                {user?.role.toLowerCase() === 'administrador' ? (
                  <input
                    type="text"
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="ID del rol"
                  />
                ) : (
                  <div className="px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-gray-400">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'N/A'}
                  </div>
                )}
                {user?.role.toLowerCase() !== 'administrador' && (
                  <p className="mt-1 text-xs text-gray-500">Solo los administradores pueden modificar roles</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim() || !formData.email.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#6356E5] to-[#4f48c7] hover:from-[#4f48c7] hover:to-[#6356E5] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
