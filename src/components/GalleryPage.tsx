"use client";
import { World } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import BuildingView from "./BuildingView";
import CharacterView from "./CharacterView";
import CityView from "./CityView";
import FactionView from "./FactionView";
import ItemView from "./ItemView";
import MonsterView from "./MonsterView";
import QuestView from "./QuestView";
import SpellView from "./SpellView";
import { Button } from "./ui/button";

const GalleryPage = ({
    world,
    entityid,
}: {
    world: World;
    entityid: string;
}) => {
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
            {type === "quest" && (
                <QuestView world={world} entityid={entityid} />
            )}
            {type === "building" && (
                <BuildingView world={world} entityid={entityid} />
            )}
            {type === "monster" && (
                <MonsterView world={world} entityid={entityid} />
            )}
            {type === "item" && <ItemView world={world} entityid={entityid} />}
            {type === "spell" && (
                <SpellView world={world} entityid={entityid} />
            )}
        </main>
    );
};

export default GalleryPage;
