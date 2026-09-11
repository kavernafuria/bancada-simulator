"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, TrendingUp, Drum, Sun, Moon } from "lucide-react";

export function FloatingDock() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const isEloPerdido = pathname === "/";
  const isHigherLower = pathname?.startsWith("/higher-lower");
  const isBancada = pathname?.startsWith("/bancada");

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto max-w-fit z-30 px-4">
      <div className="flex items-center gap-2 p-1.5 rounded-full glass-panel shadow-2xl border border-kavers-border/60 backdrop-blur-xl">
        {/* Simulador de Torcida Organizada Badge */}
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black shadow-lg shadow-amber-500/30">
          <Drum className="w-4 h-4 stroke-[2.5]" />
          <span>Simulador de Torcida</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Mudar para Tema Claro (Gazeta)" : "Mudar para Tema Escuro (Estádio)"}
          className={`p-2.5 rounded-full transition-all duration-300 transform active:scale-90 ${
            isDark
              ? "text-amber-400 hover:bg-kavers-card/90"
              : "text-zinc-800 hover:bg-paper-border/60"
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 animate-spin-once text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 animate-spin-once text-indigo-700" />
          )}
        </button>
      </div>
    </div>
  );
}
