"use client"

import { Music } from "lucide-react"
import type { Song } from "@/lib"

interface YouTubePlayerSectionProps {
  currentSong: Song | null
}

export function YouTubePlayerSection({ currentSong }: YouTubePlayerSectionProps) {
  return (
    <div className="bg-card">
      <div className="aspect-video w-full max-w-4xl mx-auto bg-black">
        {/* YouTube Player Placeholder - Replace with actual YouTube embed */}
        {currentSong ? (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${currentSong.id}`}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen>
          </iframe>
        ) : (
          <div className="text-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Music className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold">No song playing</p>
            <p className="text-sm text-white/70">Add songs to the queue to start listening</p>
          </div>
        )}
      </div>
    </div>
  )
}