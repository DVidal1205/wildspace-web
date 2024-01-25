import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
                <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
                    <p className="text-sm font-semibold text-gray-700">
                        Wildspace is Live!
                    </p>
                </div>
                <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
                    Create meaningful{" "}
                    <span className="text-primary">worlds</span> in seconds.
                </h1>
                <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                    Project Wildspace is a worldbuilding tool that helps you
                    create interactive and unique fantasy worlds. Peer into the
                    Wildspace and discover all that awaits.
                </p>
                <div className="mt-4">
                    <RegisterLink
                        className={buttonVariants({
                            size: "lg",
                        })}
                    >
                        Get started <ArrowRight className="ml-1.5 h-5 w-5" />
                    </RegisterLink>
                </div>
                <Image
                    src="/logo.png"
                    height={1080}
                    width={1080}
                    alt="Project Wildspace Logo"
                    className="aspect-auto h-[112] w-auto"
                ></Image>

                <div className="mb-32 mt-32 max-w-5xl sm:mt-56">
                    <div className="mb-12">
                        <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
                            Start worldbuilding in minutes
                        </h2>
                        <p className="mt-4 text-lg text-zinc-700">
                            Creating a world is hard. We&apos;ve made it easy.
                        </p>
                    </div>

                    <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
                        <li className="md:flex-1">
                            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-primary">
                                    Step 1
                                </span>
                                <span className="text-xl font-semibold">
                                    Sign up for an account
                                </span>
                                <span className="mt-2 text-zinc-700">
                                    Try 5 generations for free, or sign up for a
                                    premium account.
                                </span>
                            </div>
                        </li>
                        <li className="md:flex-1">
                            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-primary">
                                    Step 2
                                </span>
                                <span className="text-xl font-semibold">
                                    Create a world
                                </span>
                                <span className="mt-2 text-zinc-700">
                                    We&apos;ll process a world collection. The
                                    rest is up to you.
                                </span>
                            </div>
                        </li>
                        <li className="md:flex-1">
                            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-primary">
                                    Step 3
                                </span>
                                <span className="text-xl font-semibold">
                                    Start generating entities
                                </span>
                                <span className="mt-2 text-zinc-700">
                                    It&apos;s that simple. Try generating an
                                    NPC, location, city, or country.
                                </span>
                            </div>
                        </li>
                    </ol>
                </div>
            </MaxWidthWrapper>
        </>
    );
}
