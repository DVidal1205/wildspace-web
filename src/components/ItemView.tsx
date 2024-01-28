"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Check, HelpCircle, Loader2, Trash } from "lucide-react";
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

const ItemView = ({ world, entityid }: { world: World; entityid: string }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [typeDisabled, setTypeDisabled] = useState<boolean>(false);
    useState<boolean>(false);
    const [abilitiesDisabled, setAbilitiesDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loreDisabled, setLoreDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingItem, setCurrentlySavingItem] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [abilities, setAbilities] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [lore, setLore] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [worldResponse, setWorldResponse] = useState<any>("");
    const [itemResponse, setItemResponse] = useState<any>("");
    const [deletingItem, setCurrentlyDeletingItem] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: item } = trpc.getItem.useQuery({
        id: entityid,
    });

    const {
        data: response,
        refetch: genFetch,
        error: error,
    } = trpc.generateItem.useQuery(
        {
            name: nameDisabled ? name : "",
            type: typeDisabled ? type : "",
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
    const { mutate: updateItem, error: updateError } =
        trpc.updateItem.useMutation({
            onSuccess: () => {
                utils.getWorldEntities.invalidate();
                toast({
                    title: "Item Updated!",
                    description: "Your item has been updated.",
                });
            },
            onMutate: () => {
                setCurrentlySavingItem(true);
            },
            onSettled() {
                setCurrentlySavingItem(false);
            },
        });

    const { mutate: deleteItem } = trpc.deleteItem.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            toast({
                title: "Item Deleted!",
                description: "Your item has been deleted.",
            });
            setName("");
            setType("");
            setAbilities("");
            setDescription("");
            setLore("");
            setImage("");
            setItemResponse("");
            setWorldResponse("");
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingItem(true);
        },
        onSettled() {
            setCurrentlyDeletingItem(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        {
            object: worldResponse ? worldResponse : item,
            type: "Item",
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
            setLoading(false);
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
        if (response && response != worldResponse) {
            setWorldResponse(response);
            setName(response.name);
            setType(response.type);
            setAbilities(response.abilities);
            setDescription(response.description);
            setLore(response.lore);
            setLoading(false);
        }
    }, [response, worldResponse]);

    useEffect(() => {
        if (item) {
            setName(item.name);
            setType(item.type);
            setAbilities(item.abilities);
            setDescription(item.description);
            setLore(item.lore);
            setImage(item.imageURL);
            setItemResponse(item);
        }
    }, [item]);

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
        updateItem({
            name: name,
            type: type,
            abilities: abilities,
            description: description,
            lore: lore,
            imageb64: image,
            worldID: world.id,
            id: entityid,
        });
    };

    return !item ? (
        <div className="flex items-center justify-center">
            <Loader2 className="h-40 w-40 animate-spin"></Loader2>
        </div>
    ) : (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>
                        View your item information for {name} here, or edit and
                        save to update the item.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                    <div className="grid md:col-span-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="name">Name</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>The name of the item.</p>
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
                                <Label htmlFor="description">Description</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the item,
                                            including details of its appearance
                                            and how it is used.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="descrption"
                                    autoComplete="off"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />
                                <Toggle
                                    size="sm"
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
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the lore of
                                            the item, including its history and
                                            significance.
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
                    <div className="grid md:col-span-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="type">Type</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The type of item, ranging from
                                            Armor, Weapon, Ring, as well as its
                                            rarity from Common to Legendary.
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
                                <Label htmlFor="abilities">Abilities</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A table detailing the abilities of
                                            the item and their action economy
                                            costs.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Card className="overflow-auto h-[20vh] md:h-[30vh] w-full">
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
                            {worldResponse || itemResponse ? (
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
                                <p>Please Generate a Item First...</p>
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
                        {currentlySavingItem === true ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div>Save</div>
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => deleteItem({ id: entityid })}
                    >
                        {deletingItem === true ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash className="h-4 w-4" />
                        )}
                    </Button>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                            <HelpCircle className="h-4 w-4 text-zinc-500" />
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

export default ItemView;
