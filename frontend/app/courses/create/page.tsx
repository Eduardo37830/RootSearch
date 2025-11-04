"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createCourse } from '../../../services/courses';
import { getAllStudents, getAllTeachers} from '@/services/students';
import Toast from "@/components/Toast";
import Image from "next/image";

interface Teacher {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

const CreateCoursePage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacherId: '',
    studentIds: [] as string[],
  });
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  useEffect(() => {
    // Fetch teachers and students
    const fetchData = async () => {
      try {
        const teachersData = await getAllTeachers();
        const studentsData = await getAllStudents();
        setTeachers(teachersData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ message: "Error fetching data: " + (error instanceof Error ? error.message : String(error)), type: "error" });
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (studentId: string) => {
    setFormData((prevData) => {
      const isSelected = prevData.studentIds.includes(studentId);
      const updatedStudentIds = isSelected
        ? prevData.studentIds.filter((id) => id !== studentId)
        : [...prevData.studentIds, studentId];
      return { ...prevData, studentIds: updatedStudentIds };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await createCourse(formData);
      setToast({ message: "Curso creado exitosamente", type: "success" });
      console.log(response);
    } catch (error) {
      console.error('Error creating course:', error);
      setToast({ message: "Error creating course: " + (error instanceof Error ? error.message : String(error)), type: "error" });
    }
  };

  return (
    <div className="bg-[#040418] min-h-screen p-8">
      <div className="flex items-center mb-6">
        <a
          href="/dashboard"
          className="transition-transform duration-200 ease-in-out cursor-pointer hover:scale-110"
        >
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={150}
            height={50}
            className="mr-4"
          />
        </a>
        <h1 className="text-2xl font-bold text-[#00000]">Crear Curso</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-[#f4f4fc] p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-[#101434] font-medium mb-2">Nombre del Curso</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-[#101434] font-medium mb-2">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded text-black"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-[#101434] font-medium mb-2">Profesor</label>
          <select
            name="teacherId"
            value={formData.teacherId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded text-black"
            required
          >
            <option value="">Seleccione un profesor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-[#101434] font-medium mb-2">Estudiantes</label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 p-2 rounded text-black">
            {students.map((student) => (
              <div key={student.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`student-${student.id}`}
                  checked={formData.studentIds.includes(student.id)}
                  onChange={() => handleCheckboxChange(student.id)}
                  className="mr-2"
                />
                <label htmlFor={`student-${student.id}`} className="text-black">
                  {student.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-[#4040ac] text-white px-4 py-2 rounded hover:bg-[#7165E9] transition"
        >
          Crear Curso
        </button>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreateCoursePage;