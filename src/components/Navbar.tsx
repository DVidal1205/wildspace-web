import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
    LoginLink,
    RegisterLink,
    getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";

const Navbar = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-input backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-input">
                    <Link href="/" className="flex z-40">
                        <Image
                            unoptimized
                            src="/logo.png"
                            height={128}
                            width={128}
                            alt="Project Wildspace Logo"
                            className="h-10 aspect-auto w-auto"
                        ></Image>
                        <div className="flex items-center">
                            <p className="font-semibold">Wildspace</p>
                        </div>
                    </Link>

                    <MobileNav isAuth={!!user} />

                    <div className="hidden items-center space-x-4 sm:flex">
                        {!user ? (
                            <>
                                <Link
                                    href="/pricing"
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    })}
                                >
                                    Pricing
                                </Link>
                                <LoginLink
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "sm",
                                    })}
                                >
                                    Sign in
                                </LoginLink>
                                <RegisterLink
                                    className={buttonVariants({
                                        size: "sm",
                                    })}
                                >
                                    Get started{" "}
                                    <ArrowRight className="ml-1.5 h-5 w-5" />
                                </RegisterLink>
                            </>
                        ) : (
                            <>
                                <ModeToggle />

                                <Link
                                    href="/dashboard"
                                    className={`${
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "sm",
                                        })
                                    } hover:bg-primary`}
                                >
                                    Dashboard
                                </Link>

                                <UserAccountNav
                                    name={
                                        !user.given_name || !user.family_name
                                            ? "Your Account"
                                            : `${user.given_name} ${user.family_name}`
                                    }
                                    email={user.email ?? ""}
                                    imageUrl={user.picture ?? ""}
                                />
                            </>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    );
};

export default Navbar;
