/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
