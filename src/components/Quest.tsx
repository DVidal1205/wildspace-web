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
import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";
import { Building, Character, City, Faction, Quest, World } from "@prisma/client";
import Image from "next/image";
import ContextCombo from "./ContextCombo";

const Quest = ({ world }: { world: World }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [difficultyDisabled, setDifficultyDisabled] =
        useState<boolean>(false);
    const [discoveryDisabled, setDiscoveryDisabled] = useState<boolean>(false);
    const [consequencesDisabled, setConsequencesDisabled] =
        useState<boolean>(false);
    const [rewardsDisabled, setRewardsDisabled] = useState<boolean>(false);
    const [outcomeDisabled, setOutcomeDisabled] = useState<boolean>(false);
    const [objectivesDisabled, setObjectivesDisabled] =
        useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingQuest, setCurrentlySavingQuest] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    const [name, setName] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>("");
    const [discovery, setDiscovery] = useState<string>("");
    const [consequences, setConsequences] = useState<string>("");
    const [rewards, setRewards] = useState<string>("");
    const [outcome, setOutcome] = useState<string>("");
    const [objectives, setObjectives] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [contextEntity, setContextEntity] = useState<
        Character | City | Faction | Quest | Building | null
    >(null);

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: response, refetch: genFetch } = trpc.generateQuest.useQuery(
        {
            name: nameDisabled ? name : "",
            difficulty: difficultyDisabled ? difficulty : "",
            discovery: discoveryDisabled ? discovery : "",
            consequences: consequencesDisabled ? consequences : "",
            rewards: rewardsDisabled ? rewards : "",
            outcomes: outcomeDisabled ? outcome : "",
            objective: objectivesDisabled ? objectives : "",
            description: descriptionDisabled ? description : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );
    const { mutate: saveQuest } = trpc.saveQuest.useMutation({
        onSuccess: () => {
            utils.getWorldQuests.invalidate();
            utils.getWorldEntities.invalidate();
            toast({
                title: "Quest Saved",
                description: "Your quest has been saved.",
            });
            setName("");
            setDifficulty("");
            setDiscovery("");
            setConsequences("");
            setRewards("");
            setOutcome("");
            setObjectives("");
            setDescription("");
            setImage("");
            setPrompt("");
        },
        onMutate: () => {
            setCurrentlySavingQuest(true);
        },
        onSettled() {
            setCurrentlySavingQuest(false);
        },
    });

    const { data: imageResponse, refetch: imageFetch } =
        trpc.generateImage.useQuery(
            { object: responseData, type: "Questline" },
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
        saveQuest({
            name: name,
            difficulty: difficulty,
            discovery: discovery,
            consequences: consequences,
            rewards: rewards,
            outcomes: outcome,
            objective: objectives,
            description: description,
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
            setDifficulty(response.difficulty);
            setDiscovery(response.discovery);
            setConsequences(response.consequences);
            setRewards(response.rewards);
            setOutcome(response.outcomes);
            setObjectives(response.objective);
            setDescription(response.description);
            setLoading(false);
        }
    }, [response]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quest Generation</CardTitle>
                <CardDescription>
                    Let&apos;s come up with a quest! Leave the fields blank to
                    generate details, or fill in properties and check them to
                    set them. Press the save button to save the quest to your
                    gallery.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                <div className="gap-4 md:col-span-2 grid">
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
                        <Label htmlFor="objectives">Objectives</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="objectives"
                                autoComplete="off"
                                value={objectives}
                                onChange={(e) => setObjectives(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setObjectivesDisabled(!objectivesDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="outcome">Outcome</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="outcome"
                                autoComplete="off"
                                value={outcome}
                                onChange={(e) => setOutcome(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setOutcomeDisabled(!outcomeDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="gap-4 md:col-span-2 grid">
                    <div className="space-y-1">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="difficulty"
                                autoComplete="off"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setDifficultyDisabled(!difficultyDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="discovery">Discovery</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="discovery"
                                autoComplete="off"
                                value={discovery}
                                onChange={(e) => setDiscovery(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setDiscoveryDisabled(!discoveryDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="consequences">Consequences</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="consequences"
                                autoComplete="off"
                                value={consequences}
                                onChange={(e) =>
                                    setConsequences(e.target.value)
                                }
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setConsequencesDisabled(
                                        !consequencesDisabled
                                    )
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="rewards">Rewards</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="rewards"
                                autoComplete="off"
                                value={rewards}
                                onChange={(e) => setRewards(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setRewardsDisabled(!rewardsDisabled)
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
                            <p>Please Generate a Quest First...</p>
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
                    {currentlySavingQuest === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <div>Save</div>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default Quest;
