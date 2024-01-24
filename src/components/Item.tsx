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
import { Check, Loader2 } from "lucide-react";
import { useState, useEffect, use } from "react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";
import {
    Building,
    Character,
    City,
    Faction,
    Item,
    Monster,
    Quest,
    World,
} from "@prisma/client";
import Image from "next/image";
import ContextCombo from "./ContextCombo";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Item = ({ world }: { world: World }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [typeDisabled, setTypeDisabled] = useState<boolean>(false);
    const [sizeDisabled, setSizeDisabled] = useState<boolean>(false);
    const [abilitiesDisabled, setAbilitiesDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loreDisabled, setLoreDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingItem, setCurrentlySavingItem] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [abilities, setAbilities] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [lore, setLore] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [contextEntity, setContextEntity] = useState<
        Character | City | Faction | Quest | Building | Monster | Item | null
    >(null);

    const { toast } = useToast();
    const utils = trpc.useContext();

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
    const { mutate: saveItem } = trpc.saveItem.useMutation({
        onSuccess: () => {
            utils.getWorldItems.invalidate();
            utils.getWorldEntities.invalidate();
            toast({
                title: "Item Saved",
                description: "Your item has been saved.",
            });
            setName("");
            setType("");
            setAbilities("");
            setDescription("");
            setLore("");
            setImage("");
            setPrompt("");
        },
        onMutate: () => {
            setCurrentlySavingItem(true);
        },
        onSettled() {
            setCurrentlySavingItem(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        { object: response, type: "Item" },
        { enabled: false }
    );

    useEffect(() => {
        if (error) {
            const message = error.message;
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
        if (imageError) {
            const message = imageError.message;
            toast({
                title: "Error",
                description: `${imageError.message}`,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }
    }, [imageError, toast]);

    const handleSubmit = () => {
        setLoading(true);
        genFetch();
    };

    const handleImage = () => {
        setImageLoading(true);
        imageFetch();
    };

    const handleSave = () => {
        saveItem({
            name: name,
            type: type,
            abilities: abilities,
            description: description,
            lore: lore,
            imageb64: image,
            worldID: world.id,
        });
    };

    useEffect(() => {
        if (imageResponse) {
            setImage(imageResponse);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response) {
            console.log(response);
            setResponseData(response);
            setName(response.name);
            setType(response.type);
            setAbilities(response.abilities);
            setDescription(response.description);
            setLore(response.lore);
            setLoading(false);
            setResponseData(response);
        }
    }, [response]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Item Generation</CardTitle>
                <CardDescription>
                    Let&apos;s come up with an item! Leave the fields blank to
                    generate details, or fill in properties and check them to
                    set them. Press the save button to save the item to your
                    gallery.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                <div className="grid md:col-span-2 gap-4">
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
                        <Label htmlFor="descrption">Description</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="descrption"
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
                                className="md:h-[17.5vh]"
                                value={lore}
                                onChange={(e) => setLore(e.target.value)}
                            ></Textarea>
                            <Toggle
                                size="sm"
                                className="mt-2"
                                onClick={() => setLoreDisabled(!loreDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="grid md:col-span-2 gap-4">
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
                        <Label htmlFor="abilities">Abilities</Label>
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
                <div className="space-y-1 ml-2">
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
                                            ? "h-[85vh] w-auto"
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
            </CardFooter>
        </Card>
    );
};

export default Item;
