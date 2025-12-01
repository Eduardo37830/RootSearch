"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAllCourses } from '../../../services/courses';
import { getUserProfile } from '../../../services/users';
import SideBar from '@/components/SideBar';
import CreateCourseModal from '@/components/create_course';
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
        const data = await getAllCourses(user.id);
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
      <div className="flex min-h-screen bg-[#040418] text-white font-sans">
        <SideBar user={user} />
        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center gap-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FaBook className="text-[#6356E5]" /> Listado de Cursos
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#6356E5] hover:bg-[#4f48c7] text-white font-bold w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
              aria-label="Crear nuevo curso"
            >
              +
            </button>
          </div>
          <div className="w-full overflow-x-auto rounded-lg shadow-lg bg-[#101434]">
            <table className="min-w-[400px] w-full text-sm text-white">
              <thead className="bg-[#1a1a2e]">
                <tr>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Nombre</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Descripción</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Fecha de creación</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center">
                      <AiOutlineLoading3Quarters className="animate-spin text-2xl text-[#6356E5] mx-auto" />
                      <span className="block mt-2">Cargando...</span>
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-zinc-400">
                      No hay cursos registrados.
                    </td>
                  </tr>
                ) : (
                  courses.map((course, idx) => (
                    <tr
                      key={course._id || idx}
                      className="border-b border-[#333] cursor-pointer hover:bg-[#2a2a3a] transition"
                      onClick={() => window.location.href = `/courses/view?courseId=${course._id}`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-sm md:text-base flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#6356E5] text-white rounded-full flex items-center justify-center">
                          {course.name.charAt(0).toUpperCase()}
                        </div>
                        {course.name}
                      </td>
                      <td className="py-3 px-4 text-sm md:text-base">
                        <span className="line-clamp-2">{course.description}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm md:text-base">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm md:text-base">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem('access_token');
                            // Usar fetch para manejar headers si es necesario, o abrir directamente si la auth es por cookie/param
                            // Como es un GET protegido, necesitamos pasar el token.
                            // Si abrimos en nueva pestaña, no enviamos el header Authorization.
                            // Una opción es descargar con fetch y crear un blob url.
                            
                            // Sin embargo, el endpoint usa @UseGuards(JwtAuthGuard).
                            // Si abrimos en nueva pestaña, fallará si no hay cookie.
                            // Asumiremos que el usuario quiere descargar.
                            
                            // Mejor enfoque: fetch con blob.
                            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${course._id}/pia`, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            })
                            .then(response => {
                              if (!response.ok) throw new Error('Error al descargar PIA');
                              return response.blob();
                            })
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `PIA_${course.name.replace(/\s+/g, '_')}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            })
                            .catch(err => {
                              console.error(err);
                              alert('No se pudo descargar el PIA. Asegúrese de que exista.');
                            });
                          }}
                          className="bg-[#6356E5] hover:bg-[#4f48c7] text-white px-3 py-1 rounded text-sm transition z-10 relative"
                        >
                          Ver PIA
                        </button>
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
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-5xl overflow-hidden">
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
                    className={`bg-gradient-to-br from-[#6356E5] to-[#4f48c7] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl h-64 sm:h-72 md:h-80 lg:h-96 flex flex-col justify-center transform transition-all duration-500 select-none ${
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click if any
                        const token = localStorage.getItem('access_token');
                        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/courses/${courses[currentIndex]?._id}/pia`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
                        .then(response => {
                          if (!response.ok) throw new Error('Error al descargar PIA');
                          return response.blob();
                        })
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `PIA_${courses[currentIndex]?.name.replace(/\s+/g, '_')}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        })
                        .catch(err => {
                          console.error(err);
                          alert('No se pudo descargar el PIA. Asegúrese de que exista.');
                        });
                      }}
                      className="mt-4 self-start bg-white text-[#6356E5] px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition shadow-md"
                    >
                      Ver PIA
                    </button>
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
