"use client"

import { useState, Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SearchPanel } from "@/components/SearchPanel"
import { QueuePanel } from "@/components/QueuePanel"
import { Copy, LogOut, Send, Shield, X, Menu } from "lucide-react"
import { useSession } from "next-auth/react";
import InvalidRoomPage from "./[roomId]/page";
import { useRouter, useSearchParams } from "next/navigation";

interface Song {
  id: string
  title: string
  channel: string
  requestedBy: string
  thumbnail: string
  votes: number
  duration: string
}

interface Participant {
  id: string
  name: string
  avatar: string
  isHost: boolean
  isActive: boolean
  device: string
}

interface SongInput {
  id: string
  title: string
  channel: string
  thumbnail: string
}

interface ChatMessage {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: string
}

function RoomPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("id")
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, router])
  

  const [queue, setQueue] = useState<Song[]>([
    {
      id: "1",
      title: "Midnight City",
      channel: "M83",
      requestedBy: "You",
      thumbnail: "/abstract-soundscape.png",
      votes: 5,
      duration: "3:41",
    },
  ])

  const [participants] = useState<Participant[]>([
    { id: "1", name: "You", avatar: "AB", isHost: true, isActive: true, device: "Desktop" },
    { id: "2", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "3", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "4", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "5", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "6", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "7", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "8", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "9", name: "Alex", avatar: "AJ", isHost: false, isActive: true, device: "Mobile" },
    { id: "10", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "11", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "12", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "13", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "14", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "15", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "16", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "17", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "18", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
    { id: "19", name: "Jordan", avatar: "JD", isHost: false, isActive: false, device: "Desktop" },
  ])

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "You", avatar: "AB", message: "Just added Midnight City!", timestamp: "2:30 PM" },
    { id: "2", user: "Alex", avatar: "AJ", message: "Great song choice", timestamp: "2:32 PM" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const [copied, setCopied] = useState(false)
  const [isHost] = useState(true)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const handleAddSong = (song: SongInput) => {
    const newSong: Song = {
      ...song,
      requestedBy: "User",
      votes: 0,
      duration: "3:45",
    }
    setQueue([...queue, newSong])
  }

  const handleVote = (id: string, direction: "up" | "down") => {
    setQueue(
      queue.map((song) =>
        song.id === id ? { ...song, votes: direction === "up" ? song.votes + 1 : Math.max(0, song.votes - 1) } : song,
      ),
    )
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join?roomId=${roomId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const message: ChatMessage = {
      id: String(messages.length + 1),
      user: "You",
      avatar: "AB",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([...messages, message])
    setNewMessage("")
  }

  const activeUsers = participants.filter((p) => p.isActive).length
  if (!roomId)  return <InvalidRoomPage /> 

  return (
    <main className="min-h-screen bg-background flex">
      {/* Header Sidebar - Fixed Overlay */}
      <div className={`fixed bottom-0 left-0 right-0 lg:top-14 lg:left-0 lg:w-64 z-30 bg-card border-t lg:border-t-0 lg:border-r border-border flex flex-col shadow-sm transition-transform duration-300 lg:translate-y-0 max-h-[80vh] lg:max-h-none ${
        showMobileSidebar ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-2 right-2">
          <Button
            onClick={() => setShowMobileSidebar(false)}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-accent h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Header Content */}
        <div className="hidden lg:block p-6 border-b border-border">
          <div className="space-y-4">
            {/* SyncRoom Title */}
            <div className="text-center">
              <p className="text-xl font-bold text-foreground tracking-tight font-mono drop-shadow-sm">
                SyncRoom
              </p>
            </div>

            {/* Host Badge */}
            {isHost && (
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-accent/20 border border-accent/40 text-sm font-semibold text-accent shadow-sm">
                  <Shield className="h-4 w-4" />
                  Host
                </span>
              </div>
            )}

            {/* Share Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-colors shadow-sm font-medium w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Active ({participants.filter((p) => p.isActive).length})
            </h2>
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] pb-2">
                {participants
                  .filter((p) => p.isActive)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-[60px]"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                          {user.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="text-center min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate flex items-center justify-center gap-1">
                          {user.name}
                          {user.isHost && <Shield className="h-2 w-2 text-accent flex-shrink-0" />}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.device}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Scroll indicator gradient */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none opacity-60"></div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Inactive
            </h3>
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] pb-2">
                {participants
                  .filter((p) => !p.isActive)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-[60px] opacity-60"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {user.avatar}
                        </div>
                      </div>
                      <div className="text-center min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.device}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Scroll indicator gradient */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none opacity-60"></div>
            </div>
          </div>

          {/* Chat Section - Mobile Only */}
          <div className="pt-4 border-t border-border lg:hidden">
            <div className="space-y-4">
              {/* Chat Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Room Chat
                </h3>
              </div>

                {/* Chat Messages */}
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                        {msg.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-foreground">{msg.user}</p>
                          <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                        </div>
                        <p className="text-xs text-foreground/90 break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent/50 transition-colors placeholder-muted-foreground"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 transition-colors flex-shrink-0 h-7 w-7 rounded p-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
        </div>
        <div className="p-4 border-t border-border space-y-2">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 lg:hidden z-20 bg-black/50"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 lg:mr-80">
        {/* Mobile Menu Button - Floating */}
        <Button
          onClick={() => setShowMobileSidebar(true)}
          variant="outline"
          size="icon"
          className="lg:hidden fixed bottom-20 right-4 z-20 bg-card border-border shadow-sm hover:bg-accent/10"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center Content - Search and Queue */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            <SearchPanel onAddSong={handleAddSong} />
            <QueuePanel items={queue} onVote={handleVote} />
          </div>
        </div>

        {/* Chat Sidebar - Desktop Only */}
        <div className="hidden lg:flex lg:flex-col fixed top-18 right-0 max-h-[90vh] w-80 bg-card border-l-2 border-b-2 border-border z-30">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
            <h2 className="text-sm font-semibold text-foreground">Room Chat</h2>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
            <div className="space-y-3 flex flex-col-reverse">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 animate-in">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0 bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{msg.user}</p>
                      <p className="text-xs text-muted-foreground flex-shrink-0">{msg.timestamp}</p>
                    </div>
                    <p className="text-sm text-foreground/90 break-words leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input - Fixed at Bottom */}
          <div className="p-4 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder-muted-foreground"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-accent text-accent-foreground hover:bg-accent/90 transition-colors flex-shrink-0 h-9 w-9 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}

export default function RoomPage() {
  return (
    <Suspense fallback={<InvalidRoomPage />}>
      <RoomPageContent />
    </Suspense>
  )
}
