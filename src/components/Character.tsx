"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Check, HelpCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
import { set } from "date-fns";

const Character = ({ world }: { world: World }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [raceDisabled, setRaceDisabled] = useState<boolean>(false);
    const [classDisabled, setClassDisabled] = useState<boolean>(false);
    const [subclassDisabled, setSubclassDisabled] = useState<boolean>(false);
    const [alignmentDisabled, setAlignmentDisabled] = useState<boolean>(false);
    const [ageDisabled, setAgeDisabled] = useState<boolean>(false);
    const [buildDisabled, setBuildDisabled] = useState<boolean>(false);
    const [genderDisabled, setGenderDisabled] = useState<boolean>(false);
    const [hairDisabled, setHairDisabled] = useState<boolean>(false);
    const [heightDisabled, setHeightDisabled] = useState<boolean>(false);
    const [fashionDisabled, setFashionDisabled] = useState<boolean>(false);
    const [quirksDisabled, setQuirksDisabled] = useState<boolean>(false);
    const [goalsDisabled, setGoalsDisabled] = useState<boolean>(false);
    const [backstoryDisabled, setBackstoryDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingCharacter, setCurrentlySavingCharacter] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [name, setName] = useState<string>("");
    const [race, setRace] = useState<string>("");
    const [pclass, setClass] = useState<string>("");
    const [subclass, setSubclass] = useState<string>("");
    const [alignment, setAlignment] = useState<string>("");
    const [age, setAge] = useState<string>("");
    const [build, setBuild] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const [hair, setHair] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [fashion, setFashion] = useState<string>("");
    const [quirks, setQuirks] = useState<string>("");
    const [goals, setGoals] = useState<string>("");
    const [backstory, setBackstory] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [entity, setEntity] = useState<any>("");
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const { toast } = useToast();
    const utils = trpc.useContext();

    const {
        data: response,
        error: error,
        refetch: genFetch,
    } = trpc.generateCharacter.useQuery(
        {
            name: nameDisabled ? name : "",
            cClass: classDisabled ? pclass : "",
            race: raceDisabled ? race : "",
            subclass: subclassDisabled ? subclass : "",
            alignment: alignmentDisabled ? alignment : "",
            age: ageDisabled ? age : "",
            build: buildDisabled ? build : "",
            gender: genderDisabled ? gender : "",
            hair: hairDisabled ? hair : "",
            height: heightDisabled ? height : "",
            fashion: fashionDisabled ? fashion : "",
            quirks: quirksDisabled ? quirks : "",
            goals: goalsDisabled ? goals : "",
            backstory: backstoryDisabled ? backstory : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );

    const { mutate: saveCharacter, error: saveError } =
        trpc.saveCharacter.useMutation({
            onSuccess: () => {
                utils.getWorldEntities.invalidate();
                toast({
                    title: "Character Saved",
                    description: "Your character has been saved.",
                });
                setName("");
                setRace("");
                setClass("");
                setSubclass("");
                setAlignment("");
                setAge("");
                setBuild("");
                setGender("");
                setHair("");
                setHeight("");
                setFashion("");
                setQuirks("");
                setGoals("");
                setBackstory("");
                setImage("");
                setPrompt("");
                setEntity("");
                setResponseData("");
            },
            onMutate: () => {
                setCurrentlySavingCharacter(true);
            },
            onSettled() {
                setCurrentlySavingCharacter(false);
            },
        });

    const {
        data: imageResponse,
        error: imageError,
        refetch: imageFetch,
    } = trpc.generateImage.useQuery(
        { object: response, type: "Character/Person" },
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
        if (loading === true) {
            toast({
                title: "Error",
                description:
                    "Please wait for generation to finish before saving.",
                variant: "destructive",
            });
            return;
        }
        saveCharacter({
            name: name,
            race: race,
            cClass: pclass,
            subclass: subclass,
            alignment: alignment,
            age: age,
            build: build,
            gender: gender,
            hair: hair,
            height: height,
            fashion: fashion,
            quirks: quirks,
            goals: goals,
            backstory: backstory,
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
        if (entity && entity != responseData) {
            setResponseData(entity);
            setName(entity.name);
            setRace(entity.race);
            setClass(entity.class);
            setSubclass(entity.subclass);
            setAlignment(entity.alignment);
            setAge(entity.age);
            setBuild(entity.build);
            setGender(entity.gender);
            setHair(entity.hair);
            setHeight(entity.height);
            setFashion(entity.fashion);
            setQuirks(entity.quirks);
            setGoals(entity.goals);
            setBackstory(entity.backstory);
            setLoading(false);
        }
    }, [entity, responseData]);

    useEffect(() => {
        if (response) {
            setEntity(response);
        }
    }, [response]);

    useEffect(() => {
        setEntity("");
        setResponseData("");
    }, []);

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>Character Generation</CardTitle>
                    <CardDescription>
                        Let&apos;s come up with a character! Leave the fields
                        blank to generate details, or fill in properties and
                        check them to set them. Press the save button to save
                        the character to your gallery.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                    <div className="gap-4 md:col-span-2 grid md:grid-cols-2">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="name">Name</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>The name of the character.</p>
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
                                <Label htmlFor="race">Race</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The fantasy race of the character.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="race"
                                    autoComplete="off"
                                    value={race}
                                    onChange={(e) => setRace(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setRaceDisabled(!raceDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="class">Class</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>The TTRPG class of the character.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="class"
                                    autoComplete="off"
                                    value={pclass}
                                    onChange={(e) => setClass(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setClassDisabled(!classDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="subclass">Subclass</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The corresponding subclass of the
                                            TTRPG class of the character.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="subclass"
                                    autoComplete="off"
                                    value={subclass}
                                    onChange={(e) =>
                                        setSubclass(e.target.value)
                                    }
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setSubclassDisabled(!subclassDisabled)
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
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The alignment of the character, or
                                            their moral compass.
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
                                <Label htmlFor="age">Age</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The age of the character,
                                            appropriate for their fantasy race.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="age"
                                    autoComplete="off"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() => setAgeDisabled(!ageDisabled)}
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="build">Build</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The physical build of the character,
                                            ranging from thin to muscular.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="build"
                                    autoComplete="off"
                                    value={build}
                                    onChange={(e) => setBuild(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setBuildDisabled(!buildDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="gender">Gender</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The gender of the character,
                                            including Male, Female, Non-Binary,
                                            or Construct
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="gender"
                                    autoComplete="off"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setGenderDisabled(!genderDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="hair">Hair</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The hair color and style of the
                                            character.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="hair"
                                    autoComplete="off"
                                    value={hair}
                                    onChange={(e) => setHair(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setHairDisabled(!hairDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="height">Height</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            The height of the character
                                            appropriate for their fantasy race,
                                            in feet and inches.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Input
                                    id="height"
                                    autoComplete="off"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setHeightDisabled(!heightDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                    </div>
                    <div className="gap-4 space-y-2 md:col-span-2">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="fashion">Fashion</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the fashion
                                            of the character, including their
                                            clothing, accessories, and jewelry.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="fashion"
                                    autoComplete="off"
                                    value={fashion}
                                    onChange={(e) => setFashion(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setFashionDisabled(!fashionDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="quirks">Quirks</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the quirks of
                                            the character to use in roleplay or
                                            scenemaking.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="quirks"
                                    autoComplete="off"
                                    value={quirks}
                                    onChange={(e) => setQuirks(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setQuirksDisabled(!quirksDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="goals">Goals</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the goals of
                                            the character to use in their story
                                            and motivating their actions.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="goals"
                                    autoComplete="off"
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setGoalsDisabled(!goalsDisabled)
                                    }
                                >
                                    <Check></Check>
                                </Toggle>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <Label htmlFor="backstory">Backstory</Label>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className="cursor-default ml-1.5">
                                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-2">
                                        <p>
                                            A paragraph describing the backstory
                                            of the character, possibly including
                                            their upbringing, family, and past
                                            experiences.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <Textarea
                                    id="backstory"
                                    autoComplete="off"
                                    value={backstory}
                                    onChange={(e) =>
                                        setBackstory(e.target.value)
                                    }
                                />
                                <Toggle
                                    size="sm"
                                    onClick={() =>
                                        setBackstoryDisabled(!backstoryDisabled)
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
                                        alt="Character Image"
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
                                <p>Please Generate a Character First...</p>
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
                        {currentlySavingCharacter === true ? (
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

export default Character;
