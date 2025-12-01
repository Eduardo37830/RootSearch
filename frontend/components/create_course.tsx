"use client";

import { useState } from 'react';
import { createCourse } from '../services/courses';
import { FaTimes, FaBook } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherId: string;
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess, teacherId }: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    studentIds: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('teacherId', teacherId);
      
      // Agregar studentIds como array si se proporcionan
      if (formData.studentIds.trim()) {
        const studentIdsArray = formData.studentIds.split(',').map(id => id.trim()).filter(id => id);
        studentIdsArray.forEach(id => {
          formDataToSend.append('studentIds[]', id);
        });
      }
      
      // Agregar archivo si se proporciona
      if (file) {
        formDataToSend.append('file', file);
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error creating course');
      }
      
      // Limpiar formulario
      setFormData({ name: '', description: '', studentIds: '' });
      setFile(null);
      
      // Llamar al callback de éxito
      onSuccess();
      
      // Cerrar modal
      onClose();
    } catch (err) {
      setError('Error al crear el curso. Por favor, intenta de nuevo.');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', studentIds: '' });
      setFile(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FaBook className="text-[#6356E5]" />
            Crear Curso
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Curso <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ej: Programación Web"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              rows={4}
              className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Describe el contenido y objetivos del curso..."
            />
          </div>

          {/* Student IDs Field (Optional) */}
          <div>
            <label htmlFor="studentIds" className="block text-sm font-medium text-gray-300 mb-2">
              IDs de Estudiantes <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="text"
              id="studentIds"
              name="studentIds"
              value={formData.studentIds}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="ID1, ID2, ID3 (separados por comas)"
            />
          </div>

          {/* File Upload Field (Optional) */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
              PIA (PDF) <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="file"
              id="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#0f0f1e] border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#6356E5] file:text-white hover:file:bg-[#4f48c7] file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6356E5] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6356E5] to-[#4f48c7] hover:from-[#4f48c7] hover:to-[#6356E5] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                  Creando...
                </>
              ) : (
                'Crear Curso'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
