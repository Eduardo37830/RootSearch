const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getGeneratedContentByCourse(courseId) {
  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/materials/course/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching generated content');
    }

    const materials = await response.json();
    
    // Filtrar solo materiales con estado PENDIENTE_REVISION o PUBLICADO
    // y ordenar por fecha más reciente
    if (Array.isArray(materials)) {
      return materials
        .filter(material => 
          material.estado === 'PENDIENTE_REVISION' || material.estado === 'PUBLICADO'
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return [];
  } catch (error) {
    console.error('Error in getGeneratedContentByCourse:', error);
    throw error;
  }
}

export async function publishMaterial(materialId) {
  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/materials/${materialId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error publishing material');
    }

    return response.json();
  } catch (error) {
    console.error('Error in publishMaterial:', error);
    throw error;
  }
}

export async function updateMaterial(materialId, updateData) {
  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/materials/${materialId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Error updating material');
    }

    return response.json();
  } catch (error) {
    console.error('Error in updateMaterial:', error);
    throw error;
  }
}
