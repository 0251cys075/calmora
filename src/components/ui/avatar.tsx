/**
 * @file avatar.tsx
 * @description Reusable Avatar UI helper component.
 * Renders user avatar pictures using a circle cropping frame, or falls back to
 * calculating initials based on user names against a blue/cyan gradient background.
 */

"use client"

import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  // Resolve initials from full user names (max 2 characters, defaults to "?")
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  }

  // Image-based avatar rendering
  if (src) {
    return (
      <div className={cn("relative flex-shrink-0", className)}>
        <img
          src={src}
          alt={name || "Avatar"}
          className={cn("rounded-full object-cover ring-2 ring-white/10", sizeClasses[size])}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
      </div>
    )
  }

  // Initials-based avatar fallback rendering
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white ring-2 ring-white/10",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
