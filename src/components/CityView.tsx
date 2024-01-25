"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Check, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

const CityView = ({ world, entityid }: { world: World; entityid: string }) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [populationDisabled, setPopulationDisabled] =
        useState<boolean>(false);
    const [sprawlDisabled, setSprawlDisabled] = useState<boolean>(false);
    const [architectureDisabled, setArchitectureDisabled] =
        useState<boolean>(false);
    const [industriesDisabled, setIndustriesDisabled] =
        useState<boolean>(false);
    const [climateDisabled, setClimateDisabled] = useState<boolean>(false);
    const [safetyDisabled, setSafetyDisabled] = useState<boolean>(false);
    const [educationDisabled, setEducationDisabled] = useState<boolean>(false);
    const [modernityDisabled, setModernityDisabled] = useState<boolean>(false);
    const [wealthDisabled, setWealthDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [loreDisabled, setLoreDisabled] = useState<boolean>(false);
    const [governanceDisabled, setGovernanceDisabled] =
        useState<boolean>(false);
    const [questsDisabled, setQuestsDisabled] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [population, setPopulation] = useState<string>("");
    const [sprawl, setSprawl] = useState<string>("");
    const [architecture, setArchitecture] = useState<string>("");
    const [industries, setIndustries] = useState<string>("");
    const [climate, setClimate] = useState<string>("");
    const [safety, setSafety] = useState<string>("");
    const [education, setEducation] = useState<string>("");
    const [modernity, setModernity] = useState<string>("");
    const [wealth, setWealth] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [lore, setLore] = useState<string>("");
    const [governance, setGovernance] = useState<string>("");
    const [quests, setQuests] = useState<string>("");

    const [prompt, setPrompt] = useState<string>("");
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [image, setImage] = useState<string>("");
    const [responseData, setResponseData] = useState<any>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [currentySavingCity, setCurrentlySavingCity] =
        useState<boolean>(false);
    const [cityData, setCityData] = useState<any>("");
    const [deletingCity, setCurrentlyDeletingCity] = useState<boolean>(false);
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: city } = trpc.getCity.useQuery({ id: entityid });

    useEffect(() => {
        if (city) {
            setName(city.name);
            setPopulation(city.population);
            setSprawl(city.sprawl);
            setArchitecture(city.architecture);
            setIndustries(city.industries);
            setClimate(city.climate);
            setSafety(city.safety);
            setEducation(city.education);
            setModernity(city.modernity);
            setWealth(city.wealth);
            setDescription(city.description);
            setLore(city.lore);
            setGovernance(city.governance);
            setQuests(city.quests);
            setImage(city.imageURL);
            setCityData(city);
        }
    }, [city]);

    const {
        data: response,
        refetch: genFetch,
        error: error,
    } = trpc.generateCity.useQuery(
        {
            name: nameDisabled ? name : "",
            population: populationDisabled ? population : "",
            sprawl: sprawlDisabled ? sprawl : "",
            architecture: architectureDisabled ? architecture : "",
            industries: industriesDisabled ? industries : "",
            climate: climateDisabled ? climate : "",
            safety: safetyDisabled ? safety : "",
            education: educationDisabled ? education : "",
            modernity: modernityDisabled ? modernity : "",
            wealth: wealthDisabled ? wealth : "",
            description: descriptionDisabled ? description : "",
            lore: loreDisabled ? lore : "",
            governance: governanceDisabled ? governance : "",
            quests: questsDisabled ? quests : "",
            prompt: prompt,
            worldInfo: world?.description,
            context: contextEntity,
        },
        {
            enabled: false,
        }
    );
    const { mutate: updateCity } = trpc.updateCity.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            toast({
                title: "City Updated",
                description: "Your city has been updated.",
            });
        },
        onMutate: () => {
            setCurrentlySavingCity(true);
        },
        onSettled() {
            setCurrentlySavingCity(false);
        },
    });

    const { mutate: deleteCity } = trpc.deleteCity.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingCity(true);
        },
        onSettled() {
            setCurrentlyDeletingCity(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        { object: response ? response : city, type: "City/Town" },
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
            setSprawl(response.sprawl);
            setArchitecture(response.architecture);
            setIndustries(response.industries);
            setClimate(response.climate);
            setSafety(response.safety);
            setEducation(response.education);
            setModernity(response.modernity);
            setWealth(response.wealth);
            setDescription(response.description);
            setLore(response.lore);
            setGovernance(response.governance);
            setQuests(response.quests);
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
        updateCity({
            name: name,
            population: population,
            sprawl: sprawl,
            architecture: architecture,
            industries: industries,
            climate: climate,
            safety: safety,
            education: education,
            modernity: modernity,
            wealth: wealth,
            description: description,
            lore: lore,
            governance: governance,
            quests: quests,
            imageb64: image,
            worldID: world.id,
            id: entityid,
        });
    };

    return !city ? (
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
                        <Label htmlFor="sprawl">Sprawl</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="sprawl"
                                autoComplete="off"
                                value={sprawl}
                                onChange={(e) => setSprawl(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setSprawlDisabled(!sprawlDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="architecture">Architecture</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="architecture"
                                autoComplete="off"
                                value={architecture}
                                onChange={(e) =>
                                    setArchitecture(e.target.value)
                                }
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setArchitectureDisabled(
                                        !architectureDisabled
                                    )
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="industries">Industries</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="industries"
                                autoComplete="off"
                                value={industries}
                                onChange={(e) => setIndustries(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setIndustriesDisabled(!industriesDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="climate">Climate</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="climate"
                                autoComplete="off"
                                value={climate}
                                onChange={(e) => setClimate(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setClimateDisabled(!climateDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="safety">Safety</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="safety"
                                autoComplete="off"
                                value={safety}
                                onChange={(e) => setSafety(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setSafetyDisabled(!safetyDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="education">Education</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="education"
                                autoComplete="off"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setEducationDisabled(!educationDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="modernity">Modernity</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="modernity"
                                autoComplete="off"
                                value={modernity}
                                onChange={(e) => setModernity(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setModernityDisabled(!modernityDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="wealth">Wealth</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="wealth"
                                autoComplete="off"
                                value={wealth}
                                onChange={(e) => setWealth(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setWealthDisabled(!wealthDisabled)
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
                        <Label htmlFor="governance">Governance</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="governance"
                                autoComplete="off"
                                value={governance}
                                onChange={(e) => setGovernance(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setGovernanceDisabled(!governanceDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="quests">Quests</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="quests"
                                autoComplete="off"
                                value={quests}
                                onChange={(e) => setQuests(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setQuestsDisabled(!questsDisabled)
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
                                    alt="City Image"
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
                        {responseData || city ? (
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
                            <p>Please Generate a City First...</p>
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
                    {currentySavingCity === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <div>Save</div>
                    )}
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => deleteCity({ id: entityid })}
                >
                    {deletingCity === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CityView;
