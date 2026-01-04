import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useServerHealth() {
    const [serverOnline, setServerOnline] = useState(false);
    const [checkingServer, setCheckingServer] = useState(true);

    useEffect(() => {
        const checkServerHealth = async () => {
            try {
                const response = await fetch("/api/health", {
                    method: "GET",
                    cache: "no-store",
                });
                const data = await response.json();
                if (data?.status === 200) {
                    setServerOnline(true);
                } else {
                    setServerOnline(false);
                    toast.info("Server spinning up");
                }
            } catch (error) {
                console.error("Server health check failed:", error);
                setServerOnline(false);
                toast.error("Cannot connect to server");
            } finally {
                setCheckingServer(false);
            }
        };

        checkServerHealth();
        const interval = setInterval(checkServerHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    return { serverOnline, checkingServer };
}
