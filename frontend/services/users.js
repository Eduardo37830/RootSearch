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
  return res.json();
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
