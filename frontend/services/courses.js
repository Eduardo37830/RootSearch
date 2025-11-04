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