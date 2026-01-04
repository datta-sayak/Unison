import { AppHeader } from "@/components/AppHeader";

export default function WithHeaderLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppHeader />
            {children}
        </>
    );
}
