"use client"

import { useState } from "react"
import { UserAvatar } from "@/components/UserAvatar"
import { ThemeSelector } from "@/components/ThemeSelector"
import { Button } from "@/components/ui/button"
import { Sun } from "lucide-react"

export function AppHeader() {
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border backdrop-blur-xl">
        <div className="flex items-center px-4 md:px-6 py-3 max-w-full">
          <Button
            onClick={() => setShowThemeSelector(true)}
            variant="ghost"
            className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors flex items-center gap-2"
            title="Change theme and appearance"
          >
            <Sun className="h-5 w-5" />
            Theme
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black text-foreground tracking-wide">Unison</h1>
          </div>
          <UserAvatar />
        </div>
      </header>
      {showThemeSelector && <ThemeSelector onClose={() => setShowThemeSelector(false)} />}
    </>
  )
}
