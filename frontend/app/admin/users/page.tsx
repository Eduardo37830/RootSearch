"use client";

import { useState } from "react";
import { useRouter } from "next/router";

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const router = useRouter();

  // Simulate admin check (replace with real authentication logic)
  const isAdmin = true; // Change this to false to simulate unauthorized access

  if (!isAdmin) {
    return (
      <div style={{ backgroundColor: "#181828", color: "#867CED", padding: "20px" }}>
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, role }),
    });

    if (response.ok) {
      alert("User created successfully!");
      setUsername("");
      setEmail("");
      setRole("student");
    } else {
      alert("Failed to create user.");
    }
  };

  return (
    <div style={{ backgroundColor: "#181828", color: "#867CED", padding: "20px" }}>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ backgroundColor: "#6356E5", color: "#FFFFFF" }}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ backgroundColor: "#6356E5", color: "#FFFFFF" }}
          />
        </div>
        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ backgroundColor: "#6356E5", color: "#FFFFFF" }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ backgroundColor: "#7165E9", color: "#FFFFFF" }}>
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUser;