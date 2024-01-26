"use client";
import { trpc } from "@/app/_trpc/client";
import { World } from "@prisma/client";
import Building from "./Building";
import Character from "./Character";
import City from "./City";
import Faction from "./Faction";
import Item from "./Item";
import Monster from "./Monster";
import Quest from "./Quest";
import Sidebar from "./Sidebar";
import Spell from "./Spell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const WorldPage = ({ world }: { world: World }) => {
    const { data: entities } = trpc.getWorldEntities.useQuery({
        worldID: world.id,
    });

    return (
        <main className="mx-auto md:p-10">
            <div className="grid md:grid-cols-8">
                <div className="lg:col-span-1 h-max lg:pr-8 my-2 lg:my-0">
                    <Sidebar
                        world={world}
                        characters={entities?.characters || []}
                        cities={entities?.cities || []}
                        factions={entities?.factions || []}
                        quests={entities?.quests || []}
                        buildings={entities?.buildings || []}
                        monsters={entities?.monsters || []}
                        items={entities?.items || []}
                        spells={entities?.spells || []}
                    />
                </div>
                <div className="md:col-span-7 w-full overflow-auto md:w-auto">
                    <Tabs defaultValue="character" className="w-full">
                        <TabsList className="flex justify-evenly overflow-auto">
                            <TabsTrigger
                                value="character"
                                className="ml-24 md:ml-0 w-full"
                            >
                                Character
                            </TabsTrigger>
                            <TabsTrigger value="building" className="w-full">
                                Building
                            </TabsTrigger>
                            <TabsTrigger value="faction" className="w-full">
                                Faction
                            </TabsTrigger>
                            <TabsTrigger value="city" className="w-full">
                                City
                            </TabsTrigger>
                            <TabsTrigger value="quest" className="w-full">
                                Quest
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
