"use client";

import React, { useState } from "react";

interface PlayerAvatarProps {
  photo: string | null;
  name: string;
  country?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9 text-xs rounded-xl border",
  md: "w-14 h-14 text-sm rounded-2xl border-2",
  lg: "w-28 h-28 md:w-36 md:h-36 text-2xl rounded-3xl border-4",
  xl: "w-32 h-32 md:w-40 md:h-40 text-3xl rounded-3xl border-4",
};

export function PlayerAvatar({
  photo,
  name,
  country,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (strName: string) => {
    const parts = strName.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasPhoto = photo && photo.startsWith("http") && !imgError;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center shrink-0 shadow-lg transition-all ${
        sizeClasses[size]
      } ${
        hasPhoto
          ? "border-kavers-purple dark:border-purple-500 bg-kavers-light dark:bg-kavers-dark"
          : "border-kavers-magenta dark:border-pink-500 bg-gradient-to-br from-kavers-purple/30 to-kavers-magenta/30 dark:from-kavers-purple/40 dark:to-kavers-magenta/40"
      } ${className}`}
    >
      {hasPhoto ? (
        <img
          key={`avatar_img_${name}_${photo}`}
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-1">
          <span className="font-black text-kavers-purple dark:text-purple-300 tracking-wider drop-shadow">
            {getInitials(name)}
          </span>
          {country && (size === "lg" || size === "xl") && (
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mt-0.5 truncate max-w-full px-1">
              {country}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
