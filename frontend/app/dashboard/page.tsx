"use client";
import { useEffect, useState } from "react";
import React from "react";
import SideBar from "@/components/SideBar";
import { getUserProfile } from "@/services/users";
import { getAllStudents } from "@/services/students";
import { getCoursesByTeacher, getCourseById } from "@/services/courses";
import { uploadAudio } from "@/services/audio";
import { getGeneratedContentByCourse } from "@/services/generated-content";
import Toast from "@/components/Toast";

type Student = {
  _id: string;
  name: string;
  email?: string;
};

type Course = {
  _id: string;
  name: string;
  description?: string;
  teacher: string | { _id: string; name?: string; email?: string };
  students?: Student[] | string[];
};

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [students, setStudents] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
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
    async function fetchData() {
      try {
        const userData = await getUserProfile();
        const role = userData.roles?.[0]?.name || null;

        if (!role || !["docente", "estudiante", "administrador"].includes(role.toLowerCase())) {
          setError("No tienes permisos para acceder a esta sección.");
          return;
        }

        setUser({ id: userData._id, name: userData.name, role });

        if (role.toLowerCase() === "docente" || role.toLowerCase() === "administrador") {
          const studentsData = await getAllStudents();
          setStudents(studentsData);
        }
      } catch (err) {
        const errorMessage =
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message ?? "Error desconocido"
            : "Error desconocido";
        setToast({ message: "Error al cargar datos: " + errorMessage, type: "error" });
        setError("Error al obtener los datos del usuario o estudiantes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchTeacherCourses() {
      if (user?.role.toLowerCase() === "docente" && user.id) {
        const courses: Course[] = await getCoursesByTeacher(user.id);
        setTeacherCourses(courses);
      }
    }
    fetchTeacherCourses();
  }, [user]);

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
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

  if (loading) return <div className="text-white p-4">Cargando datos...</div>;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101434] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">⚠️ Acceso Denegado</h1>
          <p className="text-zinc-300">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#040418] text-black">
      <SideBar user={user!} />

      <main className="flex-1 flex flex-col gap-4 p-6">
        {user?.role.toLowerCase() === "docente"||user?.role.toLowerCase() === "administrador" ? (
          <>
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-4 text-white">Mis Cursos</h2>
              {teacherCourses.length > 0 ? (
                <div className="bg-[#101434] rounded-lg shadow overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead>
                      <tr className="border-b border-[#2a2a4a] bg-[#0f0f2e]">
                        <th className="px-6 py-4 text-left font-semibold">Course name</th>
                        <th className="px-6 py-4 text-left font-semibold">Assigned Students</th>
                        <th className="px-6 py-4 text-center font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherCourses.map((course) => (
                        <React.Fragment key={course._id}>
                          <tr className="border-b border-[#2a2a4a] hover:bg-[#151540] transition">
                            <td className="px-6 py-4 font-medium">{course.name}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleCourseExpansion(course._id)}
                                className="text-[#6356E5] hover:text-[#7a6eff] font-medium cursor-pointer flex items-center gap-2 transition"
                              >
                                <span>{expandedCourses.has(course._id) ? '▼' : '▶'}</span>
                                <span>
                                  {Array.isArray(course.students) && course.students.length > 0
                                    ? `${course.students.length} estudiante${course.students.length > 1 ? 's' : ''}`
                                    : 'Sin estudiantes'}
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex gap-2 justify-center flex-wrap">
                                <button
                                  onClick={() => handleShowPiaa(course._id, course.name)}
                                  className="bg-[#6356E5] hover:bg-[#4f48c7] text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                                >
                                  Mostrar PIAA
                                </button>
                                <button
                                  onClick={() => handleGenerateWithAI(course._id, course.name)}
                                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                                >
                                  Generar con IA
                                </button>
                                <button
                                  onClick={() => handleShowGeneratedContent(course._id, course.name)}
                                  disabled={loadingGeneratedContent}
                                  className="bg-[#fd7e14] hover:bg-[#e06c00] disabled:bg-[#999] text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                                >
                                  {loadingGeneratedContent ? 'Cargando...' : 'Mostrar Contenido Generado'}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedCourses.has(course._id) && Array.isArray(course.students) && course.students.length > 0 && (
                            <tr className="bg-[#0a0a1f] border-b border-[#2a2a4a]">
                              <td colSpan={3} className="px-6 py-4">
                                <div className="space-y-2">
                                  {course.students.map((student: any) => (
                                    <div
                                      key={typeof student === 'string' ? student : student._id}
                                      className="bg-[#151540] rounded px-4 py-2 text-sm text-white flex items-center justify-between"
                                    >
                                      <span>{typeof student === 'string' ? 'ID: ' + student : student.name || 'Estudiante'}</span>
                                      {typeof student !== 'string' && student.email && (
                                        <span className="text-white/60 text-xs">{student.email}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-[#101434] rounded-lg shadow p-6 text-center text-white/70">
                  No tienes cursos asignados.
                </div>
              )}
            </div>
            <div className="w-full bg-[#101434] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Notifications</h2>
              <p className="text-sm text-white/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row flex-1 gap-4">
              <div className="flex-1 bg-[#101434] rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">Material de Clase</h2>
                <p className="text-sm text-white/90">
                  Aquí se muestra el material de clase dejado.
                </p>
              </div>
              <div
                className={`w-full lg:w-1/3 bg-[#35448e] rounded-lg shadow p-6 transition-all duration-300 ${expanded ? 'lg:w-full' : ''}`}
                onClick={() => setExpanded(!expanded)}
              >
                <h2 className="text-lg font-semibold mb-4 text-white">Cursos</h2>
                <p className="text-sm text-white/90">
                </p>
              </div>
            </div>
            <div className="w-full bg-[#101434] rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Notificaciones</h2>
              <p className="text-sm text-white/90">
                Aquí se muestra la cantidad de notificaciones.
              </p>
            </div>
          </>
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modal PIAA */}
      {showPiaaModal && selectedCoursePiaa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101434] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0f0f2e] border-b border-[#2a2a4a] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">PIAA - {selectedCoursePiaa.name}</h2>
              <button
                onClick={() => {
                  setShowPiaaModal(false);
                  setSelectedCoursePiaa(null);
                }}
                className="text-white/60 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="text-white whitespace-pre-wrap break-words bg-[#0a0a1f] rounded px-4 py-3 border border-[#2a2a4a]">
                {selectedCoursePiaa.content}
              </div>
            </div>
            <div className="bg-[#0f0f2e] border-t border-[#2a2a4a] px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPiaaModal(false);
                  setSelectedCoursePiaa(null);
                }}
                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lista de Contenidos Generados */}
      {showGeneratedContentListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101434] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#0f0f2e] border-b border-[#2a2a4a] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Contenidos Generados - {selectedCourseForContent?.name}</h2>
              <button
                onClick={() => {
                  setShowGeneratedContentListModal(false);
                  setGeneratedContentsList([]);
                }}
                className="text-white/60 hover:text-white text-2xl transition"
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
                  Cargando contenidos generados...
                </div>
              )}
            </div>

            <div className="bg-[#0f0f2e] border-t border-[#2a2a4a] px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGeneratedContentListModal(false);
                  setGeneratedContentsList([]);
                }}
                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium"
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
                className="text-white/60 hover:text-white text-2xl transition"
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
                className="bg-[#35448e] hover:bg-[#2a3670] text-white px-4 py-2 rounded-lg transition font-medium"
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