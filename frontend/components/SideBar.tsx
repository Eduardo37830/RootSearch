import React, { useState } from "react";

interface User {
  name: string;
  role: string;
}

interface SideBarProps {
  user?: User; // Hacer que el prop sea opcional
}

export default function SideBar({ user }: SideBarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <>
      {/* Botón de hamburguesa para móvil */}
      <button
        className={`lg:hidden fixed top-4 right-4 z-50 bg-[#867CED] text-white p-2 rounded-md transition-all duration-300 ${
          isMobileMenuOpen ? "top-1/2 transform -translate-y-1/2" : "top-4"
        }`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isMinimized ? "w-16" : "w-48"
        } h-70vh bg-[#6356E5] text-white flex flex-col py-4 shadow-lg transition-all duration-300 fixed lg:relative z-40 lg:z-auto mb-2 mt-2 ml-2 rounded-lg ${
          isMobileMenuOpen ? "block" : "hidden lg:flex"
        }`}
      >
        {/* Logotipo y título */}
        <div
          className={`flex items-center ${
            isMinimized ? "justify-center" : "justify-start px-4"
          } mb-6`}
        >
          <img
            src="/assets/black_logo.png"
            alt="RootSearch Logo"
            className={`w-8 h-8 ${
              isMinimized ? "mx-auto" : "mr-2"
            }`}
          />
          {!isMinimized && <h1 className="text-md font-bold">RootSearch</h1>}
        </div>

        {/* Menú principal */}
        <nav
          className={`flex flex-col gap-4 w-full transition-all duration-300 ${
            isMinimized ? "items-center px-0" : "px-4"
          }`}
        >
          <div className="mb-4">
            <h2
              className={`text-xs font-bold text-black mb-2 ${
                isMinimized ? "hidden" : "block"
              }`}
            >
              Main Menu
            </h2>
            <a
              href="/dashboard"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
            >
              <span>📊</span>
              {!isMinimized && "Dashboard"}
            </a>
            {user?.role === "teacher" ? (
              <a
                href="/reports"
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
              >
                <span>📋</span>
                {!isMinimized && "Reports"}
              </a>
            ) : (
              <a
                href="/homeworks"
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
              >
                <span>📚</span>
                {!isMinimized && "HomeWorks"}
              </a>
            )}
            <a
              href="/courses"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
            >
              <span>✏️</span>
              {!isMinimized && "Courses"}
            </a>
          </div>

          {/* General */}
          <div className="mb-4">
            <h2
              className={`text-xs font-bold text-black mb-2 ${
                isMinimized ? "hidden" : "block"
              }`}
            >
              General
            </h2>
            <a
              href="/notifications"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
            >
              <span>🔔</span>
              {!isMinimized && "Notifications"}
            </a>
            <a
              href="/reports"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
            >
              <span>📋</span>
              {!isMinimized && "Reports"}
            </a>
          </div>

          {/* Cuenta */}
          <div className="mb-4">
            <h2
              className={`text-xs font-bold text-black mb-2 ${
                isMinimized ? "hidden" : "block"
              }`}
            >
              Account
            </h2>
            <a
              href="/settings"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
            >
              <span>⚙️</span>
              {!isMinimized && "Settings"}
            </a>
            <a
              href="/"
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#7165E9] transition"
              onClick={() => {
                localStorage.removeItem("access_token");
              }}
            >
              <img
                src="/assets/iconos/logout.png"
                alt="Logout Icon"
                className="w-4 h-4 ml-1"
              />
              {!isMinimized && "Logout"}
            </a>
          </div>
        </nav>

        {/* Información del usuario */}
        <div
          className={`mt-auto w-full flex items-center gap-4 px-4 py-4 border-t border-black ${
            isMinimized ? "justify-center" : "justify-start"
          }`}
        >
          <img
            src="/assets/avatar.png"
            alt="User Avatar"
            className="w-9 h-9 rounded-full"
          />
          {!isMinimized && (
            <div>
              <p className="text-xs font-bold">{user?.name || "Name User"}</p>
              <p className="text-xs text-black/90">
                {user?.role ? formatRole(user.role) : "Role"}
              </p>
            </div>
          )}
        </div>

        {/* Botón de expandir/contraer */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className={`
            absolute top-1/2 right-[-12px] transform -translate-y-1/2
            flex items-center justify-center
            w-5 h-5 rounded-md
            bg-[#6356E5] text-white
            hover:scale-110 hover:brightness-110 transition-all duration-300
            lg:block hidden
          `}
        >
          <img
            src="/assets/flecha.png"
            alt="toggle sidebar"
            className={`w-5 h-5 transition-transform duration-300 ${
              isMinimized ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>
      </aside>
    </>
  );
}
