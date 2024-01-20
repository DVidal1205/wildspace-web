"use client";
import { Character, City, Faction, World } from "@prisma/client";
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
}

const Sidebar = ({ world, characters, cities, factions }: SidebarProps) => {
    const router = useRouter();
    return (
        <div className="sm:w-[98vw] sm:px-6 md:w-full md:px-0">
            <div className="flex justify-between mb-2">
                <div>{world.name}</div>
                <WorldButton world={world} />
            </div>
            <Separator />
            <Accordion type="multiple" className="">
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
            </Accordion>
        </div>
    );
};

export default Sidebar;
