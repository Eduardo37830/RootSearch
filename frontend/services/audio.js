const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function uploadAudio(courseId, audioFile) {
  try {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('courseId', courseId);

    const response = await fetch(`${API_URL}/audio/transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error uploading audio for transcription');
    }

    return response.json();
  } catch (error) {
    console.error('Error in uploadAudio:', error);
    throw error;
  }
}

export async function transcribeAudio(audioId) {
  try {
    const token = localStorage.getItem('access_token');

    const response = await fetch(`${API_URL}/audio/transcribe/${audioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching transcription');
    }

    return response.json();
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
}
