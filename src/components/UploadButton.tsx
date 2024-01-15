"use client";
import { useState } from "react";
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

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [worldYear, setWorldYear] = useState<string>("");
    const [magicLevel, setMagicLevel] = useState<string>("");
    const [techLevel, setTechLevel] = useState<string>("");

    const utils = trpc.useContext();

    const { mutate: createWorld } = trpc.createWorld.useMutation({
        onSuccess: () => {
            utils.getUserWorlds.invalidate();
        },
    });

    const handleSubmit = () => {
        createWorld({
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
                <Button>Create World</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Create your World</DialogTitle>
                    <DialogDescription>
                        A few questions before we get started. Be as detailed as
                        possible to generate the best results.
                    </DialogDescription>
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
                            Create world
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UploadButton;
