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

const WorldPage = ({ world }: { world: World }) => {
    const { data: characters } = trpc.getWorldCharacters.useQuery({
        worldID: world.id,
    });

    return (
        <main className="mx-auto md:p-10">
            <div className="grid grid-cols-8">
                <div className="col-span-1 h-max mr-4">
                    <Sidebar world={world} characters={characters || []} />
                </div>
                <div className="col-span-7">
                    <Tabs defaultValue="character" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="character">
                                Character
                            </TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                            <TabsTrigger value="test">Test</TabsTrigger>
                        </TabsList>
                        <TabsContent value="character">
                            <Character world={world} />
                        </TabsContent>
                        <TabsContent value="password">
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
