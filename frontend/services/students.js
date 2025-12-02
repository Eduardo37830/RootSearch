const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getAllStudents() {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/users?role=estudiante`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}
export async function getAllTeachers() {
  try {
    const res = await fetch(`${API_URL}/users?role=profesor`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

// Function to fetch user info by ID
export async function getUserInfoById(userId) {
  try {
    const response = await fetch(`/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Error fetching user info: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      name: data.name,
      email: data.email,
    };
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error;
  }
}

// Function to fetch homework/materials by student ID
export async function getStudentMaterials(studentId) {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/materials/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Error fetching materials: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch student materials:', error);
    throw error;
  }
}
