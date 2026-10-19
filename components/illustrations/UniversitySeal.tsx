import React from "react";
import Image from "next/image";

export function UniversitySeal({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/ua-logo.png"
        alt="University of Abra Lagangilang Main Campus Official Logo"
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
