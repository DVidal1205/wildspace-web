/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: "/sign-in",
                destination: "/api/auth/login",
                permanent: true,
            },
            {
                source: "/sign-up",
                destination: "/api/auth/register",
                permanent: true,
            },
        ];
    },
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "oaidalleapiprodscus.blob.core.windows.net",
                port: "",
            },
            {
                protocol: "https",
                hostname: "utfs.io",
                port: "",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                port: "",
            },
        ],
    },
    reactStrictMode: false,
};

module.exports = nextConfig;
