const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getMaterialsByCourse = async (courseId) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/materials/course/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Error fetching materials');
  return response.json();
};

export const getMaterialById = async (id) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/materials/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Error fetching material');
  return response.json();
};

export const uploadAudioAndGenerate = async (courseId, file) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('file', file);

  const response = await fetch(`${API_URL}/materials/upload-audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Error uploading audio');
  return response.json();
};

export const updateMaterial = async (id, data) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/materials/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error updating material');
  return response.json();
};

export const publishMaterial = async (id) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/materials/${id}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Error publishing material');
  return response.json();
};
