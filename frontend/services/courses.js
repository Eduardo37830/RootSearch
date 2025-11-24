const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function createCourse(courseData) {
  const response = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    throw new Error('Error creating course');
  }

  return response.json();
}

export async function getCoursesByTeacher(teacherId) {
  const token = localStorage.getItem('access_token'); // Usar la clave correcta

  const response = await fetch(`${API_URL}/courses/by-teacher/${encodeURIComponent(teacherId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching courses for teacher');
  }

  return response.json();
}

export async function getAllCourses() {
  const response = await fetch(`${API_URL}/courses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching all courses');
  }

  return response.json();
}