/**
 * @file tabs.tsx
 * @description Reusable Tab group selector component.
 * Features animated slide highlight transitions (via Framer Motion layoutId)
 * to indicate the active tab selection, supporting icons and text labels.
 */

"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={cn("flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            onChange?.(tab.id)
          }}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
            activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/80"
          )}
        >
          {/* Framer motion active backdrop slide animator */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
