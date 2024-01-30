import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
    if (typeof window !== "undefined") return path;
    if (process.env.VERCEL_URL)
        return `https://www.projectwildspace.tech${path}`;
    return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
    title = "Project Wildspace",
    description = "Project Wildspace is an AI powered world-building assistant",
    image = "/logo.png",
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@dylanvidal1205",
        },
        metadataBase: new URL("https://www.projectwildspace.tech"),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
