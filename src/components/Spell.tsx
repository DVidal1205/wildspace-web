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
import { Toggle } from "./ui/toggle";
import { useToast } from "./ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

const Spell = ({ world }: { world: World }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [schoolDisabled, setSchoolDisabled] = useState<boolean>(false);
    const [levelDisabled, setLevelDisabled] = useState<boolean>(false);
    const [castingTimeDisabled, setCastingTimeDisabled] =
        useState<boolean>(false);
    const [rangeDisabled, setRangeDisabled] = useState<boolean>(false);
    const [componentsDisabled, setComponentsDisabled] =
        useState<boolean>(false);
    const [durationDisabled, setDurationDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [spellListDisabled, setSpellListDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingSpell, setCurrentlySavingSpell] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [name, setName] = useState<string>("");
    const [school, setSchool] = useState<string>("");
    const [level, setLevel] = useState<string>("");
    const [castingTime, setCastingTime] = useState<string>("");
    const [range, setRange] = useState<string>("");
    const [components, setComponents] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [spellList, setSpellList] = useState<string>("");
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
    } = trpc.generateSpell.useQuery(
        {
            name: nameDisabled ? name : "",
            school: schoolDisabled ? school : "",
            level: levelDisabled ? level : "",
            castingTime: castingTimeDisabled ? castingTime : "",
            range: rangeDisabled ? range : "",
            components: componentsDisabled ? components : "",
            duration: durationDisabled ? duration : "",
            description: descriptionDisabled ? description : "",
            spellList: spellListDisabled ? spellList : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );
    const { mutate: saveSpell, error: saveError } = trpc.saveSpell.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            toast({
                title: "Spell Saved",
                description: "Your spell has been saved.",
            });
            setName("");
            setSchool("");
            setLevel("");
            setCastingTime("");
            setRange("");
            setComponents("");
            setDuration("");
            setSpellList("");
            setDescription("");
            setImage("");
            setPrompt("");
        },
        onMutate: () => {
            setCurrentlySavingSpell(true);
        },
        onSettled() {
            setCurrentlySavingSpell(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        { object: response, type: "Spell" },
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
            setName(response.name);
            setSchool(response.school);
            setLevel(response.level);
            setCastingTime(response.castingTime);
            setRange(response.range);
            setComponents(response.components);
            setDuration(response.duration);
            setSpellList(response.spellList);
            setDescription(response.description);
            setLoading(false);
            setResponseData(response);
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
        saveSpell({
            name: name,
            school: school,
            level: level,
            castingTime: castingTime,
            range: range,
            components: components,
            duration: duration,
            spellList: spellList,
            description: description,
            imageb64: image,
            worldID: world.id,
        });
    };

    return (
        <TooltipProvider>
        <Card>
            <CardHeader>
                <CardTitle>Spell Generation</CardTitle>
                <CardDescription>
                    Let&apos;s come up with an spell! Leave the fields blank to
                    generate details, or fill in properties and check them to
                    set them. Press the save button to save the
                    spellListDisabled to your gallery.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                <div className="grid md:col-span-2 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="level">Level</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="level"
                                autoComplete="off"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setLevelDisabled(!levelDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="school">School</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="school"
                                autoComplete="off"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setSchoolDisabled(!schoolDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="components">Components</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="components"
                                autoComplete="off"
                                value={components}
                                onChange={(e) => setComponents(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setComponentsDisabled(!componentsDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="castingTime">Casting Time</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="castingTime"
                                autoComplete="off"
                                value={castingTime}
                                onChange={(e) => setCastingTime(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setCastingTimeDisabled(!castingTimeDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="duration">Duration</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="duration"
                                autoComplete="off"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setDurationDisabled(!durationDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="range">Range</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="range"
                                autoComplete="off"
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setRangeDisabled(!rangeDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="spellList">Spell List</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="spellList"
                                autoComplete="off"
                                value={spellList}
                                onChange={(e) => setSpellList(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setSpellListDisabled(!spellListDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="grid md:col-span-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="descrption">Description</Label>
                        <div className="flex space-x-2 items-center h-full">
                            <Card className="h-full p-4 w-full overflow-auto">
                                <Markdown remarkPlugins={[remarkGfm]}>
                                    {description}
                                </Markdown>
                            </Card>
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
                </div>
                <div className="space-y-1 mt-4 md:mt-0">
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
                            <p>Please Generate a Spell First...</p>
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
                    {currentlySavingSpell === true ? (
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
                            generation. Combine the two to generate a character
                            with depth and purpose. Then, save it to your
                            gallery!
                        </p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
        </TooltipProvider>
    );
};

export default Spell;
