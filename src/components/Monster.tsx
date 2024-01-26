"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Check, HelpCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ContextCombo from "./ContextCombo";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Toggle } from "./ui/toggle";
import { useToast } from "./ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

const Monster = ({ world }: { world: World }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [typeDisabled, setTypeDisabled] = useState<boolean>(false);
    const [sizeDisabled, setSizeDisabled] = useState<boolean>(false);
    const [alignmentDisabled, setAlignmentDisabled] = useState<boolean>(false);
    const [resistanceDisabled, setResistanceDisabled] =
        useState<boolean>(false);
    const [statsDisabled, setStatsDisabled] = useState<boolean>(false);
    const [abilitiesDisabled, setAbilitiesDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loreDisabled, setLoreDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingMonster, setCurrentlySavingMonster] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [size, setSize] = useState<string>("");
    const [alignment, setAlignment] = useState<string>("");
    const [resistance, setResistance] = useState<string>("");
    const [stats, setStats] = useState<string>("");
    const [abilities, setAbilities] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [lore, setLore] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const { toast } = useToast();
    const utils = trpc.useContext();

    const {
        data: response,
        refetch: genFetch,
        error: error,
    } = trpc.generateMonster.useQuery(
        {
            name: nameDisabled ? name : "",
            type: typeDisabled ? type : "",
            size: sizeDisabled ? size : "",
            alignment: alignmentDisabled ? alignment : "",
            resistances: resistanceDisabled ? resistance : "",
            stats: statsDisabled ? stats : "",
            abilities: abilitiesDisabled ? abilities : "",
            description: descriptionDisabled ? description : "",
            lore: loreDisabled ? lore : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );
    const { mutate: saveMonster, error: saveError } =
        trpc.saveMonster.useMutation({
            onSuccess: () => {
                utils.getWorldEntities.invalidate();
                toast({
                    title: "Monster Saved",
                    description: "Your monster has been saved.",
                });
                setName("");
                setType("");
                setSize("");
                setAlignment("");
                setResistance("");
                setStats("");
                setAbilities("");
                setDescription("");
                setLore("");
                setImage("");
                setPrompt("");
            },
            onMutate: () => {
                setCurrentlySavingMonster(true);
            },
            onSettled() {
                setCurrentlySavingMonster(false);
            },
        });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        { object: response, type: "Creature" },
        { enabled: false }
    );

    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: `${error.message}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }, [error, toast]);

    useEffect(() => {
        if (saveError) {
            toast({
                title: "Error",
                description: `${saveError.message}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }, [saveError, toast]);

    useEffect(() => {
        if (imageError) {
            toast({
                title: "Error",
                description: `${imageError.message}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }, [imageError, toast]);

    useEffect(() => {
        if (imageResponse) {
            setImage(imageResponse);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response && response != responseData) {
            setResponseData(response);
            setName(response.name);
            setType(response.type);
            setSize(response.size);
            setAlignment(response.alignment);
            setResistance(response.resistances);
            setStats(response.stats);
            setAbilities(response.abilities);
            setDescription(response.description);
            setLore(response.lore);
            setLoading(false);
        }
    }, [response, responseData]);

    const handleSubmit = () => {
        setLoading(true);
        genFetch();
    };

    const handleImage = () => {
        setImageLoading(true);
        imageFetch();
    };

    const handleSave = () => {
        saveMonster({
            name: name,
            type: type,
            size: size,
            alignment: alignment,
            resistances: resistance,
            stats: stats,
            abilities: abilities,
            description: description,
            lore: lore,
            imageb64: image,
            worldID: world.id,
        });
    };

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>Monster Generation</CardTitle>
                    <CardDescription>
                        Let&apos;s come up with a monster! Leave the fields
                        blank to generate details, or fill in properties and
                        check them to set them. Press the save button to save
                        the monster to your gallery.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                    <div className="gap-4 grid">
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
                                    onClick={() =>
                                        setNameDisabled(!nameDisabled)
                                    }
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
                                    onClick={() =>
                                        setTypeDisabled(!typeDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="size">Size</Label>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="size"
                                    autoComplete="off"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setSizeDisabled(!sizeDisabled)
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
                                    onChange={(e) =>
                                        setAlignment(e.target.value)
                                    }
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
                            <Label htmlFor="resistance">Resistances</Label>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="resistance"
                                    autoComplete="off"
                                    value={resistance}
                                    onChange={(e) =>
                                        setResistance(e.target.value)
                                    }
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setResistanceDisabled(
                                            !resistanceDisabled
                                        )
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="description">Description</Label>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="description"
                                    autoComplete="off"
                                    className="md:h-[17.5vh]"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                ></Textarea>
                                <Toggle
                                    size="sm"
                                    className="mt-2"
                                    onClick={() =>
                                        setDescriptionDisabled(
                                            !descriptionDisabled
                                        )
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
                                    className="md:h-[17.5vh]"
                                    value={lore}
                                    onChange={(e) => setLore(e.target.value)}
                                ></Textarea>
                                <Toggle
                                    size="sm"
                                    className="mt-2"
                                    onClick={() =>
                                        setLoreDisabled(!loreDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 md:col-span-2">
                        <div className="space-y-1">
                            <Label htmlFor="lore">Stats</Label>
                            <div className="flex flex-col">
                                <Card className="w-[90vw] md:w-[30vw] h-[20vw] md:h-[17.5vh] overflow-auto">
                                    <div className="p-4">
                                        <Markdown
                                            remarkPlugins={[remarkGfm]}
                                            className="prose"
                                        >
                                            {stats}
                                        </Markdown>
                                    </div>
                                </Card>
                                <Toggle
                                    size="sm"
                                    className="mt-2"
                                    onClick={() =>
                                        setStatsDisabled(!statsDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lore">Abilities</Label>
                            <div className="flex flex-col">
                                <Card className="w-[90vw] md:w-[30vw] h-[20vw] md:h-[17.5vh] overflow-auto">
                                    <div className="p-4">
                                        <Markdown
                                            remarkPlugins={[remarkGfm]}
                                            className="prose"
                                        >
                                            {abilities}
                                        </Markdown>
                                    </div>
                                </Card>
                                <Toggle
                                    size="sm"
                                    className="mt-2"
                                    onClick={() =>
                                        setAbilitiesDisabled(!abilitiesDisabled)
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
                                        src={
                                            image
                                                ? `data:image/png;base64,${image}`
                                                : ""
                                        }
                                        alt="character image"
                                        className={`rounded ${
                                            isImageFullscreen
                                                ? "h-[85vw] md:h-[85vh] w-auto"
                                                : ""
                                        }`}
                                    ></Image>
                                </div>
                            )}
                        </Card>
                        <div className="flex justify-center">
                            {responseData ? (
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
                                <p>Please Generate a Monster First...</p>
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
                        {currentlySavingMonster === true ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div>Save</div>
                        )}
                    </Button>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                            <HelpCircle className="h-4 w-4 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                            <p>
                                Type in a prompt to generate an entity.
                                Additionally, pick a Context Entity from the
                                contextualize button to reference it in your
                                generation. Combine the two to generate a
                                character with depth and purpose. Then, save it
                                to your gallery!
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
};

export default Monster;
