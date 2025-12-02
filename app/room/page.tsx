"use client"

import { useState, Suspense, useEffect, useRef } from "react"
import Image from "next/image"
import { SearchPanel } from "@/components/SearchPanel"
import { Copy, LogOut, Send, Shield, ChevronUp, ChevronDown, Music, Users, MessageCircle, Info } from "lucide-react"
import { useSession } from "next-auth/react";
import InvalidRoomPage from "./[roomId]/page";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner"

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
  const socketRef = useRef<Socket | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const hasInitializedSocket = useRef(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, router])

  useEffect(() => {
    if (!roomId || !session?.user || hasInitializedSocket.current) return
    
    hasInitializedSocket.current = true
    console.log("Connecting to socket with roomId:", roomId)
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL?.replace('http://', 'wss://').replace('https://', 'wss://')
      : process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || 'http://localhost:4000'
    
    const socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketInstance.on("connect", () => {
      socketInstance.emit("join_room", {
        roomId,
        userId: session.user.email || "",
        userName: session.user.name || "Anonymous",
        userAvatar: session.user.image || ""
      })
    })

    socketInstance.on("room_participants", (users: Array<{ socketId: string; userId: string; userName: string; userAvatar: string }>) => {
      const participants: Participant[] = users.map(user => ({
        id: user.socketId,
        name: user.userName,
        avatar: user.userAvatar,
        isHost: user.userId === session.user?.email,
        isActive: true
      }))
      setParticipants(participants)
    })
    
    socketInstance.on("message", (data: { roomId: string; userId: string; userName: string; userAvatar: string; content: string }) => {
      const newMessage: ChatMessage = {
        id: `msg_${data.roomId}_${Date.now()}_${data.userId}`,
        user: data.userName,
        avatar: data.userAvatar || data.userName.substring(0, 2).toUpperCase(),
        message: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(prev => [newMessage, ...prev])
    })
    socketRef.current = socketInstance

    return () => {
      hasInitializedSocket.current = false
      socketInstance.disconnect()
    }
  }, [roomId, session?.user])
  

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

  const [newMessage, setNewMessage] = useState("")
  const [activeSection, setActiveSection] = useState("queue")

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    })
  }, [activeSection])

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
    toast.success("Room link copied to clipboard!")
  }

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    router.push("/dashboard")
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    socketRef.current.emit("send_message", {
      roomId,
      userId: session.user.email,
      userName: session.user.name,
      userAvatar: session.user.image || session.user.name?.substring(0, 2).toUpperCase(),
      content: newMessage
    })
    
    setNewMessage("")
  }

  if (!roomId)  return <InvalidRoomPage /> 

  return (
    <main className="min-h-screen bg-background flex flex-col">

      {/* YouTube Player Section */}
      <div className="bg-card">
        <div className="aspect-video w-full max-w-4xl mx-auto bg-black">
          {/* YouTube Player Placeholder - Replace with actual YouTube embed */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">YouTube Player</p>
              <p className="text-xs text-muted-foreground">
                {queue[0]?.title || "No video playing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Section Tabs */}
        <div className="flex gap-1 sticky top-0 z-30 bg-card/95 backdrop-blur-sm shadow-sm p-2 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveSection("queue")}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
              activeSection === "queue"
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Music className="w-5 h-5" />
            <span className="text-xs font-semibold">Queue</span>
          </button>
          <button
            onClick={() => setActiveSection("members")}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
              activeSection === "members"
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold">Members</span>
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
              activeSection === "chat"
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-semibold">Chat</span>
          </button>
          <button
            onClick={() => setActiveSection("info")}
            className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
              activeSection === "info"
                ? "bg-accent text-accent-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Info className="w-5 h-5" />
            <span className="text-xs font-semibold">Info</span>
          </button>
        </div>

        {/* Queue Section */}
        {activeSection === "queue" && (
          <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {/* Search Panel */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Search & Add Songs</h3>
              <SearchPanel onAddSong={handleAddSong} />
            </div>

            {/* Queue List */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Up Next</h3>
              {queue.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((song, idx) => (
                    <div
                      key={song.id}
                      className="bg-muted/30 rounded-xl p-3 flex gap-3 hover:bg-muted/50 transition-all"
                    >
                      <span className="text-xs text-muted-foreground font-semibold pt-0.5 flex-shrink-0 w-4 text-center">
                        {idx + 1}
                      </span>
                      <Image
                        src={song.thumbnail || "/placeholder.svg"}
                        alt={song.title}
                        width={44}
                        height={44}
                        className="rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.channel}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Added by {song.requestedBy}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleVote(song.id, "up")}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Vote up"
                        >
                          <ChevronUp className="w-4 h-4 text-accent" />
                        </button>
                        <span className="text-xs font-bold text-accent">{song.votes}</span>
                        <button
                          onClick={() => handleVote(song.id, "down")}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Vote down"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Section */}
        {activeSection === "members" && (
          <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-foreground">Room Members ({participants.length})</h3>
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No members in room</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((member) => (
                  <div
                    key={member.id}
                    className="bg-muted/30 rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-all"
                  >
                    <div className="relative flex-shrink-0">
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {member.isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                        {member.isHost && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-xs font-semibold text-accent">
                            <Shield className="h-3 w-3" />
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.isActive ? "Active" : "Away"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Section */}
        {activeSection === "chat" && (
          <div className="flex flex-col h-[calc(100vh-300px)] max-w-4xl mx-auto w-full">
            <div className="px-4 pt-4 pb-3">
              <h3 className="text-sm font-semibold text-foreground">Room Chat</h3>
            </div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 flex flex-col-reverse">
              <div className="space-y-3 flex flex-col-reverse">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    {msg.avatar ? (
                      <Image
                        src={msg.avatar}
                        alt={msg.user}
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0 w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                        {msg.user.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground">{msg.user}</p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                      </div>
                      <p className="text-sm text-foreground bg-muted/50 rounded-xl px-3 py-2 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder-muted-foreground"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors flex-shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {activeSection === "info" && (
          <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {/* Room Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Room Details</h3>
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Room ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-foreground">{roomId}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 hover:bg-muted/50 rounded transition-colors"
                        title="Copy room link"
                      >
                        <Copy className="w-3.5 h-3.5 text-accent" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Members</span>
                    <span className="text-sm font-semibold text-foreground">{participants.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Queue Length</span>
                    <span className="text-sm font-semibold text-foreground">{queue.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-muted/30 hover:bg-muted/50 rounded-xl p-3 flex items-center gap-3 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Copy className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Share Room</p>
                    <p className="text-xs text-muted-foreground">Copy invite link</p>
                  </div>
                </button>
                
                <button
                  onClick={handleLeaveRoom}
                  className="w-full bg-destructive/10 hover:bg-destructive/20 rounded-xl p-3 flex items-center gap-3 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-destructive">Leave Room</p>
                    <p className="text-xs text-muted-foreground">Disconnect and return to dashboard</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
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
