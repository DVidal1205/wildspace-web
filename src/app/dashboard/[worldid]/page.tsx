import Sidebar from "@/components/Sidebar";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Character from "@/components/Character";
import { trpc } from "@/app/_trpc/client";
import WorldPage from "@/components/WorldPage";

interface PageProps {
    params: {
        worldid: string;
    };
}

const World = async ({ params }: PageProps) => {
    const { worldid } = params;

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id)
        redirect(`/auth-callback?origin=/dashboard/${worldid}`);

    const world = await db.world.findFirst({
        where: {
            id: worldid,
            userId: user.id,
        },
    });

    if (!world) notFound();

    return <WorldPage world={world} />;
};

export default World;
