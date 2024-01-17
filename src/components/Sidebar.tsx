"use client";
import { Character, World } from "@prisma/client";
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
}

const Sidebar = ({ world, characters }: SidebarProps) => {
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
                    <AccordionTrigger>Buildings</AccordionTrigger>
                    <AccordionContent>
                        Yes. It comes with default styles that matches the other
                        components&apos; aesthetic.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Cities</AccordionTrigger>
                    <AccordionContent>
                        Yes. It&apos;s animated by default, but you can disable
                        it if you prefer.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Sidebar;
