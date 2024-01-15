"use client";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { trpc } from "@/app/_trpc/client";
import { redirect } from "next/navigation";
import { Edit } from "lucide-react";

const EditButton = ({ id }: { id: string }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>("Miravalis");
    const [description, setDescription] = useState<string>("");
    const [worldYear, setWorldYear] = useState<string>("");
    const [magicLevel, setMagicLevel] = useState<string>("");
    const [techLevel, setTechLevel] = useState<string>("");

    const utils = trpc.useContext();

    const world = trpc.getWorld.useQuery({ id: id });

    const { mutate: updateWorld } = trpc.updateWorld.useMutation({
        onSuccess: () => {
            utils.getUserWorlds.invalidate();
        },
    });

    useEffect(() => {
        if (world.data) {
            setName(world.data.name);
            setDescription(world.data.description);
            setWorldYear(world.data.worldYear);
            setMagicLevel(world.data.magicLevel);
            setTechLevel(world.data.techLevel);
        }
    }, [world.data]);

    const handleSubmit = () => {
        updateWorld({
            id: id,
            name: name,
            description: description,
            worldYear: worldYear,
            magicLevel: magicLevel,
            techLevel: techLevel,
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v);
                }
            }}
        >
            <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button size="sm" className="w-full">
                    <Edit className="h-4 w-4"></Edit>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit your world</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="worldYear" className="text-right">
                            Current Year
                        </Label>
                        <Input
                            id="worldYear"
                            value={worldYear}
                            onChange={(e) => setWorldYear(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="magicLevel" className="text-right">
                            Level of Magic
                        </Label>
                        <Input
                            id="magicLevel"
                            value={magicLevel}
                            onChange={(e) => setMagicLevel(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="techLevel" className="text-right">
                            Level of Technology
                        </Label>
                        <Input
                            id="techLevel"
                            value={techLevel}
                            onChange={(e) => setTechLevel(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                            htmlFor="worldDescription"
                            className="text-right"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="worldDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                            maxLength={1000}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleSubmit}>
                            Save Changes
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditButton;
