import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

function subasribeToRoom(roomId: string, handleMessage){
    const channel = supabase.channel(`Room-${roomId}`)
}