"use client";

import React, { useEffect } from "react";

import { useMediaQuery } from "usehooks-ts";
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
import { trpc } from "@/app/_trpc/client";
import { Building, Character, City, Faction, Quest } from "@prisma/client";

type Entity = {
    value: Character | City | Faction | Quest | Building;
    label: string;
};

const ContextCombo = ({
    setContextEntity,
    worldID,
}: {
    setContextEntity: (
        status: Character | City | Faction | Quest | Building | null
    ) => void;
    worldID: { worldID: string };
}) => {
    const [open, setOpen] = React.useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [selectedEntity, setSelectedEntity] = React.useState<Entity | null>(
        null
    );

    const entities = trpc.getWorldEntities.useQuery(worldID);

    const statuses: Entity[] = [
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
    setSelectedStatus: (status: Entity | null) => void;
    statuses: Entity[];
}) {
    return (
        <Command>
            <CommandInput placeholder="Filter status..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {statuses.map((status) => (
                        <CommandItem
                            key={status.value.name}
                            value={status.value.id}
                            onSelect={(value) => {
                                setSelectedStatus(
                                    statuses.find(
                                        (priority) =>
                                            priority.value.id === value
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
