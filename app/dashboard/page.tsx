"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Plus, Trash2, Share2, Play, Users, Activity, Lock, LogIn } from "lucide-react"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react";
import axios from "axios"
import { toast } from "sonner"

interface UserData {
  name: string
  email: string
  avatarUrl?: string
  createdAt: string
  createdRooms: Array<{
    roomId: string
    roomName: string
    accessMode: string
    createdAt: string
    createdBy: {
      name: string | null
      avatarUrl: string | null
    } | null
    _count: {
      roomUsers: number
      queueEntries: number
    }
    playbackState: {
      currentEntry: {
        song: {
          title: string
          smallImage: string | null
        }
      } | null
    } | null
  }>
  roomUsers: Array<{
    room: {
      roomId: string
      roomName: string
      accessMode: string
      createdAt: string
      createdBy: {
        name: string | null
        avatarUrl: string | null
      } | null
      _count: {
        roomUsers: number
        queueEntries: number
      }
      playbackState: {
        currentEntry: {
          song: {
            title: string
            smallImage: string | null
          }
        } | null
      } | null
    }
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
    
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }
  }, [router, status])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user')
        setUserData(response.data)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        signOut({ callbackUrl: "/"})
      } finally {
        setLoading(false)
      }
    }
    if (status === "authenticated") {
      fetchUserData()
    }
  }, [status, session?.user?.email])

  const handleLogout = () => {
    signOut()
  }

  const handleDeleteRoom = (roomId: string) => {
    console.log('Delete room:', roomId)
  }

  const handleShareRoom = (roomId: string) => {
    const roomLink = `${window.location.origin}/room?id=${roomId}`
    navigator.clipboard.writeText(roomLink)
    toast.info(`"${roomId}" copied!`)
  }

  return (
    <main className="min-h-screen bg-accent/5 transition-theme">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 rounded-t-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 lg:fixed lg:top-28 lg:z-40 lg:w-55">
              {/* User Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ring-2 ring-accent/20">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-accent-foreground">
                        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground text-sm truncate">{session?.user?.name || "User"}</h2>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">ID: {session?.user?.email?.split("@")[0] || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rooms</p>
                  <p className="text-2xl font-bold text-accent">{userData?.createdRooms?.length || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Members</p>
                  <p className="text-2xl font-bold text-accent">
                    {userData?.createdRooms?.reduce((sum, room) => sum + room._count.roomUsers, 0) || 0}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <Button
                onClick={handleLogout}
                className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-theme border border-destructive/20"
              >
                Sign Out
              </Button>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Rooms</h2>
                  <p className="font-bold text-accent">
                    {userData?.createdRooms && (userData.createdRooms.length + userData.roomUsers.length) > 0
                      ? `${userData.createdRooms.length} created, ${userData.roomUsers.length} joined`
                      : "Create or join a room to get started"}
                  </p>
                </div>
              </div>
              {/* Join Room and New Room Cards - Above Empty State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/join" className="block">
                      <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent rounded-2xl p-4 hover:border-accent hover:shadow-xl hover:shadow-accent/20 hover:from-accent/10 hover:to-accent/15 transition-all cursor-pointer group active:scale-95">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-accent group-hover:bg-accent/90 transition-colors flex items-center justify-center shadow-lg">
                            <LogIn className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                              Join Room
                            </h3>
                            <p className="text-xs text-muted-foreground">Connect to existing rooms</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link href="/create" className="block">
                      <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent rounded-2xl p-4 hover:border-accent hover:shadow-xl hover:shadow-accent/20 hover:from-accent/10 hover:to-accent/15 transition-all cursor-pointer group active:scale-95">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-accent group-hover:bg-accent/90 transition-colors flex items-center justify-center shadow-lg">
                            <Plus className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                              New Room
                            </h3>
                            <p className="text-xs text-muted-foreground">Create your own music room</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
              {/* Rooms Grid */}
              {loading ? (
                <div className="text-muted-foreground">Loading rooms...</div>
              ) : !userData?.createdRooms || (userData.createdRooms.length === 0 && userData.roomUsers.length === 0) ? (
                <>
                  <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                        <Play className="h-8 w-8 text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">No rooms yet</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                        Create your first collaborative music room or join one using a room code
                      </p>
                    </div>
                    <Link href="/create">
                      <Button className="bg-accent text-accent-foreground hover:opacity-90 transition-theme">
                        Create Your First Room
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Rooms Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      ...userData.createdRooms,
                      ...userData.roomUsers
                        .map(ru => ru.room)
                        .filter(joinedRoom => !userData.createdRooms.some(created => created.roomId === joinedRoom.roomId))
                    ].map((room) => (
                      <div
                        key={room.roomId}
                        className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:bg-accent/5"
                      >

                        <div className="relative p-4 space-y-3">
                          {/* Room Header with Icon and Access Mode */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors truncate">
                                  {room.roomName}
                                </h3>
                                {room.playbackState?.currentEntry?.song && (
                                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {room.accessMode === "Public" ? "Public" : (
                                  <span className="flex gap-1">
                                    <Lock className="h-3.5 w-3.5 text-accent" />
                                    Private
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/20 border border-accent/20 flex items-center justify-center group-hover:border-accent/50 group-hover:bg-accent/30 transition-all">
                              <span className="text-sm font-bold text-accent">
                                {room.roomName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Host Info */}
                          {room.createdBy && (
                            <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                {room.createdBy.avatarUrl ? (
                                  <Image
                                    src={room.createdBy.avatarUrl}
                                    alt={room.createdBy.name || "Host"}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-accent">
                                    {(room.createdBy.name || "H").charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{room.createdBy.name || "Unknown"}</p>
                              </div>
                            </div>
                          )}

                          {/* Room Stats - Live Users and Queue Count */}
                          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-accent/70" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Users
                                </p>
                              </div>
                              <p className="text-xl font-bold text-foreground">{room._count.roomUsers}</p>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5 text-accent/70" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Queue
                                </p>
                              </div>
                              <p className="text-xl font-bold text-foreground">{room._count.queueEntries}</p>
                            </div>
                          </div>

                          {/* Action Buttons - Improved Layout */}
                          <div className="flex gap-2 pt-2 border-t border-border">
                            <Link href={`/room?id=${room.roomId}`} className="flex-1">
                              <button className="w-full px-3 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm transition-all duration-200 hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 group/btn">
                                <Play className="h-3.5 w-3.5" />
                                Enter
                              </button>
                            </Link>
                            <button
                              onClick={() => handleShareRoom(room.roomId)}
                              className="px-2.5 py-2 rounded-lg border border-border bg-transparent hover:bg-muted transition-colors text-foreground"
                              title="Share room"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.roomId)}
                              className="px-2.5 py-2 rounded-lg border border-border bg-transparent hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors text-foreground"
                              title="Delete room"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
