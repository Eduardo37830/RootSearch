"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import { getAllCourses, getAllCoursesForAdmin, getCourseById } from '../../../services/courses';
import { getUserProfile } from '../../../services/users';
import { uploadAudio } from '../../../services/audio';
import { getGeneratedContentByCourse } from '../../../services/generated-content';
import SideBar from '@/components/SideBar';
import CreateCourseModal from '@/components/create_course';
import Toast from '@/components/Toast';
import { FaBook } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type Course = {
  _id?: string;
  name: string;
  description: string;
  createdAt?: string;
};

export default function CoursesListPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [showPiaaModal, setShowPiaaModal] = useState(false);
  const [selectedCoursePiaa, setSelectedCoursePiaa] = useState<{ name: string; content: string } | null>(null);
  const [showGeneratedContentModal, setShowGeneratedContentModal] = useState(false);
  const [showGeneratedContentListModal, setShowGeneratedContentListModal] = useState(false);
  const [generatedContentsList, setGeneratedContentsList] = useState<any[]>([]);
  const [selectedGeneratedContent, setSelectedGeneratedContent] = useState<{
    _id: string;
    name: string;
    resumen: string;
    glosario: any[];
    quiz: any[];
    checklist: any[];
    estado: string;
    index: number;
  } | null>(null);
  const [loadingGeneratedContent, setLoadingGeneratedContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"resumen" | "glosario" | "quiz" | "checklist">("resumen");
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || "";
        setUser({ id: userData._id, name: userData.name, role });
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        setError("Error al cargar el perfil del usuario");
      }
    }
    fetchUser();
  }, []);

  const fetchCourses = async () => {
    if (user) {
      try {
        setLoading(true);
        let data;
        
        // Si es administrador, obtener todos los cursos
        if (user.role.toLowerCase() === "administrador") {
          data = await getAllCoursesForAdmin();
        } else {
          // Para docentes y estudiantes, usar la ruta normal con filtro de usuario
          data = await getAllCourses(user.id);
        }
        
        setCourses(data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
        setError("Error al cargar los cursos");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleModalSuccess = () => {
    fetchCourses(); // Recargar la lista de cursos después de crear uno nuevo
  };

  const handleGenerateWithAI = async (courseId: string, courseName: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) {
        setToast({ message: 'No se seleccionó ningún archivo', type: 'error' });
        return;
      }

      try {
        setToast({ message: 'Cargando audio...', type: 'info' });
        const result = await uploadAudio(courseId, file);
        setToast({ message: `Audio cargado exitosamente para: ${courseName}`, type: 'success' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setToast({ message: `Error al cargar audio: ${errorMessage}`, type: 'error' });
      }
    };

    fileInput.click();
  };

  const handleShowPiaa = async (courseId: string, courseName: string) => {
    try {
      const courseDetails = await getCourseById(courseId);
      if (courseDetails.piaa_syllabus) {
        setSelectedCoursePiaa({
          name: courseName,
          content: courseDetails.piaa_syllabus,
        });
        setShowPiaaModal(true);
      } else {
        setToast({
          message: `No hay contenido PIAA disponible para: ${courseName}`,
          type: 'info',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setToast({ message: `Error al obtener PIAA: ${errorMessage}`, type: 'error' });
    }
  };

  const handleShowGeneratedContent = async (courseId: string, courseName: string) => {
    try {
      setLoadingGeneratedContent(true);
      setSelectedTab("resumen");
      setSelectedCourseForContent({ id: courseId, name: courseName });
      
      const response = await getGeneratedContentByCourse(courseId);
      
      if (Array.isArray(response) && response.length > 0) {
        setGeneratedContentsList(response);
        setShowGeneratedContentListModal(true);
      } else {
        setToast({
          message: `No hay contenido generado disponible para: ${courseName}`,
          type: 'info',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setToast({ message: `Error al obtener contenido generado: ${errorMessage}`, type: 'error' });
    } finally {
      setLoadingGeneratedContent(false);
    }
  };

  const handleSelectGeneratedContent = (content: any, index: number) => {
    setSelectedGeneratedContent({
      _id: content._id,
      name: selectedCourseForContent?.name || "Curso",
      resumen: content.resumen || "No hay resumen disponible",
      glosario: content.glosario || [],
      quiz: content.quiz || [],
      checklist: content.checklist || [],
      estado: content.estado || "DESCONOCIDO",
      index: index + 1,
    });
    setShowGeneratedContentListModal(false);
    setShowGeneratedContentModal(true);
  };

  // Mínima distancia de swipe requerida (en px)
  const minSwipeDistance = 50;

  const handlePrevious = () => {
    if (isAnimating || courses.length === 0) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? courses.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating || courses.length === 0) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentIndex((prev) => (prev === courses.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  const getPreviousIndex = () => {
    return currentIndex === 0 ? courses.length - 1 : currentIndex - 1;
  };

  const getNextIndex = () => {
    return currentIndex === courses.length - 1 ? 0 : currentIndex + 1;
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
          <h1 className="text-2xl font-semibold mb-2">⚠️ Error</h1>
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

  if (user?.role === 'docente' || user?.role === 'administrador') {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#040418] text-white font-sans">
        <SideBar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8 flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FaBook className="text-[#6356E5] text-xl sm:text-2xl" /> 
              <span className="hidden sm:inline">Listado de Cursos</span>
              <span className="sm:hidden">Cursos</span>
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#6356E5] hover:bg-[#4f48c7] text-white font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
              aria-label="Crear nuevo curso"
              title="Crear nuevo curso"
            >
              +
            </button>
          </div>
          <div className="w-full overflow-x-auto rounded-lg shadow-lg bg-[#101434]">
            <table className="min-w-[600px] w-full text-sm text-white">
              <thead className="bg-[#1a1a2e]">
                <tr>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Nombre</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left whitespace-nowrap text-xs sm:text-sm">Descripción</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-center whitespace-nowrap text-xs sm:text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-6 px-4 text-center">
                      <AiOutlineLoading3Quarters className="animate-spin text-2xl text-[#6356E5] mx-auto" />
                      <span className="block mt-2">Cargando...</span>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 px-4 text-center text-zinc-400">
                      No hay cursos registrados.
                    </td>
                  </tr>
                ) : (
                  courses.map((course, idx) => (
                    <tr
                      key={course._id || idx}
                      className="border-b border-[#333] hover:bg-[#2a2a3a] transition"
                    >
                      <td 
                        className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap text-xs sm:text-sm md:text-base cursor-pointer"
                        onClick={() => window.location.href = `/courses/view?courseId=${course._id}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#6356E5] text-white rounded-full flex items-center justify-center text-xs sm:text-base">
                            {course.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">{course.name}</span>
                        </div>
                      </td>
                      <td 
                        className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base cursor-pointer"
                        onClick={() => window.location.href = `/courses/view?courseId=${course._id}`}
                      >
                        <span className="line-clamp-2">{course.description}</span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                          <button
                            onClick={() => handleShowPiaa(course._id!, course.name)}
                            className="bg-[#6356E5] hover:bg-[#4f48c7] text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                          >
                            <span className="hidden sm:inline">Mostrar PIAA</span>
                            <span className="sm:hidden">PIAA</span>
                          </button>
                          <button
                            onClick={() => handleGenerateWithAI(course._id!, course.name)}
                            className="bg-[#28a745] hover:bg-[#218838] text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                          >
                            <span className="hidden sm:inline">Generar con IA</span>
                            <span className="sm:hidden">IA</span>
                          </button>
                          <button
                            onClick={() => handleShowGeneratedContent(course._id!, course.name)}
                            disabled={loadingGeneratedContent}
                            className="bg-[#fd7e14] hover:bg-[#e06c00] disabled:bg-[#999] disabled:cursor-not-allowed text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg transition font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                          >
                            <span className="hidden sm:inline">Mostrar Contenido</span>
                            <span className="sm:hidden">Contenido</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
        
        {/* Modal de Crear Curso */}
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          teacherId={user.id}
        />

        {/* Modal PIAA */}
        {showPiaaModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101434] p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-white">
                PIAA - {selectedCoursePiaa?.name || ''}
              </h2>
              {selectedCoursePiaa?.content ? (
                <div className="text-white">
                  <pre className="whitespace-pre-wrap bg-[#1a1a2e] p-4 rounded-lg">{selectedCoursePiaa.content}</pre>
                </div>
              ) : (
                <p className="text-zinc-400">No hay PIAA disponible para este curso.</p>
              )}
              <button
                onClick={() => setShowPiaaModal(false)}
                className="mt-6 bg-[#6356E5] hover:bg-[#4f48c7] text-white px-6 py-2 rounded-lg transition font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal: Lista de contenido generado */}
        {showGeneratedContentListModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101434] p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Contenido Generado - {selectedCourseForContent?.name || ''}
              </h2>
              {loadingGeneratedContent ? (
                <div className="flex justify-center py-6">
                  <AiOutlineLoading3Quarters className="animate-spin text-3xl text-[#6356E5]" />
                </div>
              ) : generatedContentsList && generatedContentsList.length > 0 ? (
                <div className="space-y-3">
                  {generatedContentsList.map((content: any) => (
                    <div
                      key={content._id}
                      onClick={() => handleSelectGeneratedContent(content, generatedContentsList.indexOf(content))}
                      className="bg-[#1a1a2e] hover:bg-[#2a2a3a] p-4 rounded-lg transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold">{content.tematica}</h3>
                          <p className="text-zinc-400 text-sm mt-1">{content.tipo_material}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          content.estado === 'PUBLICADO' 
                            ? 'bg-green-500/20 text-green-400'
                            : content.estado === 'PENDIENTE_REVISION'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {content.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-6">
                  No hay contenido generado para este curso.
                </p>
              )}
              <button
                onClick={() => setShowGeneratedContentListModal(false)}
                className="mt-6 bg-[#6356E5] hover:bg-[#4f48c7] text-white px-6 py-2 rounded-lg transition font-semibold cursor-pointer w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal: Detalle del contenido generado */}
        {showGeneratedContentModal && selectedGeneratedContent && !showGeneratedContentListModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#101434] p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-white">
                {selectedGeneratedContent.name}
              </h2>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedGeneratedContent.estado === 'PUBLICADO' 
                    ? 'bg-green-500/20 text-green-400'
                    : selectedGeneratedContent.estado === 'PENDIENTE_REVISION'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedGeneratedContent.estado}
                </span>
              </div>

              {/* Pestañas */}
              <div className="flex gap-2 mb-4 border-b border-[#333]">
                <button
                  onClick={() => setSelectedTab('resumen')}
                  className={`px-4 py-2 font-medium transition cursor-pointer ${
                    selectedTab === 'resumen'
                      ? 'text-[#6356E5] border-b-2 border-[#6356E5]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Resumen
                </button>
                <button
                  onClick={() => setSelectedTab('glosario')}
                  className={`px-4 py-2 font-medium transition cursor-pointer ${
                    selectedTab === 'glosario'
                      ? 'text-[#6356E5] border-b-2 border-[#6356E5]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Glosario
                </button>
                <button
                  onClick={() => setSelectedTab('quiz')}
                  className={`px-4 py-2 font-medium transition cursor-pointer ${
                    selectedTab === 'quiz'
                      ? 'text-[#6356E5] border-b-2 border-[#6356E5]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Quiz
                </button>
                <button
                  onClick={() => setSelectedTab('checklist')}
                  className={`px-4 py-2 font-medium transition cursor-pointer ${
                    selectedTab === 'checklist'
                      ? 'text-[#6356E5] border-b-2 border-[#6356E5]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Checklist
                </button>
              </div>

              {/* Contenido de las pestañas */}
              <div className="text-white">
                {selectedTab === 'resumen' && (
                  <div className="bg-[#1a1a2e] p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">{selectedGeneratedContent.resumen || 'No disponible'}</pre>
                  </div>
                )}
                {selectedTab === 'glosario' && (
                  <div className="bg-[#1a1a2e] p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedGeneratedContent.glosario, null, 2) || 'No disponible'}</pre>
                  </div>
                )}
                {selectedTab === 'quiz' && (
                  <div className="bg-[#1a1a2e] p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedGeneratedContent.quiz, null, 2) || 'No disponible'}</pre>
                  </div>
                )}
                {selectedTab === 'checklist' && (
                  <div className="bg-[#1a1a2e] p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedGeneratedContent.checklist, null, 2) || 'No disponible'}</pre>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedGeneratedContent(null);
                    setShowGeneratedContentListModal(true);
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg transition font-semibold cursor-pointer"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    setShowGeneratedContentModal(false);
                    setSelectedGeneratedContent(null);
                  }}
                  className="flex-1 bg-[#6356E5] hover:bg-[#4f48c7] text-white px-6 py-2 rounded-lg transition font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101434] via-[#242638] to-[#101434] p-4 sm:p-6 md:p-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="transition-transform duration-300 hover:scale-110 focus:outline-none"
          aria-label="Go to dashboard"
        >
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={200}
            height={200}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-30 lg:h-30 object-contain cursor-pointer"
            unoptimized
            quality={100}
          />
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-12 pt-16 sm:pt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">Material All Courses</h1>
          </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            disabled={isAnimating}
            className="hidden md:flex z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#6356E5] hover:bg-[#4f48c7] hover:scale-110 transition-all duration-300 items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            aria-label="Previous course"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-5xl py-4 sm:py-6 md:py-8">
            {loading ? (
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <div className="bg-gradient-to-br from-[#6356E5] to-[#4f48c7] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col justify-center items-center">
                  <AiOutlineLoading3Quarters className="animate-spin text-4xl text-white mb-4" />
                  <span className="text-white text-lg">Cargando cursos...</span>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <div className="bg-gradient-to-br from-[#6356E5] to-[#4f48c7] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col justify-center items-center">
                  <p className="text-white text-xl">No hay cursos disponibles</p>
                </div>
              </div>
            ) : (
              <>
                {/* Previous Card Preview */}
                <div className="hidden lg:block w-48 xl:w-64 transform scale-75 opacity-40 transition-all duration-300">
                  <div className="bg-gradient-to-br from-[#23233a] to-[#2a2a3a] rounded-xl lg:rounded-2xl p-4 lg:p-6 xl:p-8 shadow-xl h-48 lg:h-56 xl:h-64">
                    <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white mb-2 lg:mb-3 xl:mb-4">
                      {courses[getPreviousIndex()]?.name}
                    </h2>
                    <p className="text-gray-300 text-xs lg:text-sm line-clamp-3 lg:line-clamp-4">
                      {courses[getPreviousIndex()]?.description}
                    </p>
                  </div>
                </div>

                {/* Current Card */}
                <div 
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg touch-pan-y"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    key={currentIndex}
                    onClick={() => {
                      if (courses[currentIndex]?._id) {
                        window.location.href = `/courses/view?courseId=${courses[currentIndex]._id}`;
                      }
                    }}
                    className={`bg-gradient-to-br from-[#6356E5] to-[#4f48c7] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col justify-center transform transition-all duration-500 select-none cursor-pointer hover:scale-105 hover:shadow-3xl active:scale-95 ${
                      isAnimating
                        ? direction === 'right'
                          ? 'animate-slide-from-right'
                          : 'animate-slide-from-left'
                        : ''
                    }`}
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
                      {courses[currentIndex]?.name}
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                      {courses[currentIndex]?.description}
                    </p>
                  </div>
                </div>

                {/* Next Card Preview */}
                <div className="hidden lg:block w-48 xl:w-64 transform scale-75 opacity-40 transition-all duration-300">
                  <div className="bg-gradient-to-br from-[#23233a] to-[#2a2a3a] rounded-xl lg:rounded-2xl p-4 lg:p-6 xl:p-8 shadow-xl h-48 lg:h-56 xl:h-64">
                    <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-white mb-2 lg:mb-3 xl:mb-4">
                      {courses[getNextIndex()]?.name}
                    </h2>
                    <p className="text-gray-300 text-xs lg:text-sm line-clamp-3 lg:line-clamp-4">
                      {courses[getNextIndex()]?.description}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="hidden md:flex z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#6356E5] hover:bg-[#4f48c7] hover:scale-110 transition-all duration-300 items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            aria-label="Next course"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 md:mt-12">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating && index !== currentIndex) {
                  setIsAnimating(true);
                  setDirection(index > currentIndex ? 'right' : 'left');
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'w-6 sm:w-8 bg-blue-400'
                  : 'w-1.5 sm:w-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to course ${index + 1}`}
            />
          ))}
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-from-right {
          from {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-from-left {
          from {
            transform: translateX(-100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        .animate-slide-from-right {
          animation: slide-from-right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-from-left {
          animation: slide-from-left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
