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

type Entity =
    | Character
    | Building
    | Faction
    | City
    | Quest
    | Monster
    | Item
    | Spell;

export default Entity;
