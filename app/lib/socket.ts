import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const clientSocket = () => {
    if(!socketInstance){
        const socketUrl =
            process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL?.replace("http://", "wss://").replace(
                      "https://",
                      "wss://",
                  )
                : process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || "http://localhost:4000";

        socketInstance = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });
    }

    return socketInstance;
}

export const disconnectSocket = () => {
    if(socketInstance){
        socketInstance.disconnect();
        socketInstance = null;
    }
}