import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "react-loading-skeleton/dist/skeleton.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export const viewport: Viewport = {
    themeColor: "purple",
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
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                        <Toaster />
                        <Analytics />
                    </ThemeProvider>
                </body>
            </Providers>
        </html>
    );
}
