"use client";
import {
    Building,
    Character,
    City,
    Faction,
    Quest,
    World,
} from "@prisma/client";
import { Separator } from "./ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import WorldButton from "./WorldButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
    world: World;
    characters: Character[];
    cities: City[];
    factions: Faction[];
    quests: Quest[];
    buildings: Building[];
}

const Sidebar = ({
    world,
    characters,
    cities,
    factions,
    quests,
    buildings,
}: SidebarProps) => {
    const router = useRouter();
    return (
        <div className="sm:w-[98vw] sm:px-6 md:w-full md:px-0">
            <div className="flex justify-between mb-2">
                <div>{world.name}</div>
                <WorldButton world={world} />
            </div>
            <Separator />
            <Accordion
                type="multiple"
                className="max-h-[50vh] md:max-h-[75vh] overflow-auto"
            >
                <AccordionItem value="item-1">
                    <AccordionTrigger>Characters</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {characters.length === 0 ? (
                                <div>No characters...</div>
                            ) : (
                                characters.map((character) => (
                                    <li
                                        key={character.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${character.id}?type=character`}
                                        >
                                            {character.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Cities</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {cities.length === 0 ? (
                                <div>No cities...</div>
                            ) : (
                                cities.map((city) => (
                                    <li
                                        key={city.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${city.id}?type=city`}
                                        >
                                            {city.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Factions</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {factions.length === 0 ? (
                                <div>No factions...</div>
                            ) : (
                                factions.map((faction) => (
                                    <li
                                        key={faction.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${faction.id}?type=faction`}
                                        >
                                            {faction.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Quests</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {quests.length === 0 ? (
                                <div>No quests...</div>
                            ) : (
                                quests.map((quest) => (
                                    <li
                                        key={quest.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${quest.id}?type=quest`}
                                        >
                                            {quest.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger>Buildings</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {buildings.length === 0 ? (
                                <div>No quests...</div>
                            ) : (
                                buildings.map((building) => (
                                    <li
                                        key={building.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${building.id}?type=building`}
                                        >
                                            {building.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Sidebar;
