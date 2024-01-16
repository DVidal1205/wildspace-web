import { Character, World } from "@prisma/client";
import { Separator } from "./ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import WorldButton from "./WorldButton";

interface SidebarProps {
    world: World;
    characters: Character[];
}

const Sidebar = ({ world, characters }: SidebarProps) => {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <div>{world.name}</div>
                <WorldButton world={world} />
            </div>
            <Separator />
            <Accordion type="multiple" className="w-full">
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
                                        <div>{character.name}</div>
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
