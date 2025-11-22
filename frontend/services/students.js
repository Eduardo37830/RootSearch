
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
