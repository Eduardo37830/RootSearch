"use client";

import React, { useState, useEffect } from 'react';
import SideBar from '@/components/SideBar';
import { getUserProfile } from '@/services/users';
import { getAllCourses } from '@/services/courses';
import { getMaterialsByCourse, uploadAudioAndGenerate, updateMaterial, publishMaterial } from '@/services/materials';
import { AiOutlineLoading3Quarters, AiOutlineCloudUpload, AiOutlineEdit, AiOutlineEye, AiOutlineCheck } from 'react-icons/ai';
import { FaBook, FaFileAudio } from 'react-icons/fa';
import Toast from "@/components/Toast";

export default function MaterialsPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ resumen: '' });

  useEffect(() => {
    async function init() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || "";
        setUser({ ...userData, role });

        const coursesData = await getAllCourses(userData._id);
        setCourses(coursesData);
        
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0]._id);
        }
      } catch (error) {
        console.error(error);
        setToast({ message: "Error al cargar datos iniciales", type: "error" });
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMaterials(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchMaterials = async (courseId: string) => {
    setLoading(true);
    try {
      const data = await getMaterialsByCourse(courseId);
      setMaterials(data);
    } catch (error) {
      console.error(error);
      setToast({ message: "Error al cargar materiales", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    setToast({ message: "Subiendo audio y generando contenido... Esto puede tardar unos minutos.", type: "info" });

    try {
      await uploadAudioAndGenerate(selectedCourse, file);
      setToast({ message: "Material generado exitosamente. Revisa el borrador.", type: "success" });
      fetchMaterials(selectedCourse);
    } catch (error) {
      console.error(error);
      setToast({ message: "Error al generar material", type: "error" });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handlePublish = async (materialId: string) => {
    if (!confirm("¿Estás seguro de publicar este material? Se enviará una notificación y será visible para los estudiantes.")) return;
    
    try {
      await publishMaterial(materialId);
      setToast({ message: "Material publicado exitosamente", type: "success" });
      fetchMaterials(selectedCourse);
    } catch (error) {
      console.error(error);
      setToast({ message: "Error al publicar material", type: "error" });
    }
  };

  const openEditModal = (material: any) => {
    setCurrentMaterial(material);
    setEditFormData({ resumen: material.resumen || '' });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentMaterial) return;
    
    try {
      await updateMaterial(currentMaterial._id, { resumen: editFormData.resumen });
      setToast({ message: "Material actualizado", type: "success" });
      setIsEditModalOpen(false);
      fetchMaterials(selectedCourse);
    } catch (error) {
      console.error(error);
      setToast({ message: "Error al actualizar material", type: "error" });
    }
  };

  if (!user) return <div className="min-h-screen bg-[#040418] flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-[#040418] text-white font-sans">
      <SideBar user={user} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-4">
            <FaBook className="text-[#6356E5]" /> Materiales Generados con IA
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#101434] p-4 rounded-lg">
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-gray-400 mb-1">Seleccionar Curso</label>
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 bg-[#1a1a2e] border border-gray-700 rounded text-white focus:outline-none focus:border-[#6356E5]"
              >
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.name}</option>
                ))}
              </select>
            </div>

            {(user.role === 'docente' || user.role === 'administrador') && (
              <div className="w-full md:w-auto">
                <label 
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded cursor-pointer transition ${uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#6356E5] hover:bg-[#4f48c7]'}`}
                >
                  {uploading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineCloudUpload className="text-xl" />}
                  <span>{uploading ? 'Procesando...' : 'Subir Audio de Clase'}</span>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleUploadAudio}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-[#6356E5]" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FaFileAudio className="text-6xl mx-auto mb-4 opacity-50" />
            <p>No hay materiales generados para este curso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material._id} className="bg-[#101434] rounded-xl p-6 shadow-lg border border-gray-800 hover:border-[#6356E5] transition">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${material.estado === 'PUBLICADO' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {material.estado}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-1">Material de Clase</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {material.resumen || "Sin resumen disponible..."}
                </p>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => openEditModal(material)}
                    className="flex-1 bg-[#1a1a2e] hover:bg-[#252540] py-2 rounded flex items-center justify-center gap-2 transition"
                  >
                    {(user.role === 'docente' || user.role === 'administrador') ? <AiOutlineEdit /> : <AiOutlineEye />}
                    <span>{(user.role === 'docente' || user.role === 'administrador') ? 'Editar/Ver' : 'Ver'}</span>
                  </button>
                  
                  {(user.role === 'docente' || user.role === 'administrador') && material.estado !== 'PUBLICADO' && (
                    <button 
                      onClick={() => handlePublish(material._id)}
                      className="bg-green-600 hover:bg-green-700 px-3 rounded flex items-center justify-center transition"
                      title="Publicar"
                    >
                      <AiOutlineCheck />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && currentMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#101434] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {(user.role === 'docente' || user.role === 'administrador') ? 'Editar Material' : 'Ver Material'}
                </h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#6356E5] mb-2">Resumen Generado</label>
                  {(user.role === 'docente' || user.role === 'administrador') ? (
                    <textarea
                      value={editFormData.resumen}
                      onChange={(e) => setEditFormData({ ...editFormData, resumen: e.target.value })}
                      className="w-full h-64 bg-[#0a0a12] border border-gray-700 rounded p-4 text-white focus:outline-none focus:border-[#6356E5]"
                    />
                  ) : (
                    <div className="bg-[#0a0a12] p-4 rounded text-gray-300 whitespace-pre-wrap">
                      {currentMaterial.resumen}
                    </div>
                  )}
                </div>

                {/* Read-only sections for now */}
                {currentMaterial.quiz && currentMaterial.quiz.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#6356E5] mb-2">Quiz Generado</h3>
                    <div className="space-y-4">
                      {currentMaterial.quiz.map((q: any, idx: number) => (
                        <div key={idx} className="bg-[#1a1a2e] p-4 rounded">
                          <p className="font-bold mb-2">{idx + 1}. {q.pregunta}</p>
                          <ul className="list-disc list-inside text-sm text-gray-400 pl-4">
                            {q.opciones.map((opt: string, i: number) => (
                              <li key={i} className={opt === q.respuestaCorrecta ? "text-green-400" : ""}>{opt}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                >
                  Cerrar
                </button>
                {(user.role === 'docente' || user.role === 'administrador') && (
                  <button 
                    onClick={handleSaveEdit}
                    className="px-4 py-2 rounded bg-[#6356E5] hover:bg-[#4f48c7] transition"
                  >
                    Guardar Cambios
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </main>
    </div>
  );
}
