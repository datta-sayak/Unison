import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Unison - Listen Together, Seamlessly",
    description: "Create a room, invite friends, and enjoy music in sync",
    generator: "v0.app",
};

export const viewport: Viewport = {
    themeColor: "#a8a8a8",
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
                <Providers>
                    <AppHeader />
                    {children}
                    <Analytics />
                </Providers>
            </body>
        </html>
    );
}
