"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { ArrowLeft, Check, HelpCircle, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import MarkdownSave from "./MarkdownSave";

const MonsterView = ({
    world,
    entityid,
}: {
    world: World;
    entityid: string;
}) => {
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
    const [worldResponse, setWorldResponse] = useState<any>("");
    const [monsterReponse, setMonsterResponse] = useState<any>("");
    const [deletingMonster, setCurrentlyDeletingMonster] =
        useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: monster } = trpc.getMonster.useQuery({
        id: entityid,
    });

    useEffect(() => {
        if (monster) {
            setName(monster.name);
            setType(monster.type);
            setSize(monster.size);
            setAlignment(monster.alignment);
            setResistance(monster.resistances);
            setStats(monster.stats);
            setAbilities(monster.abilities);
            setDescription(monster.description);
            setLore(monster.lore);
            setImage(monster.imageURL);
            setMonsterResponse(monster);
        }
    }, [monster]);

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
    const { mutate: updateMonster, error: updateError } =
        trpc.updateMonster.useMutation({
            onSuccess: () => {
                utils.getWorldEntities.invalidate();
                toast({
                    title: "Monster Updated!",
                    description: "Your monster has been updated.",
                });
            },
            onMutate: () => {
                setCurrentlySavingMonster(true);
            },
            onSettled() {
                setCurrentlySavingMonster(false);
            },
        });

    const { mutate: deleteMonster } = trpc.deleteMonster.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            toast({
                title: "Monster Deleted!",
                description: "Your monster has been deleted.",
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
            setMonsterResponse("");
            setWorldResponse("");
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingMonster(true);
        },
        onSettled() {
            setCurrentlyDeletingMonster(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        {
            object: worldResponse ? worldResponse : monster,
            type: "Monster/Enemy",
        },
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
        if (updateError) {
            toast({
                title: "Error",
                description: `${updateError.message}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }, [updateError, toast]);

    useEffect(() => {
        if (imageError) {
            toast({
                title: "Error",
                description: `${imageError.message}`,
                variant: "destructive",
            });
            setImageLoading(false);
            return;
        }
    }, [imageError, toast]);

    useEffect(() => {
        if (imageResponse) {
            setImage(`data:image/png;base64,${imageResponse}`);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response && response !== worldResponse) {
            setWorldResponse(response);
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
    }, [response, worldResponse]);

    const handleSubmit = () => {
        setLoading(true);
        genFetch();
    };

    const handleImage = () => {
        setImageLoading(true);
        imageFetch();
    };

    const handleSave = () => {
        if (loading === true) {
            toast({
                title: "Error",
                description:
                    "Please wait for generation to finish before saving.",
                variant: "destructive",
            });
            return;
        }
        updateMonster({
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
            id: entityid,
        });
    };

    return !monster ? (
        <div className="flex items-center justify-center">
            <Loader2 className="h-40 w-40 animate-spin"></Loader2>
        </div>
    ) : (
        <TooltipProvider>
            <div className="flex items-center justify-between">
                <Button
                    className="my-2"
                    onClick={() => router.push(`/dashboard/${world.id}`)}
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <MarkdownSave entity={response || monster} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>
                        View your monster information for {name} here, or edit
                        and save to update the monster.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                    <div className="gap-4 grid">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="name">Name</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>The name of the monster.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="type">Type</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The name of the monster, including
                                            forms such as humanoid, fiend,
                                            aberration, etc.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="size">Size</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The size of the monster, ranging
                                            from small to gargantuan.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="alignment">Alignment</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The name alignment of the monster,
                                            indicating its moral compass.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="resistances">Resistances</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The damage types the monster is
                                            resistant of.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="description">Description</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph description of the
                                            monster, including its appearance
                                            and abilities.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="lore">Lore</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the lore of
                                            the monster, including its context
                                            in the world and any myths
                                            surrounding it.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
                            <div className="flex items-center">
                                <Label htmlFor="stats">Stats</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A table detailing the stats of the
                                            monster, including its defenses,
                                            speeds, and other stats.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex flex-col">
                                <Card className="w-[90vw] border-input md:w-[30vw] h-[20vw] md:h-[17.5vh] overflow-auto">
                                    <div className="p-4">
                                        <Markdown
                                            remarkPlugins={[remarkGfm]}
                                            className="prose dark:prose-invert"
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
                            <div className="flex items-center">
                                <Label htmlFor="abilities">Abilities</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A table detailing the various combat
                                            abilities and passives the monster
                                            has.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex flex-col">
                                <Card className="w-[90vw] border-input md:w-[30vw] h-[20vw] md:h-[17.5vh] overflow-auto">
                                    <div className="p-4">
                                        <Markdown
                                            remarkPlugins={[remarkGfm]}
                                            className="prose dark:prose-invert"
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
                        <Card className="aspect-square border-input">
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
                                        src={image}
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
                            {worldResponse || monsterReponse ? (
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
                    <Button
                        variant="destructive"
                        onClick={() => deleteMonster({ id: entityid })}
                    >
                        {deletingMonster === true ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash className="h-4 w-4" />
                        )}
                    </Button>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                            <HelpCircle className="h-4 w-4 text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                            <p>
                                Generate over your currently saved entity. Click
                                the save button to save your changes, or click
                                the delete button to delete your entity.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
};

export default MonsterView;
