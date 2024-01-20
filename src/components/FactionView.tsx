"use client";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "./ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Toggle } from "./ui/toggle";
import { Check, Loader2, Trash } from "lucide-react";
import { useState, useEffect, use } from "react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";
import { Character, City, Faction, World } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ContextCombo from "./ContextCombo";

const FactionView = ({
    world,
    entityid,
}: {
    world: World;
    entityid: string;
}) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [typeDisabled, setTypeDisabled] = useState<boolean>(false);
    const [alignmentDisabled, setAlignmentDisabled] = useState<boolean>(false);
    const [populationDisabled, setPopulationDisabled] =
        useState<boolean>(false);
    const [presenceDisabled, setPresenceDisabled] = useState<boolean>(false);
    const [devotionDisabled, setDevotionDisabled] = useState<boolean>(false);
    const [goalsDisabled, setGoalsDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loreDisabled, setLoreDisabled] = useState<boolean>(false);
    const [traitsDisabled, setTraitsDisabled] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [alignment, setAlignment] = useState<string>("");
    const [population, setPopulation] = useState<string>("");
    const [presence, setPresence] = useState<string>("");
    const [devotion, setDevotion] = useState<string>("");
    const [goals, setGoals] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [lore, setLore] = useState<string>("");
    const [traits, setTraits] = useState<string>("");

    const [prompt, setPrompt] = useState<string>("");
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingFaction, setCurrentlySavingFaction] =
        useState<boolean>(false);
    const [cityData, setCityData] = useState<any>("");
    const [deletingFaction, setCurrentlyDeletingFaction] =
        useState<boolean>(false);
    const [contextEntity, setContextEntity] = useState<
        Character | City | Faction | null
    >(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: faction } = trpc.getFaction.useQuery({ id: entityid });

    useEffect(() => {
        if (faction) {
            setName(faction.name);
            setType(faction.type);
            setAlignment(faction.alignment);
            setPopulation(faction.population);
            setPresence(faction.presence);
            setDevotion(faction.devotion);
            setGoals(faction.goals);
            setDescription(faction.description);
            setLore(faction.lore);
            setTraits(faction.traits);
            setImage(faction.imageURL);
            setResponseData(faction);
        }
    }, [faction]);

    const { data: response, refetch: genFetch } = trpc.generateFaction.useQuery(
        {
            name: nameDisabled ? name : "",
            type: typeDisabled ? type : "",
            alignment: alignmentDisabled ? alignment : "",
            population: populationDisabled ? population : "",
            presence: presenceDisabled ? presence : "",
            devotion: devotionDisabled ? devotion : "",
            goals: goalsDisabled ? goals : "",
            description: descriptionDisabled ? description : "",
            lore: loreDisabled ? lore : "",
            traits: traitsDisabled ? traits : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );
    const { mutate: updateFaction } = trpc.updateFaction.useMutation({
        onSuccess: () => {
            utils.getWorldFactions.invalidate();
            utils.getWorldEntities.invalidate();
            toast({
                title: "Faction Updated",
                description: "Your faction has been updated.",
            });
        },
        onMutate: () => {
            setCurrentlySavingFaction(true);
        },
        onSettled() {
            setCurrentlySavingFaction(false);
        },
    });

    const { mutate: deleteFaction } = trpc.deleteFaction.useMutation({
        onSuccess: () => {
            utils.getWorldFactions.invalidate();
            utils.getWorldEntities.invalidate();
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingFaction(true);
        },
        onSettled() {
            setCurrentlyDeletingFaction(false);
        },
    });

    const { data: imageResponse, refetch: imageFetch } =
        trpc.generateImage.useQuery(
            { object: responseData ? responseData : faction, type: "Faction" },
            { enabled: false }
        );

    const handleSubmit = () => {
        setLoading(true);
        genFetch();
    };

    const handleImage = () => {
        setImageLoading(true);
        imageFetch();
    };

    const handleSave = () => {
        updateFaction({
            name: name,
            population: population,
            type: type,
            alignment: alignment,
            presence: presence,
            devotion: devotion,
            goals: goals,
            description: description,
            lore: lore,
            traits: traits,
            imageb64: image,
            worldID: world.id,
            id: entityid,
        });
    };

    useEffect(() => {
        if (imageResponse) {
            setImage(`data:image/png;base64,${imageResponse}`);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response) {
            setResponseData(response);
            setName(response.name);
            setPopulation(response.population);
            setType(response.type);
            setAlignment(response.alignment);
            setPresence(response.presence);
            setDevotion(response.devotion);
            setGoals(response.goals);
            setDescription(response.description);
            setLore(response.lore);
            setTraits(response.traits);
            setLoading(false);
        }
    }, [response]);

    return !faction ? (
        <div className="flex items-center justify-center">
            <Loader2 className="h-40 w-40 animate-spin"></Loader2>
        </div>
    ) : (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    View your city information for {name} here, or edit and save
                    to update the character.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                <div className="gap-4 md:col-span-2 grid md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="name"
                                autoComplete="off"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setNameDisabled(!nameDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="type">Type</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="type"
                                autoComplete="off"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setTypeDisabled(!typeDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="population">Population</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="population"
                                autoComplete="off"
                                value={population}
                                onChange={(e) => setPopulation(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setPopulationDisabled(!populationDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="alignment">Alignment</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="alignment"
                                autoComplete="off"
                                value={alignment}
                                onChange={(e) => setAlignment(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setAlignmentDisabled(!alignmentDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="presence">Presence</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="presence"
                                autoComplete="off"
                                value={presence}
                                onChange={(e) => setPresence(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setPresenceDisabled(!presenceDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="devotion">Devotion</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="devotion"
                                autoComplete="off"
                                value={devotion}
                                onChange={(e) => setDevotion(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setDevotionDisabled(!devotionDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="gap-4 space-y-2 md:col-span-2">
                    <div className="space-y-1">
                        <Label htmlFor="description">Description</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="description"
                                autoComplete="off"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setDescriptionDisabled(!descriptionDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lore">Lore</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="lore"
                                autoComplete="off"
                                value={lore}
                                onChange={(e) => setLore(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setLoreDisabled(!loreDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="goals">Goals</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="goals"
                                autoComplete="off"
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setGoalsDisabled(!goalsDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="traits">Traits</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="traits"
                                autoComplete="off"
                                value={traits}
                                onChange={(e) => setTraits(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setTraitsDisabled(!traitsDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label>Image</Label>
                    <Card className="aspect-square">
                        {image && (
                            <div
                                className={`${
                                    isImageFullscreen
                                        ? "fixed inset-0 z-50 flex items-center justify-center backdrop-filter backdrop-blur"
                                        : ""
                                }`}
                                onClick={() =>
                                    setIsImageFullscreen(!isImageFullscreen)
                                }
                            >
                                <Image
                                    height={1024}
                                    width={1024}
                                    src={image ? `${image}` : ""}
                                    alt="faction image"
                                    className={`rounded-xl ${
                                        isImageFullscreen
                                            ? "h-[85vh] w-auto"
                                            : ""
                                    }`}
                                ></Image>
                            </div>
                        )}
                    </Card>
                    <div className="flex justify-center">
                        {responseData || faction ? (
                            <Button
                                className="mt-2"
                                onClick={() => handleImage()}
                            >
                                {imageLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <div>Generate Image</div>
                                )}
                            </Button>
                        ) : (
                            <p>Please Generate a Faction First...</p>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-4 justify-center mt-12 flex flex-col md:flex-row">
                <Label htmlFor="race">Prompt</Label>
                <div className="flex space-x-2 items-center">
                    <Input
                        id="prompt"
                        autoComplete="off"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-[30vw]"
                    />
                </div>
                <ContextCombo
                    setContextEntity={setContextEntity}
                    worldID={{ worldID: world.id }}
                />
                <Button
                    onClick={() => {
                        handleSubmit();
                    }}
                >
                    {loading === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <div>Generate</div>
                    )}
                </Button>
                <Button onClick={() => handleSave()}>
                    {currentlySavingFaction === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <div>Save</div>
                    )}
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => deleteFaction({ id: entityid })}
                >
                    {deletingFaction === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default FactionView;