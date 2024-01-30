"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Building,
    Character,
    City,
    Faction,
    Item,
    Monster,
    Quest,
    Spell,
    World,
} from "@prisma/client";
import Link from "next/link";
import WorldButton from "./WorldButton";
import { Separator } from "./ui/separator";

interface SidebarProps {
    world: World;
    characters: Character[];
    cities: City[];
    factions: Faction[];
    quests: Quest[];
    buildings: Building[];
    monsters: Monster[];
    items: Item[];
    spells: Spell[];
}

const Sidebar = ({
    world,
    characters,
    cities,
    factions,
    quests,
    buildings,
    monsters,
    items,
    spells,
}: SidebarProps) => {
    return (
        <div className="mt-2 w-full px-6 md:px-0 md:mt-0">
            <div className="flex justify-between mb-2">
                <div>{world.name}</div>
                <WorldButton world={world} />
            </div>
            <Separator className="bg-foreground" />
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
                <AccordionItem value="item-5">
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
                <AccordionItem value="item-6">
                    <AccordionTrigger>Monsters</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {monsters.length === 0 ? (
                                <div>No monsters...</div>
                            ) : (
                                monsters.map((monster) => (
                                    <li
                                        key={monster.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${monster.id}?type=monster`}
                                        >
                                            {monster.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                    <AccordionTrigger>Items</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {items.length === 0 ? (
                                <div>No items...</div>
                            ) : (
                                items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${item.id}?type=item`}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))
                            )}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-8">
                    <AccordionTrigger>Spells</AccordionTrigger>
                    <AccordionContent>
                        <ul>
                            {spells.length === 0 ? (
                                <div>No spells...</div>
                            ) : (
                                spells.map((spell) => (
                                    <li
                                        key={spell.id}
                                        className="cursor-pointer my-3"
                                    >
                                        <Link
                                            href={`/dashboard/${world.id}/${spell.id}?type=spell`}
                                        >
                                            {spell.name}
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
