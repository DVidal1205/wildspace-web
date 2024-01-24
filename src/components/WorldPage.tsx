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
import Quest from "./Quest";
import Building from "./Building";
import Monster from "./Monster";
import Item from "./Item";
import Spell from "./Spell";

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
    const { data: quests } = trpc.getWorldQuests.useQuery({
        worldID: world.id,
    });

    const { data: buildings } = trpc.getWorldBuildings.useQuery({
        worldID: world.id,
    });

    const { data: monsters } = trpc.getWorldMonsters.useQuery({
        worldID: world.id,
    });

    const { data: items } = trpc.getWorldItems.useQuery({
        worldID: world.id,
    });

    const { data: spells } = trpc.getWorldSpells.useQuery({
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
                        quests={quests || []}
                        buildings={buildings || []}
                        monsters={monsters || []}
                        items={items || []}
                        spells={spells || []}
                    />
                </div>
                <div className="md:col-span-7 w-screen md:w-auto">
                    <Tabs defaultValue="character" className="w-full">
                        <TabsList className="flex justify-evenly overflow-auto">
                            <TabsTrigger value="character" className="w-full">
                                Character
                            </TabsTrigger>
                            <TabsTrigger value="city" className="w-full">
                                City
                            </TabsTrigger>
                            <TabsTrigger value="faction" className="w-full">
                                Faction
                            </TabsTrigger>
                            <TabsTrigger value="quest" className="w-full">
                                Quest
                            </TabsTrigger>
                            <TabsTrigger value="building" className="w-full">
                                Building
                            </TabsTrigger>
                            <TabsTrigger value="monster" className="w-full">
                                Monster
                            </TabsTrigger>
                            <TabsTrigger value="item" className="w-full">
                                Item
                            </TabsTrigger>
                            <TabsTrigger value="spell" className="w-full">
                                Spell
                            </TabsTrigger>
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
                        <TabsContent value="quest">
                            <Quest world={world} />
                        </TabsContent>
                        <TabsContent value="building">
                            <Building world={world} />
                        </TabsContent>
                        <TabsContent value="monster">
                            <Monster world={world} />
                        </TabsContent>
                        <TabsContent value="item">
                            <Item world={world} />
                        </TabsContent>
                        <TabsContent value="spell">
                            <Spell world={world} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    );
};

export default WorldPage;
