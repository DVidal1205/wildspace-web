import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

const Page = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const pricingItems = [
        {
            plan: "Demo",
            tagline: "Try out our service for free.",
            quota: 10,
            features: [
                {
                    text: "10 demo entities per day",
                    footnote:
                        "Try out 10 free demo entities a month before choosing to subscribe.",
                },
                {
                    text: "Entity Saving",
                    footnote: "Save your entities to review later.",
                },
                {
                    text: "Image Generation",
                    negative: true,
                },
                {
                    text: "Baseline quality responses",
                    footnote:
                        "Use our baseline models for text and image generation.",
                    negative: true,
                },
                {
                    text: "Priority support",
                    negative: true,
                },
            ],
        },
        {
            plan: "Pro",
            tagline: "For more unique and rich worlds.",
            quota: PLANS.find((p) => p.slug === "pro")!.quota,
            features: [
                {
                    text: "30 Entities per 4 hours",
                    footnote:
                        "The maximum number of entities you can generate per 4 hours.",
                },
                {
                    text: "Entity Saving",
                    footnote: "Save your entities to review later.",
                },
                {
                    text: "Image Generation",
                },
                {
                    text: "Higher quality images",
                    footnote:
                        "Use our quality models for text and image generation.",
                },
                {
                    text: "Priority support",
                    negative: true,
                },
            ],
        },
        {
            plan: "Premium",
            tagline: "For the most ambitious worlds.",
            quota: PLANS.find((p) => p.slug === "premium")!.quota,
            features: [
                {
                    text: "30 Entities per 4 hours",
                    footnote:
                        "The maximum number of entities you can generate per 4 hours.",
                },
                {
                    text: "Entity Saving",
                    footnote: "Save your entities to review later.",
                },
                {
                    text: "High Quality Image Generation",
                },
                {
                    text: "Highest quality responses",
                    footnote:
                        "Use our highest quality models for text and image generation.",
                },
                {
                    text: "Priority support",
                },
            ],
        },
    ];

    return (
        <>
            <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-7xl">
                <div className="mx-auto mb-10 sm:max-w-lg">
                    <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
                    <p className="mt-5 text-foreground sm:text-lg">
                        Whether you&apos;re just trying out our service or need
                        more, we&apos;ve got you covered.
                    </p>
                </div>

                <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
                    <TooltipProvider>
                        {pricingItems.map(
                            ({ plan, tagline, quota, features }) => {
                                const price =
                                    PLANS.find(
                                        (p) => p.slug === plan.toLowerCase()
                                    )?.price.amount || 0;

                                return (
                                    <div
                                        key={plan}
                                        className={cn(
                                            "relative rounded-2xl  shadow-lg",
                                            {
                                                "border-2 border-purple-600 shadow-purple-200":
                                                    plan === "Pro",
                                                "border border-gray-200":
                                                    plan !== "Pro",
                                            }
                                        )}
                                    >
                                        {plan === "Pro" && (
                                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-3 py-2 text-sm font-medium text-white">
                                                Popular
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <h3 className="my-3 text-center font-display text-3xl font-bold">
                                                {plan}
                                            </h3>
                                            <p className="foreground">
                                                {tagline}
                                            </p>
                                            <p className="my-5 font-display text-6xl font-semibold">
                                                ${price}
                                            </p>
                                            <p className="foreground">
                                                per month
                                            </p>
                                        </div>

                                        <ul className="my-10 space-y-5 px-8">
                                            {features.map(
                                                ({
                                                    text,
                                                    footnote,
                                                    negative,
                                                }) => (
                                                    <li
                                                        key={text}
                                                        className="flex space-x-5"
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {negative ? (
                                                                <Minus className="h-6 w-6 text-foreground" />
                                                            ) : (
                                                                <Check className="h-6 w-6 text-purple-500" />
                                                            )}
                                                        </div>
                                                        {footnote ? (
                                                            <div className="flex items-center space-x-1">
                                                                <p
                                                                    className={cn(
                                                                        "text-foreground",
                                                                        {
                                                                            "text-foreground":
                                                                                negative,
                                                                        }
                                                                    )}
                                                                >
                                                                    {text}
                                                                </p>
                                                                <Tooltip
                                                                    delayDuration={
                                                                        300
                                                                    }
                                                                >
                                                                    <TooltipTrigger className="cursor-default ml-1.5">
                                                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="w-80 p-2">
                                                                        {
                                                                            footnote
                                                                        }
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        ) : (
                                                            <p
                                                                className={cn(
                                                                    "text-foreground",
                                                                    {
                                                                        "text-foreground":
                                                                            negative,
                                                                    }
                                                                )}
                                                            >
                                                                {text}
                                                            </p>
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                        <div className="border-t border-gray-200" />
                                        <div className="p-5">
                                            {plan === "Demo" ? (
                                                <Link
                                                    href={
                                                        user
                                                            ? "/dashboard"
                                                            : "/sign-in"
                                                    }
                                                    className={buttonVariants({
                                                        className: "w-full",
                                                        variant: "secondary",
                                                    })}
                                                >
                                                    {user
                                                        ? "Upgrade now"
                                                        : "Sign up"}
                                                    <ArrowRight className="h-5 w-5 ml-1.5" />
                                                </Link>
                                            ) : user ? (
                                                <UpgradeButton slug={plan} />
                                            ) : (
                                                <Link
                                                    href="/sign-in"
                                                    className={buttonVariants({
                                                        className: "w-full",
                                                    })}
                                                >
                                                    {user
                                                        ? "Upgrade now"
                                                        : "Sign up"}
                                                    <ArrowRight className="h-5 w-5 ml-1.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </TooltipProvider>
                </div>
            </MaxWidthWrapper>
        </>
    );
};

export default Page;
