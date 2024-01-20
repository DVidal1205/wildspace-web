"use client";
import { trpc } from "@/app/_trpc/client";
import Sidebar from "./Sidebar";
import { World } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Character from "./Character";
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
import City from "./City";
import Faction from "./Faction";

const WorldPage = ({ world }: { world: World }) => {
    const { data: characters } = trpc.getWorldCharacters.useQuery({
        worldID: world.id,
    });
    const { data: cities } = trpc.getWorldCities.useQuery({
        worldID: world.id,
    });
    const { data: factions } = trpc.getWorldFactions.useQuery({
        worldID: world.id,
    });

    return (
        <main className="mx-auto md:p-10">
            <div className="grid lg:grid-cols-8">
                <div className="lg:col-span-1 h-max lg:mr-4 my-2 lg:my-0">
                    <Sidebar
                        world={world}
                        characters={characters || []}
                        cities={cities || []}
                        factions={factions || []}
                    />
                </div>
                <div className="md:col-span-7 w-screen md:w-auto">
                    <Tabs defaultValue="character" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="character">
                                Character
                            </TabsTrigger>
                            <TabsTrigger value="city">City</TabsTrigger>
                            <TabsTrigger value="faction">Faction</TabsTrigger>
                        </TabsList>
                        <TabsContent value="character">
                            <Character world={world} />
                        </TabsContent>
                        <TabsContent value="city">
                            <City world={world} />
                        </TabsContent>
                        <TabsContent value="faction">
                            <Faction world={world} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    );
};

export default WorldPage;
