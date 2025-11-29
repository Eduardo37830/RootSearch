"use client";

import { useState } from "react";

const CreateCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: courseName, description }),
    });

    if (response.ok) {
      alert("Course created successfully!");
      setCourseName("");
      setDescription("");
    } else {
      alert("Failed to create course.");
    }
  };

  return (
    <div style={{ backgroundColor: "#181828", color: "#867CED", padding: "20px" }}>
      <h1>Create Course</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course Name:</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            style={{ backgroundColor: "#6356E5", color: "#FFFFFF" }}
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ backgroundColor: "#6356E5", color: "#FFFFFF" }}
          />
        </div>
        <button type="submit" style={{ backgroundColor: "#7165E9", color: "#FFFFFF" }}>
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;