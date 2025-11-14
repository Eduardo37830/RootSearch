import React, { useState } from 'react';

// Mock de datos de perfil
const mockProfile = {
  nombre: 'Juan Pérez',
  correo: 'juan.perez@universidad.edu',
  foto: 'https://randomuser.me/api/portraits/men/32.jpg',
  departamento: 'Matemáticas',
  telefono: '+52 123 456 7890',
};

// Mock de cursos y estudiantes
const mockCourses = [
  {
    id: 1,
    nombre: 'Álgebra Lineal',
    estudiantes: [
      { id: 1, nombre: 'Ana Gómez' },
      { id: 2, nombre: 'Luis Torres' },
    ],
  },
  {
    id: 2,
    nombre: 'Cálculo Diferencial',
    estudiantes: [
      { id: 3, nombre: 'María López' },
      { id: 4, nombre: 'Carlos Ruiz' },
    ],
  },
];

export default function TeacherPage() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setUploadMessage(`Archivo "${file.name}" cargado correctamente.`);
      setFile(null);
    } else {
      setUploadMessage('Selecciona un archivo para subir.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Panel Docente</h1>

      {/* Apartado de Perfil */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Perfil</h2>
        <div className="flex items-center gap-6">
          <img src={mockProfile.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full border" />
          <div>
            <p><strong>Nombre:</strong> {mockProfile.nombre}</p>
            <p><strong>Correo:</strong> {mockProfile.correo}</p>
            <p><strong>Departamento:</strong> {mockProfile.departamento}</p>
            <p><strong>Teléfono:</strong> {mockProfile.telefono}</p>
          </div>
        </div>
      </section>

      {/* Apartado de Cursos */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Cursos a cargo</h2>
        <div className="flex gap-4">
          {mockCourses.map((curso) => (
            <button
              key={curso.id}
              className={`px-4 py-2 rounded border ${selectedCourse === curso.id ? 'bg-blue-100' : 'bg-gray-100'}`}
              onClick={() => setSelectedCourse(curso.id)}
            >
              {curso.nombre}
            </button>
          ))}
        </div>
        {selectedCourse && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Estudiantes inscritos:</h3>
            <ul className="list-disc pl-6">
              {mockCourses.find(c => c.id === selectedCourse)?.estudiantes.map(est => (
                <li key={est.id}>{est.nombre}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Apartado de Carga de Contenido */}
      <section className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Carga de Contenido</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="audio/*,application/pdf,image/*,video/*"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Subir archivo
          </button>
        </form>
        {uploadMessage && <p className="mt-4 text-green-600">{uploadMessage}</p>}
      </section>
    </div>
  );
}
