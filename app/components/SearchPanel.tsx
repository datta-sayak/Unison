"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  channel: string
  duration: string
  thumbnail: string
}

interface SearchPanelProps {
  onAddSong: (song: SearchResult) => void
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "1",
    title: "Midnight City",
    channel: "M83",
    duration: "3:41",
    thumbnail: "/abstract-soundscape.png",
  },
  {
    id: "2",
    title: "Blinding Lights",
    channel: "The Weeknd",
    duration: "3:20",
    thumbnail: "/abstract-soundscape.png",
  },
  {
    id: "3",
    title: "Take Me Out",
    channel: "Franz Ferdinand",
    duration: "4:05",
    thumbnail: "/abstract-soundscape.png",
  },
  {
    id: "4",
    title: "Do Not Disturb",
    channel: "The Weeknd",
    duration: "3:50",
    thumbnail: "/abstract-soundscape.png",
  },
]

export function SearchPanel({ onAddSong }: SearchPanelProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    setHasSearched(true)
    setResults(
      MOCK_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) || r.channel.toLowerCase().includes(query.toLowerCase()),
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-card border-border rounded-xl h-11 focus:border-accent transition-colors"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 rounded-xl transition-colors font-medium"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-2">
        {results.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
        )}

        {results.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all group"
          >
            <img
              src={song.thumbnail || "/placeholder.svg"}
              alt={song.title}
              className="w-10 h-10 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                {song.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {song.channel} • {song.duration}
              </p>
            </div>
            <Button
              onClick={() => onAddSong(song)}
              size="icon"
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 w-8 flex-shrink-0 transition-colors"
              title="Add to queue"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {hasSearched && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6" />
            </div>
            <p className="font-medium">No songs found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {!hasSearched && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <div className="text-lg font-bold text-accent/50">+</div>
            </div>
            <p className="font-medium text-sm">Start searching</p>
            <p className="text-xs mt-1">Find your favorite songs</p>
          </div>
        )}
      </div>
    </div>
  )
}
