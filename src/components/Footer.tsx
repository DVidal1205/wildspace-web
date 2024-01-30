import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    Instagram,
    InstagramIcon,
    LucideInstagram,
    Mail,
    Twitter,
    Youtube,
} from "lucide-react";

export default function Footer() {
    return (
        <div className=" bg-primary">
            <div className="container py-4 mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <div>
                    <Link href="/" className="flex z-40">
                        <Image
                            src="/logo.png"
                            height={128}
                            width={128}
                            alt="Project Wildspace Logo"
                            className="h-16 aspect-auto w-auto"
                        ></Image>
                        <div className="flex items-center">
                            <p className="font-semibold text-2xl">Wildspace</p>
                        </div>
                    </Link>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Get in Touch</h3>
                    <div className="flex space-x-4">
                        {/* <Link
                            className="text-gray-300 hover:text-white"
                            href="#"
                        >
                            <Twitter className="h-6 w-6" />
                        </Link>
                        <Link
                            className="text-gray-300 hover:text-white"
                            href="#"
                        >
                            <Youtube className="h-6 w-6" />
                        </Link>
                        <Link
                            className="text-gray-300 hover:text-white"
                            href="#"
                        >
                            <InstagramIcon className="h-6 w-6" />
                        </Link> */}
                        <Link
                            className="text-gray-300 hover:text-white"
                            href="mailto:projwildspace@gmail.com"
                        >
                            <Mail className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t pb-10 mt-8 pt-8 text-center text-sm">
                © 2024 Project Wildspace. All rights reserved.
            </div>
        </div>
    );
}
