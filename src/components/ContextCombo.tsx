"use client";

import React, { useEffect } from "react";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Building,
    Character,
    City,
    Faction,
    Item,
    Monster,
    Quest,
    Spell,
} from "@prisma/client";
import { useMediaQuery } from "usehooks-ts";
import Entity from "@/lib/types";

type EntityItem = {
    value:
        | Character
        | City
        | Faction
        | Quest
        | Building
        | Monster
        | Item
        | Spell
        | null;
    label: string;
};

const ContextCombo = ({
    setContextEntity,
    worldID,
}: {
    setContextEntity: (status: Entity | null) => void;
    worldID: { worldID: string };
}) => {
    const [open, setOpen] = React.useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [selectedEntity, setSelectedEntity] =
        React.useState<EntityItem | null>(null);

    const entities = trpc.getWorldEntities.useQuery(worldID);

    const statuses: EntityItem[] = [
        { value: null, label: "None" },
        ...(entities.data?.characters?.map((entity: Character) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.cities?.map((entity: City) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.factions?.map((entity: Faction) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.quests?.map((entity: Quest) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.buildings?.map((entity: Building) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.monsters?.map((entity: Monster) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.items?.map((entity: Item) => ({
            value: entity,
            label: entity.name,
        })) || []),
        ...(entities.data?.spells?.map((entity: Spell) => ({
            value: entity,
            label: entity.name,
        })) || []),
    ];

    useEffect(() => {
        if (selectedEntity) {
            setContextEntity(selectedEntity.value);
        }
    }, [selectedEntity, setContextEntity]);

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[150px] justify-start overflow-hidden"
                    >
                        {selectedEntity ? (
                            <>{selectedEntity.label}</>
                        ) : (
                            <>+ Contextualize</>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[200px] h-[300px] p-0"
                    align="start"
                >
                    <StatusList
                        setOpen={setOpen}
                        setSelectedStatus={setSelectedEntity}
                        statuses={statuses}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[150px] justify-start overflow-hidden"
                >
                    {selectedEntity ? (
                        <>{selectedEntity.label}</>
                    ) : (
                        <>+ Contextualize</>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <StatusList
                        setOpen={setOpen}
                        setSelectedStatus={setSelectedEntity}
                        statuses={statuses}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

function StatusList({
    setOpen,
    setSelectedStatus,
    statuses,
}: {
    setOpen: (open: boolean) => void;
    setSelectedStatus: (status: EntityItem | null) => void;
    statuses: EntityItem[];
}) {
    return (
        <Command>
            <CommandInput placeholder="Filter status..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {statuses.map((status) => (
                        <CommandItem
                            key={status.value?.name}
                            value={status.value?.name}
                            onSelect={(value) => {
                                console.log(value);
                                setSelectedStatus(
                                    statuses.find(
                                        (priority) =>
                                            priority.value?.name.toLowerCase() ===
                                            value.toLowerCase()
                                    ) || null
                                );
                                setOpen(false);
                            }}
                        >
                            {status.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

export default ContextCombo;
