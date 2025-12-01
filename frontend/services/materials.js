// Servicios para materiales de cursos

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Descarga un archivo de material por su ID
 * @param {string} id - ID del material
 * @returns {Promise<Blob>} - Archivo descargado
 */
export async function downloadMaterial(id) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/materials/courses/materials/${id}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Material no encontrado.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al descargar el material");
  }

  return await res.blob();
}

/**
 * Obtiene el enlace de acceso a un material por título y courseId
 * @param {string} title - Título del material
 * @param {string} courseId - ID del curso
 * @returns {Promise<Object>} - Objeto con el enlace de acceso
 */
export async function getMaterialAccessByTitle(title, courseId) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const params = new URLSearchParams({
    title,
    courseId,
  });

  const res = await fetch(`${API_URL}/materials/courses/materials/access?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Material no encontrado.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al obtener el enlace de acceso");
  }

  return res.json();
}

/**
 * Obtiene el enlace de acceso a un material por su ID
 * @param {string} id - ID del material
 * @returns {Promise<Object>} - Objeto con el enlace de acceso
 */
export async function getMaterialAccessById(id) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/materials/courses/materials/${id}/access`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Material no encontrado.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al obtener el enlace de acceso");
  }

  return res.json();
}

/**
 * Sube materiales (archivos) a un curso
 * @param {string} courseId - ID del curso
 * @param {Array<File>} files - Array de archivos a subir
 * @param {string} title - Título del material
 * @param {string} description - Descripción del material
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function uploadMaterials(courseId, files, title, description) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const formData = new FormData();
  
  // Agregar cada archivo al FormData
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  // Agregar título y descripción
  if (title) {
    formData.append("title", title);
  }
  if (description) {
    formData.append("description", description);
  }

  const res = await fetch(`${API_URL}/materials/courses/${courseId}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Curso no encontrado.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al subir los materiales");
  }

  return res.json();
}

/**
 * Exporta un material a PDF
 * @param {string} id - ID del material
 * @returns {Promise<Blob>} - PDF generado
 */
export async function exportMaterialToPdf(id) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/materials/${id}/export/pdf`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Material no encontrado.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al exportar el material a PDF");
  }

  return await res.blob();
}

/**
 * Publica un material para hacerlo visible a los estudiantes
 * @param {string} id - ID del material
 * @returns {Promise<Object>} - Material actualizado
 */
export async function publishMaterial(id) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/materials/${id}/publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (res.status === 404) {
    throw new Error("Material no encontrado.");
  }

  if (res.status === 403) {
    throw new Error("No tienes permiso para publicar este material.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al publicar el material");
  }

  return res.json();
}
