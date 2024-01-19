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

const WorldPage = ({ world }: { world: World }) => {
    const { data: characters } = trpc.getWorldCharacters.useQuery({
        worldID: world.id,
    });
    const { data: cities } = trpc.getWorldCities.useQuery({
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
                    />
                </div>
                <div className="md:col-span-7">
                    <Tabs defaultValue="character" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="character">
                                Character
                            </TabsTrigger>
                            <TabsTrigger value="city">City</TabsTrigger>
                            <TabsTrigger value="test">Test</TabsTrigger>
                        </TabsList>
                        <TabsContent value="character">
                            <Character world={world} />
                        </TabsContent>
                        <TabsContent value="city">
                            <City world={world} />
                        </TabsContent>
                        <TabsContent value="test">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving,
                                        you&apos;ll be logged out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="current">
                                            Current password
                                        </Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="new">
                                            New password
                                        </Label>
                                        <Input id="new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    );
};

export default WorldPage;
