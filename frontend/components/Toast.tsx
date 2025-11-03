"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-blue-600";

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${color} animate-slide-in-right`}>
      {message}
    </div>
  );
}
