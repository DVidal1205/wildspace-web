import Sidebar from "@/components/Sidebar";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect, useSearchParams } from "next/navigation";
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
import GalleryPage from "@/components/GalleryPage";

interface PageProps {
    params: {
        worldid: string;
        entityid: string;
    };
}

const Gallery = async ({ params }: PageProps) => {
    const { worldid, entityid } = params;

    console.log("World: ", worldid, "Entity: ", entityid);

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id)
        redirect(`/auth-callback?origin=/dashboard/${worldid}/${entityid}`);

    const world = await db.world.findFirst({
        where: {
            id: worldid,
            userId: user.id,
        },
    });

    if (!world) notFound();

    return <GalleryPage world={world} entityid={entityid} />;
};

export default Gallery;
