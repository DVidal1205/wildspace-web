"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";

const UpgradeButton = ({ slug }: { slug: string }) => {
    const { mutate: createStripeSession } =
        trpc.createStripeSession.useMutation({
            onSuccess: ({ url }) => {
                window.location.href = url ?? "/dashboard/billing";
            },
        });

    return (
        <Button className="w-full">
            Currently Unavaialbe... <ArrowRight className="h-5 w-5 ml-1.5" />
        </Button>
    );
};

export default UpgradeButton;
