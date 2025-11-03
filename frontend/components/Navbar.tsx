import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-0">
      {/* Lado izquierdo */}
      <div className="flex items-center justify-start bg-[#6356E5] py-4 px-8 rounded-r-3xl gap-4">
        <AnimatedButton href="/users/login">Login</AnimatedButton>
        <AnimatedButton href="/users/register">Register</AnimatedButton>
      </div>

      {/* Centro invisible */}
      <div className="flex-1 bg-[#181828]"></div>

      {/* Lado derecho */}
      <div className="flex items-center justify-end bg-[#6356E5] py-4 px-8 rounded-l-3xl gap-4">
        <AnimatedButton href="#">More Info</AnimatedButton>
        <AnimatedButton href="#">Contact us</AnimatedButton>
      </div>
    </nav>
  );
}

interface AnimatedButtonProps {
  href: string;
  children: React.ReactNode;
}

function AnimatedButton({ href, children }: AnimatedButtonProps) {
  return (
    <a
      href={href}
      className="relative bg-[#181828] border border-[#181828] text-white px-6 py-2 rounded-full font-semibold transition overflow-hidden group shadow-none"
    >
      {/* Fondo animado */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#7165E9] to-[#474777] opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out rounded-full"></span>

      {/* Texto */}
      <span className="relative z-10">{children}</span>
    </a>
  );
}
