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
import { useState, useEffect, useMemo, use } from "react";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import {
    Building,
    Character,
    City,
    Faction,
    Quest,
    World,
} from "@prisma/client";
import { set } from "date-fns";
import Image from "next/image";
import { router } from "@/trpc/trpc";
import { useRouter } from "next/navigation";
import ContextCombo from "./ContextCombo";
import Entity from "@/lib/types";

const QuestView = ({ world, entityid }: { world: World; entityid: string }) => {
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
    const [currentlySavingQuest, setCurrentlySavingQuest] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
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
    const [worldResponse, setWorldResponse] = useState<any>("");
    const [questResponse, setQuestResponse] = useState<any>("");
    const [deletingQuest, setCurrentlyDeletingQuest] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: quest } = trpc.getQuest.useQuery({
        id: entityid,
    });

    const { data: response, refetch: genFetch, error: error } = trpc.generateQuest.useQuery(
        {
            name: nameDisabled ? name : "",
            difficulty: difficultyDisabled ? difficulty : "",
            discovery: discoveryDisabled ? discovery : "",
            consequences: consequencesDisabled ? consequences : "",
            rewards: rewardsDisabled ? rewards : "",
            outcomes: outcomeDisabled ? outcome : "",
            objective: objectivesDisabled ? objectives : "",
            description: descriptionDisabled ? description : "",
            context: contextEntity,
            prompt: prompt,
            worldInfo: world?.description,
        },
        {
            enabled: false,
        }
    );
    const { mutate: updateQuest, error: updateError } =
        trpc.updateQuest.useMutation({
            onSuccess: () => {
                utils.getWorldEntities.invalidate();
                toast({
                    title: "Quest Updated!",
                    description: "Your quest has been updated.",
                });
            },
            onMutate: () => {
                setCurrentlySavingQuest(true);
            },
            onSettled() {
                setCurrentlySavingQuest(false);
            },
        });

    const { mutate: deleteQuest } = trpc.deleteQuest.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingQuest(true);
        },
        onSettled() {
            setCurrentlyDeletingQuest(false);
        },
    });

    const { data: imageResponse, refetch: imageFetch, error: imageError } =
        trpc.generateImage.useQuery(
            {
                object: worldResponse ? worldResponse : quest,
                type: "Questline",
            },
            { enabled: false }
        );

    useEffect(() => {
        if (quest) {
            setName(quest.name);
            setDifficulty(quest.difficulty);
            setDiscovery(quest.discovery);
            setConsequences(quest.consequences);
            setRewards(quest.rewards);
            setOutcome(quest.outcomes);
            setObjectives(quest.objective);
            setDescription(quest.description);
            setQuestResponse(quest);
            setWorldResponse(quest);
            setImage(quest.imageURL);
        }
    }, [quest]);

    useEffect(() => {
        if (imageResponse) {
            setImage(`data:image/png;base64,${imageResponse}`);
            setImageLoading(false);
        }
    }, [imageResponse]);

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
        if (response) {
            setWorldResponse(response);
            setName(response.name);
            setDifficulty(response.difficulty);
            setDiscovery(response.discovery);
            setConsequences(response.consequences);
            setRewards(response.rewards);
            setOutcome(response.outcomes);
            setObjectives(response.objective);
            setDescription(response.description);
            setWorldResponse(response);
            setLoading(false);
        }
    }, [response]);

    const handleSubmit = () => {
        setLoading(true);
        genFetch();
    };

    const handleImage = () => {
        setImageLoading(true);
        imageFetch();
    };

    const handleSave = () => {
        updateQuest({
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
            id: entityid,
        });
    };

    return !quest ? (
        <div className="flex items-center justify-center">
            <Loader2 className="h-40 w-40 animate-spin"></Loader2>
        </div>
    ) : (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    View your quest information for {name} here, or edit and
                    save to update the quest.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-5 gap-4">
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
                                    src={image}
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
                        {worldResponse || questResponse ? (
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
                <Button
                    variant="destructive"
                    onClick={() => deleteQuest({ id: entityid })}
                >
                    {deletingQuest === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default QuestView;
