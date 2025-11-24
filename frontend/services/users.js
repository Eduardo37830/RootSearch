// Servicios para usuarios: login y registro

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 401) {
    return { error: "Credenciales inválidas" };
  }
  if (!res.ok) {
    const errorText = await res.text();
    return { error: errorText || "Error al iniciar sesión" };
  }

  const data = await res.json();

  // Guardar el token en localStorage
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }

  return data;
}

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  if (res.status === 409) {
    return { error: "El email ya está registrado" };
  }
  if (!res.ok) {
    const errorText = await res.text();
    return { error: errorText || "Error al registrar usuario" };
  }
  return res.json();
}

export async function getUserProfile() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al obtener el perfil del usuario");
  }

  return res.json();
}

export async function verifyCode({ email, code }) {
  const res = await fetch(`${API_URL}/auth/verify-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  if (res.status === 401) {
    return { error: "Código inválido o expirado" };
  }

  if (!res.ok) {
    const errorText = await res.text();
    return { error: errorText || "Error al verificar el código" };
  }

  return res.json();
}

export async function getUserById(userId) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró un token de acceso. Por favor, inicia sesión.");
  }

  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    throw new Error("Usuario no encontrado.");
  }

  if (res.status === 401) {
    throw new Error("No autorizado. El token puede haber expirado. Por favor, inicia sesión nuevamente.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error al obtener el usuario");
  }

  return res.json();
}
