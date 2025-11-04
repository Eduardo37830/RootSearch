"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  const [toastClosing, setToastClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToastClosing(true);
      setTimeout(onClose, 500); // Match this duration with the CSS animation duration
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
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${color} animate-slide-in-right`}
      style={{ animation: toastClosing ? "slide-out-right 0.5s forwards" : undefined }}
    >
      {message}
    </div>
  );
}
