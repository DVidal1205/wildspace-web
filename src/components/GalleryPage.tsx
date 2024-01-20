"use client";
import { trpc } from "@/app/_trpc/client";
import Sidebar from "./Sidebar";
import { World } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CharacterView from "./CharacterView";
import CityView from "./CityView";
import FactionView from "./FactionView";

const GalleryPage = ({
    world,
    entityid,
}: {
    world: World;
    entityid: string;
}) => {
    const { data: characters } = trpc.getWorldCharacters.useQuery({
        worldID: world.id,
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");

    return (
        <main className="mx-auto md:p-10">
            <Button
                className="my-2"
                onClick={() => router.push(`/dashboard/${world.id}`)}
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {type === "character" && (
                <CharacterView world={world} entityid={entityid} />
            )}
            {type === "city" && <CityView world={world} entityid={entityid} />}
            {type === "faction" && (
                <FactionView world={world} entityid={entityid} />
            )}
        </main>
    );
};

export default GalleryPage;
