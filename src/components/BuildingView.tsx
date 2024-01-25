"use client";
import { trpc } from "@/app/_trpc/client";
import Entity from "@/lib/types";
import { World } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Check, Loader2, Trash } from "lucide-react";
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

const BuildingView = ({
    world,
    entityid,
}: {
    world: World;
    entityid: string;
}) => {
    const [nameDisabled, setNameDisabled] = useState<boolean>(false);
    const [typeDisabled, setTypeDisabled] = useState<boolean>(false);
    const [sizeDisabled, setSizeDisabled] = useState<boolean>(false);
    const [architectureDisabled, setArchitectureDisabled] =
        useState<boolean>(false);
    const [ambienceDisabled, setAmbienceDisabled] = useState<boolean>(false);
    const [trafficDisabled, setTrafficDisabled] = useState<boolean>(false);
    const [descriptionDisabled, setDescriptionDisabled] =
        useState<boolean>(false);
    const [vendorDisabled, setVendorDisabled] = useState<boolean>(false);
    const [goodsDisabled, setGoodsDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentlySavingBuilding, setCurrentlySavingBuilding] =
        useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [size, setSize] = useState<string>("");
    const [architecture, setArchitecture] = useState<string>("");
    const [ambience, setAmbience] = useState<string>("");
    const [traffic, setTraffic] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [vendor, setVendor] = useState<string>("");
    const [goods, setGoods] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [worldResponse, setWorldResponse] = useState<any>("");
    const [buildingResponse, setBuildingResponse] = useState<any>("");
    const [deletingBuilding, setCurrentlyDeletingBuilding] =
        useState<boolean>(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [contextEntity, setContextEntity] = useState<Entity | null>(null);

    const router = useRouter();

    const { toast } = useToast();
    const utils = trpc.useContext();

    const { data: building } = trpc.getBuilding.useQuery({
        id: entityid,
    });

    const {
        data: response,
        refetch: genFetch,
        error: error,
    } = trpc.generateBuilding.useQuery(
        {
            name: nameDisabled ? name : "",
            type: typeDisabled ? type : "",
            size: sizeDisabled ? size : "",
            architecture: architectureDisabled ? architecture : "",
            ambience: ambienceDisabled ? ambience : "",
            traffic: trafficDisabled ? traffic : "",
            description: descriptionDisabled ? description : "",
            vendor: vendorDisabled ? vendor : "",
            goods: goodsDisabled ? goods : "",
            prompt: prompt,
            context: contextEntity,
            worldInfo: world?.description,
        },
        {
            enabled: false,
        }
    );

    const { mutate: updateBuilding } = trpc.updateBuilding.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            toast({
                title: "Building Updated!",
                description: "Your building has been updated.",
            });
        },
        onMutate: () => {
            setCurrentlySavingBuilding(true);
        },
        onSettled() {
            setCurrentlySavingBuilding(false);
        },
    });

    const { mutate: deleteBuilding } = trpc.deleteBuilding.useMutation({
        onSuccess: () => {
            utils.getWorldEntities.invalidate();
            router.push(`/dashboard/${world.id}`);
        },
        onMutate: () => {
            setCurrentlyDeletingBuilding(true);
        },
        onSettled() {
            setCurrentlyDeletingBuilding(false);
        },
    });

    const {
        data: imageResponse,
        refetch: imageFetch,
        error: imageError,
    } = trpc.generateImage.useQuery(
        {
            object: worldResponse ? worldResponse : building,
            type: "Building",
        },
        { enabled: false }
    );

    useEffect(() => {
        if (building) {
            setName(building.name);
            setType(building.type);
            setSize(building.size);
            setArchitecture(building.architecture);
            setAmbience(building.ambience);
            setTraffic(building.traffic);
            setDescription(building.description);
            setVendor(building.vendor);
            setGoods(building.goods);
            setImage(building.imageURL);
            setBuildingResponse(building);
        }
    }, [building]);

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
        if (imageResponse) {
            setImage(`data:image/png;base64,${imageResponse}`);
            setImageLoading(false);
        }
    }, [imageResponse]);

    useEffect(() => {
        if (response) {
            setWorldResponse(response);
            setName(response.name);
            setType(response.type);
            setSize(response.size);
            setArchitecture(response.architecture);
            setAmbience(response.ambience);
            setTraffic(response.traffic);
            setDescription(response.description);
            setVendor(response.vendor);
            setGoods(response.goods);
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
        updateBuilding({
            name: name,
            type: type,
            size: size,
            architecture: architecture,
            ambience: ambience,
            traffic: traffic,
            description: description,
            vendor: vendor,
            goods: goods,
            imageb64: image,
            worldID: world.id,
            id: entityid,
        });
    };

    return !building ? (
        <div className="flex items-center justify-center">
            <Loader2 className="h-40 w-40 animate-spin"></Loader2>
        </div>
    ) : (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    View your building information for {name} here, or edit and
                    save to update the building.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
                <div className="gap-4 md:col-span-3 grid md:grid-cols-2">
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
                                onClick={() => setSizeDisabled(!sizeDisabled)}
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
                        <Label htmlFor="ambience">Ambience</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="ambience"
                                autoComplete="off"
                                value={ambience}
                                onChange={(e) => setAmbience(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setAmbienceDisabled(!ambienceDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="traffic">Traffic</Label>
                        <div className="flex space-x-2 items-center">
                            <Input
                                id="traffic"
                                autoComplete="off"
                                value={traffic}
                                onChange={(e) => setTraffic(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setTrafficDisabled(!trafficDisabled)
                                }
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
                        <Label htmlFor="vendor">Vendor</Label>
                        <div className="flex space-x-2 items-center">
                            <Textarea
                                id="vendor"
                                autoComplete="off"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                            />
                            <Toggle
                                size="sm"
                                onClick={() =>
                                    setVendorDisabled(!vendorDisabled)
                                }
                            >
                                <Check></Check>
                            </Toggle>
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="height">Goods/Services</Label>
                    <div className="flex flex-col">
                        <Card className="aspect-square overflow-y-auto">
                            <div className="p-4">
                                <Markdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose"
                                >
                                    {goods}
                                </Markdown>
                            </div>
                        </Card>
                        <Toggle
                            size="sm"
                            className="mt-2"
                            onClick={() => setGoodsDisabled(!goodsDisabled)}
                        >
                            <Check></Check>
                        </Toggle>
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
                                    alt="Building Image"
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
                        {worldResponse || buildingResponse ? (
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
                            <p>Please Generate a Building First...</p>
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
                    {currentlySavingBuilding === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <div>Save</div>
                    )}
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => deleteBuilding({ id: entityid })}
                >
                    {deletingBuilding === true ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BuildingView;
