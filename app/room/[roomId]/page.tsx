"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function InvalidRoomPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Invalid Room URL</h1>
        <p className="text-muted-foreground">
          Room URLs should be in the format: <code className="bg-muted px-2 py-1 rounded">/room?id=ROOMCODE</code>
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    </main>
  )
}
