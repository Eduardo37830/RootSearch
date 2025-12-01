"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCourseById } from '../../../services/courses';
import { getUserProfile } from '../../../services/users';
import { uploadAudio } from '../../../services/audio';
import { getGeneratedContentByCourse } from '../../../services/generated-content';
import SideBar from '@/components/SideBar';
import Toast from '@/components/Toast';
import { FaBook, FaUser, FaCalendar, FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type Course = {
  _id: string;
  name: string;
  description: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  piaa_syllabus?: string;
  createdAt: string;
  updatedAt: string;
};

export default function CourseViewPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
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

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) {
        setError("No se proporcionó un ID de curso");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error("Error al cargar el curso:", error);
        setError("Error al cargar los datos del curso");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchCourse();
    }
  }, [courseId, user]);

  const handleGenerateWithAI = async () => {
    if (!courseId || !course) return;

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
        await uploadAudio(courseId, file);
        setToast({ message: `Audio cargado exitosamente para: ${course.name}`, type: 'success' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setToast({ message: `Error al cargar audio: ${errorMessage}`, type: 'error' });
      }
    };

    fileInput.click();
  };

  const handleShowGeneratedContent = async () => {
    if (!courseId || !course) return;

    try {
      setLoadingGeneratedContent(true);
      setSelectedTab("resumen");
      
      const response = await getGeneratedContentByCourse(courseId);
      
      if (Array.isArray(response) && response.length > 0) {
        setGeneratedContentsList(response);
        setShowGeneratedContentListModal(true);
      } else {
        setToast({
          message: `No hay contenido generado disponible para este curso`,
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
      name: course?.name || "Curso",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040418] text-white">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-4xl text-[#6356E5] mx-auto mb-4" />
          <span className="text-lg">Cargando curso...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040418] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">⚠️ Error</h1>
          <p className="text-zinc-300 mb-4">{error || "No se pudo cargar el curso"}</p>
          <a
            href="/courses/list"
            className="inline-block bg-[#6356E5] hover:bg-[#4f48c7] text-white px-6 py-3 rounded-lg transition font-semibold cursor-pointer"
          >
            Volver a la lista
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#040418] text-white font-sans">
      <SideBar user={user ?? undefined} />
      
      <main className="flex-1 p-6 md:p-8">
        {/* Header con botón de volver */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/courses/list'}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-4 cursor-pointer"
          >
            <FaArrowLeft />
            <span>Volver a la lista</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-[#6356E5] text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {course.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                {course.name}
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Creado el {new Date(course.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Descripción */}
          <div className="bg-[#101434] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFileAlt className="text-[#6356E5]" />
              Descripción
            </h2>
            <p className="text-zinc-300 leading-relaxed">{course.description}</p>
          </div>

          {/* Profesor */}
          <div className="bg-[#101434] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-[#6356E5]" />
              Profesor
            </h2>
            <div className="space-y-2">
              <p className="text-white font-medium text-lg">{course.teacher.name}</p>
              <p className="text-zinc-400 text-sm">{course.teacher.email}</p>
            </div>
          </div>
        </div>

        {/* PIAA Syllabus */}
        {course.piaa_syllabus && (
          <div className="bg-[#101434] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaBook className="text-[#6356E5]" />
              PIAA - Programa de la Asignatura
            </h2>
            <div className="bg-[#1a1a2e] p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed">
                {course.piaa_syllabus}
              </pre>
            </div>
          </div>
        )}

        {/* Botones de acción (solo para docentes) */}
        {user?.role.toLowerCase() === "docente" && (
          <div className="bg-[#101434] p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFileAlt className="text-[#6356E5]" />
              Acciones del Docente
            </h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleGenerateWithAI}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-3 rounded-lg transition font-semibold cursor-pointer flex items-center gap-2"
              >
                <span>🤖</span> Generar Material con IA
              </button>
            </div>
          </div>
        )}

        {/* Materiales Generados (visible para todos) */}
        <div className="bg-[#101434] p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaBook className="text-[#6356E5]" />
            Materiales Generados
          </h2>
          <button
            onClick={handleShowGeneratedContent}
            disabled={loadingGeneratedContent}
            className="bg-[#fd7e14] hover:bg-[#e06c00] disabled:bg-[#999] disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-semibold cursor-pointer w-full md:w-auto"
          >
            {loadingGeneratedContent ? (
              <span className="flex items-center justify-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin" />
                Cargando...
              </span>
            ) : (
              'Ver Contenido Generado'
            )}
          </button>
        </div>

        {/* Lista de Estudiantes */}
        <div className="bg-[#101434] p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-[#6356E5]" />
            Estudiantes Inscritos
            <span className="ml-2 bg-[#6356E5] text-white text-sm px-3 py-1 rounded-full">
              {course.students.length}
            </span>
          </h2>
          
          {course.students.length === 0 ? (
            <p className="text-zinc-400 text-center py-6">
              No hay estudiantes inscritos en este curso.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.students.map((student) => (
                <div
                  key={student._id}
                  className="bg-[#1a1a2e] p-4 rounded-lg hover:bg-[#2a2a3a] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6356E5] text-white rounded-full flex items-center justify-center font-semibold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-zinc-400 text-sm">{student.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-[#101434] p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-[#6356E5]" />
              <span>Última actualización: {new Date(course.updatedAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div>
              <span>ID: {course._id}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modal Lista de Contenidos Generados */}
      {showGeneratedContentListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101434] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0f0f2e] border-b border-[#2a2a4a] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Contenidos Generados - {course?.name}</h2>
              <button
                onClick={() => {
                  setShowGeneratedContentListModal(false);
                  setGeneratedContentsList([]);
                }}
                className="text-white/60 hover:text-white text-2xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {generatedContentsList.length > 0 ? (
                <div className="space-y-3">
                  {generatedContentsList.map((content: any, index: number) => (
                    <div
                      key={content._id}
                      onClick={() => handleSelectGeneratedContent(content, index)}
                      className="bg-[#0a0a1f] rounded-lg px-4 py-4 border border-[#2a2a4a] hover:border-[#6356E5] cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-[#6356E5] text-white font-bold px-3 py-1 rounded-full text-sm">
                            #{index + 1}
                          </span>
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            content.estado === 'PUBLICADO'
                              ? 'bg-[#28a745] text-white'
                              : content.estado === 'PENDIENTE_REVISION'
                              ? 'bg-[#ffc107] text-black'
                              : 'bg-[#6c757d] text-white'
                          }`}>
                            {content.estado}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm">
                          Generado: {new Date(content.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-white/60">
                          <span>📝 Resumen: {content.resumen ? '✓' : '✗'}</span>
                          <span>📚 Glosario: {content.glosario?.length || 0}</span>
                          <span>❓ Quiz: {content.quiz?.length || 0}</span>
                          <span>✓ Checklist: {content.checklist?.length || 0}</span>
                        </div>
                      </div>
                      <div className="text-[#6356E5] group-hover:translate-x-1 transition">
                        →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/60 text-center py-8">
                  No hay contenido por este momento
                </div>
              )}
            </div>

            <div className="bg-[#0f0f2e] border-t border-[#2a2a4a] px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGeneratedContentListModal(false);
                  setGeneratedContentsList([]);
                }}
                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contenido Generado */}
      {showGeneratedContentModal && selectedGeneratedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101434] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0f0f2e] border-b border-[#2a2a4a] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-[#6356E5] text-white font-bold px-3 py-1 rounded-full text-sm">
                  #{selectedGeneratedContent.index}
                </span>
                <h2 className="text-xl font-semibold text-white">{selectedGeneratedContent.name}</h2>
              </div>
              <button
                onClick={() => {
                  setShowGeneratedContentModal(false);
                  setSelectedGeneratedContent(null);
                }}
                className="text-white/60 hover:text-white text-2xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs */}
            <div className="sticky top-0 bg-[#0f0f2e] border-b border-[#2a2a4a] px-6 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedTab("resumen")}
                className={`px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                  selectedTab === "resumen"
                    ? "border-[#6356E5] text-[#6356E5]"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setSelectedTab("glosario")}
                className={`px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                  selectedTab === "glosario"
                    ? "border-[#6356E5] text-[#6356E5]"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                Glosario ({selectedGeneratedContent.glosario.length})
              </button>
              <button
                onClick={() => setSelectedTab("quiz")}
                className={`px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                  selectedTab === "quiz"
                    ? "border-[#6356E5] text-[#6356E5]"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                Quiz ({selectedGeneratedContent.quiz.length})
              </button>
              <button
                onClick={() => setSelectedTab("checklist")}
                className={`px-4 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                  selectedTab === "checklist"
                    ? "border-[#6356E5] text-[#6356E5]"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                Checklist ({selectedGeneratedContent.checklist.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedTab === "resumen" && (
                <div className="text-white whitespace-pre-wrap break-words bg-[#0a0a1f] rounded px-4 py-3 border border-[#2a2a4a]">
                  {selectedGeneratedContent.resumen}
                </div>
              )}
              
              {selectedTab === "glosario" && (
                <div>
                  {selectedGeneratedContent.glosario.length > 0 ? (
                    <div className="space-y-3">
                      {selectedGeneratedContent.glosario.map((item: any, index: number) => (
                        <div key={index} className="bg-[#0a0a1f] rounded px-4 py-3 border border-[#2a2a4a]">
                          <p className="text-white font-semibold">{item.term || item.termino || `Término ${index + 1}`}</p>
                          <p className="text-white/80 text-sm mt-1">{item.definition || item.definicion || item.description || "Sin definición"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/60 text-center py-8">No hay elementos en el glosario</div>
                  )}
                </div>
              )}
              
              {selectedTab === "quiz" && (
                <div>
                  {selectedGeneratedContent.quiz.length > 0 ? (
                    <div className="space-y-4">
                      {selectedGeneratedContent.quiz.map((item: any, index: number) => (
                        <div key={index} className="bg-[#0a0a1f] rounded px-4 py-3 border border-[#2a2a4a]">
                          <p className="text-white font-semibold mb-2">{index + 1}. {item.pregunta || item.question || `Pregunta ${index + 1}`}</p>
                          {item.opciones && Array.isArray(item.opciones) && (
                            <div className="space-y-2 ml-4">
                              {item.opciones.map((opcion: string, optIndex: number) => (
                                <div key={optIndex} className="text-white/80 text-sm">
                                  <span className="text-[#6356E5]">{"ABCD"[optIndex]}</span> - {opcion}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.respuesta && (
                            <p className="text-[#28a745] text-sm mt-2">Respuesta: {item.respuesta}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/60 text-center py-8">No hay preguntas en el quiz</div>
                  )}
                </div>
              )}
              
              {selectedTab === "checklist" && (
                <div>
                  {selectedGeneratedContent.checklist.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGeneratedContent.checklist.map((item: any, index: number) => (
                        <div key={index} className="bg-[#0a0a1f] rounded px-4 py-3 border border-[#2a2a4a] flex items-start gap-3">
                          <input
                            type="checkbox"
                            disabled
                            defaultChecked={item.completado || item.completed || false}
                            className="mt-1 cursor-not-allowed"
                          />
                          <div>
                            <p className="text-white">{item.tarea || item.item || `Tarea ${index + 1}`}</p>
                            {item.descripcion && (
                              <p className="text-white/60 text-sm">{item.descripcion}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/60 text-center py-8">No hay elementos en el checklist</div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#0f0f2e] border-t border-[#2a2a4a] px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGeneratedContentModal(false);
                  setSelectedGeneratedContent(null);
                }}
                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
