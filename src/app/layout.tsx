import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import "react-loading-skeleton/dist/skeleton.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Project Wildspace",
    description:
        "A worldbuilding tool that helps you create interactive and unique fantasy worlds. Peer into the Wildspace and discover all that awaits.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <Providers>
                <body
                    className={cn(
                        "min-h-screen font-sans antialiased grainy",
                        inter.className
                    )}
                >
                    <Navbar />
                    {children}
                </body>
            </Providers>
        </html>
    );
}
