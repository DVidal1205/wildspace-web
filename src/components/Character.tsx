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
import { Character, City, World } from "@prisma/client";
import Image from "next/image";
import ContextCombo from "./ContextCombo";

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
    const [contextEntity, setContextEntity] = useState<Character | City | null>(
        null
    );

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: response, refetch: genFetch } =
        trpc.generateCharacter.useQuery(
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
    const { mutate: saveCharacter } = trpc.saveCharacter.useMutation({
        onSuccess: () => {
            utils.getWorldCharacters.invalidate();
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
        },
        onMutate: () => {
            setCurrentlySavingCharacter(true);
        },
        onSettled() {
            setCurrentlySavingCharacter(false);
        },
    });

    const { data: imageResponse, refetch: imageFetch } =
        trpc.generateImage.useQuery(
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
            console.log(imageResponse);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response) {
            console.log(response);
            setResponseData(response);
            setName(response.name);
            setRace(response.race);
            setClass(response.class);
            setSubclass(response.subclass);
            setAlignment(response.alignment);
            setAge(response.age);
            setBuild(response.build);
            setGender(response.gender);
            setHair(response.hair);
            setHeight(response.height);
            setFashion(response.fashion);
            setQuirks(response.quirks);
            setGoals(response.goals);
            setBackstory(response.backstory);
            setLoading(false);
        }
    }, [response]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Character Generation</CardTitle>
                <CardDescription>
                    Let&apos;s come up with a character! Leave the fields blank
                    to generate details, or fill in properties and check them to
                    set them. Press the save button to save the character to
                    your gallery.
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
                        <Label htmlFor="race">Race</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="race"
                                autoComplete="off"
                                value={race}
                                onChange={(e) => setRace(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setRaceDisabled(!raceDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="class">Class</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="class"
                                autoComplete="off"
                                value={pclass}
                                onChange={(e) => setClass(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setClassDisabled(!classDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="subclass">Subclass</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="subclass"
                                autoComplete="off"
                                value={subclass}
                                onChange={(e) => setSubclass(e.target.value)}
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
                        <Label htmlFor="age">Age</Label>
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
                        <Label htmlFor="build">Build</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="build"
                                autoComplete="off"
                                value={build}
                                onChange={(e) => setBuild(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setBuildDisabled(!buildDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="gender">Gender</Label>
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
                        <Label htmlFor="hair">Hair</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="hair"
                                autoComplete="off"
                                value={hair}
                                onChange={(e) => setHair(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() => setHairDisabled(!hairDisabled)}
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="height">Height</Label>
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
                        <Label htmlFor="fashion">Fashion</Label>
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
                        <Label htmlFor="quirks">Quirks</Label>
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
                        <Label htmlFor="backstory">Backstory</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="backstory"
                                autoComplete="off"
                                value={backstory}
                                onChange={(e) => setBackstory(e.target.value)}
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
                                    alt="character image"
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
            <CardFooter className="gap-4 justify-center mt-12">
                <Label htmlFor="race">Prompt</Label>
                <div className="flex space-x-2 items-center">
                    <Input
                        id="prompt"
                        autoComplete="off"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="sm:w-[50vw] md:w-[30vw]"
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
            </CardFooter>
        </Card>
    );
};

export default Character;
