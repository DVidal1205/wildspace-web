import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { any, z } from "zod";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Character } from "@prisma/client";
import fs from "fs";
import { OpenAI as MyOpenAI } from "openai";

export const appRouter = router({
    authCallback: publicProcedure.query(async () => {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user?.id || !user?.email) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            },
        });

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                },
            });
        }

        return { success: true };
    }),
    getUserWorlds: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;

        return await db.world.findMany({
            where: {
                userId,
            },
        });
    }),
    getWorldCharacters: privateProcedure
        .input(z.object({ worldID: z.string() }))
        .query(async ({ input }) => {
            const characters = await db.character.findMany({
                where: {
                    worldID: input.worldID,
                },
            });

            return characters;
        }),
    deleteWorld: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const world = await db.world.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!world) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "World not found",
                });
            }

            await db.world.delete({
                where: {
                    id: input.id,
                },
            });

            return world;
        }),
    createWorld: privateProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                worldYear: z.string(),
                magicLevel: z.string(),
                techLevel: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const world = await db.world.create({
                data: {
                    name: input.name,
                    description: input.description,
                    worldYear: input.worldYear,
                    magicLevel: input.magicLevel,
                    techLevel: input.techLevel,
                    userId,
                },
            });

            return world;
        }),
    getWorld: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const world = await db.world.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!world) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "World not found",
                });
            }

            return world;
        }),
    updateWorld: privateProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
                description: z.string(),
                worldYear: z.string(),
                magicLevel: z.string(),
                techLevel: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const world = await db.world.update({
                where: {
                    id: input.id,
                    userId,
                },
                data: {
                    name: input.name,
                    description: input.description,
                    worldYear: input.worldYear,
                    magicLevel: input.magicLevel,
                    techLevel: input.techLevel,
                },
            });

            return world;
        }),
    generateImage: privateProcedure
        .input(z.object({ object: z.any(), type: z.string() }))
        .query(async ({ input }) => {
            console.log("Entered generateImage");

            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    prompt: z
                        .string()
                        .describe(
                            "The prompt sent to the Dall E model to generate an image"
                        ),
                })
            );

            const promptTemplate = `You are an expert in writing prompts for image generation. You are writing a prompt for an image based on an input JSON object with various fields, such as fantasy race, or architecture.
            Be as descriptive as possible in your prompt, aiming for an image that is detailed and unique. Strongly specify no text in the image at the start of the generation prompt.
            Generate the prompt for a {type} based on the following input JSON object:
    
            Input JSON Object
            {input}

            {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            const response = await chain.invoke({
                input: JSON.stringify(input.object),
                type: input.type,
                formatInstructions: parser.getFormatInstructions(),
            });

            console.log("Beginning Image Thread: ", response);

            const openai = new MyOpenAI();
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: response.prompt,
                n: 1,
                size: "1024x1024",
            });

            const image_url = imageResponse.data[0].url;

            return image_url;
        }),
    generateCharacter: privateProcedure
        .input(
            z.object({
                name: z.string(),
                race: z.string(),
                cClass: z.string(),
                subclass: z.string(),
                alignment: z.string(),
                age: z.string(),
                build: z.string(),
                gender: z.string(),
                hair: z.string(),
                height: z.string(),
                backstory: z.string(),
                quirks: z.string(),
                fashion: z.string(),
                goals: z.string(),
                worldInfo: z.string(),
                prompt: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const races = [
                {
                    Race: "Aarakockra",
                    "Low Age": 3,
                    "High Age": 30,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Aasimar",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Bugbear",
                    "Low Age": 16,
                    "High Age": 80,
                    "Low Height": 72,
                    "High Height": 96,
                },
                {
                    Race: "Centaur",
                    "Low Age": 15,
                    "High Age": 100,
                    "Low Height": 72,
                    "High Height": 84,
                },
                {
                    Race: "Changeling",
                    "Low Age": 20,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Dragonborn",
                    "Low Age": 15,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Chromatic Dragonborn",
                    "Low Age": 15,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Gem Dragonborn",
                    "Low Age": 15,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Metallic Dragonborn",
                    "Low Age": 15,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Dwarves",
                    "Low Age": 50,
                    "High Age": 350,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Duergar",
                    "Low Age": 50,
                    "High Age": 350,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Hill Dwarf",
                    "Low Age": 50,
                    "High Age": 350,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Mountain Dwarf",
                    "Low Age": 50,
                    "High Age": 350,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Elves",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Astral Elf",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Drow (Dark Elf)",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Eladrin",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "High Elf",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Sea Elf",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Shadar-Kai",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Wood Elf",
                    "Low Age": 100,
                    "High Age": 750,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Fairy",
                    "Low Age": 20,
                    "High Age": 200,
                    "Low Height": 48,
                    "High Height": 72,
                },
                {
                    Race: "Firbolg",
                    "Low Age": 30,
                    "High Age": 500,
                    "Low Height": 72,
                    "High Height": 96,
                },
                {
                    Race: "Genasi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Air Genasi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Earth Genasi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Fire Genasi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Water Genasi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Giff",
                    "Low Age": 18,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Gith",
                    "Low Age": 18,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Githyanki",
                    "Low Age": 18,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Githzerai",
                    "Low Age": 18,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Gnomes",
                    "Low Age": 20,
                    "High Age": 500,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Autognome",
                    "Low Age": 20,
                    "High Age": 500,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Deep Gnome (Svirfneblin)",
                    "Low Age": 20,
                    "High Age": 500,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Forest Gnome",
                    "Low Age": 20,
                    "High Age": 500,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Rock Gnome",
                    "Low Age": 20,
                    "High Age": 500,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Goblin",
                    "Low Age": 10,
                    "High Age": 60,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Goliath",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 72,
                    "High Height": 96,
                },
                {
                    Race: "Grung",
                    "Low Age": 18,
                    "High Age": 80,
                    "Low Height": 24,
                    "High Height": 48,
                },
                {
                    Race: "Hadozee",
                    "Low Age": 15,
                    "High Age": 60,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Half-Elf",
                    "Low Age": 20,
                    "High Age": 180,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Half-Orc",
                    "Low Age": 14,
                    "High Age": 75,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Halflings",
                    "Low Age": 20,
                    "High Age": 250,
                    "Low Height": 24,
                    "High Height": 36,
                },
                {
                    Race: "Ghostwise Halfling",
                    "Low Age": 20,
                    "High Age": 250,
                    "Low Height": 24,
                    "High Height": 36,
                },
                {
                    Race: "Lightfoot Halfling",
                    "Low Age": 20,
                    "High Age": 250,
                    "Low Height": 24,
                    "High Height": 36,
                },
                {
                    Race: "Stout Halfling",
                    "Low Age": 20,
                    "High Age": 250,
                    "Low Height": 24,
                    "High Height": 36,
                },
                {
                    Race: "Harengon",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Hobgoblin",
                    "Low Age": 20,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Human",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 48,
                    "High Height": 84,
                },
                {
                    Race: "Kalashtar",
                    "Low Age": 20,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Kender",
                    "Low Age": 20,
                    "High Age": 100,
                    "Low Height": 36,
                    "High Height": 48,
                },
                {
                    Race: "Kenku",
                    "Low Age": 12,
                    "High Age": 60,
                    "Low Height": 48,
                    "High Height": 60,
                },
                {
                    Race: "Kobold",
                    "Low Age": 6,
                    "High Age": 120,
                    "Low Height": 24,
                    "High Height": 36,
                },
                {
                    Race: "Leonin",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 72,
                    "High Height": 84,
                },
                {
                    Race: "Lizardfolk",
                    "Low Age": 14,
                    "High Age": 60,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Locathah",
                    "Low Age": 10,
                    "High Age": 80,
                    "Low Height": 48,
                    "High Height": 72,
                },
                {
                    Race: "Loxodon",
                    "Low Age": 50,
                    "High Age": 450,
                    "Low Height": 72,
                    "High Height": 96,
                },
                {
                    Race: "Minotaur",
                    "Low Age": 20,
                    "High Age": 150,
                    "Low Height": 72,
                    "High Height": 84,
                },
                {
                    Race: "Orc",
                    "Low Age": 12,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Owlin",
                    "Low Age": 15,
                    "High Age": 80,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Plasmoids",
                    "Low Age": 10,
                    "High Age": 100,
                    "Low Height": 48,
                    "High Height": 72,
                },
                {
                    Race: "Satyr",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Shifter",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Simic Hybrid",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Tabaxi",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Thri-Kreen",
                    "Low Age": 5,
                    "High Age": 30,
                    "Low Height": 72,
                    "High Height": 84,
                },
                {
                    Race: "Tiefling",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Tortle",
                    "Low Age": 15,
                    "High Age": 60,
                    "Low Height": 48,
                    "High Height": 60,
                },
                {
                    Race: "Triton",
                    "Low Age": 18,
                    "High Age": 200,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Vedalken",
                    "Low Age": 20,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Verdan",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
                {
                    Race: "Warforged",
                    "Low Age": 2,
                    "High Age": 30,
                    "Low Height": 60,
                    "High Height": 84,
                },
                {
                    Race: "Yuan-Ti Pureblood",
                    "Low Age": 18,
                    "High Age": 100,
                    "Low Height": 60,
                    "High Height": 72,
                },
            ];

            function getRandomRace(): string {
                const randomIndex = Math.floor(Math.random() * races.length);
                return races[randomIndex]["Race"];
            }

            function getRandomAge(race: string): string {
                const raceData = races.find((r) => r["Race"] === race);
                if (raceData) {
                    const lowAge = raceData["Low Age"];
                    const highAge = raceData["High Age"];
                    return (
                        (
                            Math.floor(Math.random() * (highAge - lowAge + 1)) +
                            lowAge
                        ).toString() + " years"
                    );
                }
                return "0";
            }

            function getRandomHeight(race: string): string {
                const raceData = races.find((r) => r["Race"] === race);
                if (raceData) {
                    const lowHeight = raceData["Low Height"];
                    const highHeight = raceData["High Height"];
                    const totalInches =
                        Math.floor(
                            Math.random() * (highHeight - lowHeight + 1)
                        ) + lowHeight;
                    const feet = Math.floor(totalInches / 12);
                    const inches = totalInches % 12;
                    return `${feet}'${inches}"`;
                }
                return "0";
            }

            const randomRace = getRandomRace();
            const randomAge = getRandomAge(randomRace);
            const randomHeight = getRandomHeight(randomRace);

            const hairColors = [
                "Black",
                "Brown",
                "Dark Brown",
                "Light Brown",
                "Golden Brown",
                "Chestnut Brown",
                "Auburn",
                "Red",
                "Strawberry Blonde",
                "Blonde",
                "Platinum Blonde",
                "Dirty Blonde",
                "Ash Blonde",
                "Honey Blonde",
                "Sandy Blonde",
                "Silver",
                "Gray",
                "Salt and Pepper",
                "White",
                "Blue",
                "Navy Blue",
                "Teal",
                "Green",
                "Emerald Green",
                "Forest Green",
                "Olive Green",
                "Mint Green",
                "Pink",
                "Hot Pink",
                "Bubblegum Pink",
                "Lavender",
                "Purple",
                "Violet",
                "Indigo",
                "Lilac",
                "Orchid",
                "Orchid Pink",
                "Peach",
                "Copper",
                "Mahogany",
                "Burgundy",
                "Maroon",
                "Wine",
                "Rust",
                "Cinnamon",
                "Amber",
                "Honey",
                "Tawny",
                "Platinum",
                "Lavender Gray",
                "Steel Gray",
                "Charcoal",
                "Rainbow",
                "Ombre",
                "Two-Tone",
                "Highlights",
                "Lowlights",
                "Balayage",
                "Unicorn",
                "Mermaid",
                "Neon",
                "Pastel",
                "Iridescent",
                "Opal",
                "Silver Fox",
                "Natural",
            ];

            const eyeColors = [
                "Amber",
                "Blue",
                "Brown",
                "Green",
                "Gray",
                "Hazel",
                "Black",
                "Red",
                "Violet",
                "Aqua",
                "Teal",
                "Turquoise",
                "Gold",
                "Silver",
                "Copper",
                "Topaz",
                "Emerald",
                "Sapphire",
                "Ruby",
                "Opal",
                "Onyx",
                "Peridot",
                "Aquamarine",
                "Jade",
                "Bronze",
                "Chestnut",
                "Olive",
                "Lavender",
                "Indigo",
                "Honey",
                "Pink",
                "Platinum",
                "White",
                "Mixed",
                "Multicolored",
            ];

            function getRandomHairColor(): string {
                const randomIndex = Math.floor(
                    Math.random() * hairColors.length
                );
                return hairColors[randomIndex];
            }

            function getRandomEyeColor(): string {
                const randomIndex = Math.floor(
                    Math.random() * eyeColors.length
                );
                return eyeColors[randomIndex];
            }

            const randomHairColor = getRandomHairColor();
            const randomEyeColor = getRandomEyeColor();

            interface ClassesAndSubclasses {
                [key: string]: string[];
            }

            const classesAndSubclasses: ClassesAndSubclasses = {
                Artificer: [
                    "Alchemist",
                    "Armorer",
                    "Artillerist",
                    "Battle Smith",
                ],
                Barbarian: [
                    "Path of the Berserker",
                    "Path of the Totem Warrior",
                    "Path of the Ancestral Guardian",
                    "Path of the Battlerager",
                    "Path of the Beast",
                    "Path of the Wild Soul",
                ],
                Bard: [
                    "College of Lore",
                    "College of Valor",
                    "College of Glamour",
                    "College of Swords",
                    "College of Whispers",
                    "College of Eloquence",
                ],
                Cleric: [
                    "Knowledge Domain",
                    "Life Domain",
                    "Light Domain",
                    "Nature Domain",
                    "Tempest Domain",
                    "Trickery Domain",
                    "War Domain",
                    "Forge Domain",
                    "Grave Domain",
                    "Order Domain",
                    "Peace Domain",
                    "Twilight Domain",
                ],
                Druid: [
                    "Circle of the Land",
                    "Circle of the Moon",
                    "Circle of Dreams",
                    "Circle of the Shepherd",
                    "Circle of Spores",
                    "Circle of Stars",
                    "Circle of Wildfire",
                ],
                Fighter: [
                    "Battle Master",
                    "Champion",
                    "Eldritch Knight",
                    "Psi Warrior",
                    "Rune Knight",
                    "Samurai",
                ],
                Monk: [
                    "Way of the Astral Self",
                    "Way of the Drunken Master",
                    "Way of Mercy",
                    "Way of the Open Hand",
                    "Way of the Shadow",
                    "Way of the Sun Soul",
                    "Way of the Four Elements",
                    "Way of the Kensei",
                ],
                Paladin: [
                    "Oath of the Ancients",
                    "Oath of Conquest",
                    "Oath of the Crown",
                    "Oath of Devotion",
                    "Oath of Redemption",
                    "Oath of Vengeance",
                ],
                Ranger: [
                    "Beast Master",
                    "Fey Wanderer",
                    "Gloom Stalker",
                    "Horizon Walker",
                    "Hunter",
                    "Monster Slayer",
                    "Swarmkeeper",
                ],
                Rogue: [
                    "Arcane Trickster",
                    "Assassin",
                    "Inquisitive",
                    "Mastermind",
                    "Phantom",
                    "Scout",
                    "Soulknife",
                    "Swashbuckler",
                    "Thief",
                ],
                Sorcerer: [
                    "Aberrant Mind",
                    "Clockwork Soul",
                    "Divine Soul",
                    "Draconic Bloodline",
                    "Shadow Magic",
                    "Storm Sorcery",
                    "Wild Magic",
                ],
                Warlock: [
                    "The Archfey",
                    "The Celestial",
                    "The Fathomless",
                    "The Fiend",
                    "The Genie",
                    "The Great Old One",
                    "The Hexblade",
                    "The Undying",
                ],
                Wizard: [
                    "Bladesinging",
                    "Chronurgy Magic",
                    "Graviturgy Magic",
                    "School of Abjuration",
                    "School of Conjuration",
                    "School of Divination",
                    "School of Enchantment",
                    "School of Evocation",
                    "School of Illusion",
                    "School of Necromancy",
                    "School of Transmutation",
                    "War Magic",
                ],
            };

            function getRandomClass(): any {
                const randomIndex = Math.floor(
                    Math.random() * Object.keys(classesAndSubclasses).length
                );
                const randomClassName =
                    Object.keys(classesAndSubclasses)[randomIndex];
                const randomSubclasses = classesAndSubclasses[randomClassName];
                return {
                    className: randomClassName,
                    subclasses: randomSubclasses,
                };
            }

            function getRandomSubclass(randomSubclasses: string[]): string {
                const randomIndex = Math.floor(
                    Math.random() * randomSubclasses.length
                );
                return randomSubclasses[randomIndex];
            }

            const { className: randomClass, subclasses: randomSubclasses } =
                getRandomClass();
            const randomSubclass = getRandomSubclass(randomSubclasses);

            const alignmentList = [
                "Chaotic Neutral",
                "Chaotic Evil",
                "Chaotic Good",
                "True Neutral",
                "Neutral Good",
                "Neutral Evil",
                "Lawful Good",
                "Lawful Neutral",
                "Lawful Evil",
            ];

            function getRandomAlignment(): string {
                const randomIndex = Math.floor(
                    Math.random() * alignmentList.length
                );
                return alignmentList[randomIndex];
            }

            const randomAlignment = getRandomAlignment();

            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z
                        .string()
                        .describe(
                            "Name of the character (First and Last). For naming schemes, use prefixes from various languages such as Latin, Roman, Arabic, or Greek to create fantasy names. "
                        ),
                    race: z.string().describe("Fantasy Race of the Character"),
                    class: z.string().describe("Class of the Character"),
                    subclass: z.string().describe("Subclass of the Character"),
                    alignment: z
                        .string()
                        .describe("Alignment of the Character"),
                    age: z.string().describe("Age of the Character"),
                    build: z.string().describe("Build of the Character"),
                    gender: z
                        .string()
                        .describe(
                            "Gender of the Character (Male, Female, Construct, Non-binary)"
                        ),
                    hair: z.string().describe("Hair Color of the Character"),
                    height: z.string().describe("Height of the Character"),
                    backstory: z
                        .string()
                        .describe("Backstory of the Character (3-5 Sentences)"),
                    quirks: z
                        .string()
                        .describe("Quirks of the Character for roleplaying. Be specific with mannerisms or behaviors. (2-3 Sentences)"),
                    fashion: z
                        .string()
                        .describe(
                            "Fashion and physical description of the Character (2-3 Sentences)"
                        ),
                    goals: z
                        .string()
                        .describe("Goals of the Character (3-5 Sentences)"),
                })
            );

            const characterInfo = {
                name: input.name,
                race: input.race || randomRace,
                class: input.cClass || randomClass,
                subclass: input.subclass || randomSubclass,
                alignment: input.alignment || randomAlignment,
                age: input.age || randomAge,
                build: input.build,
                gender: input.gender,
                hair: input.hair,
                height: input.height || randomHeight,
                backstory: input.backstory,
                quirks: input.quirks,
                fashion: input.fashion,
                goals: input.goals,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a character concept for an NPC your party may encounter using the following information.  
        When making this character, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the character.
        Your generation Prompt: {question}
        
        {worldInfo}

        Only generate information in the character fields that are empty. For example, if the character already has a name (i.e. Name: David Stridebreaker), do not generate a new name. Only generate for the fields that are empty (i.e. Goals: ) Use the fields from the character information that are present to populate the JSON you will return.
        Existing Character Information:
        Name: {name}
        Race: {race}
        Class: {class}
        Subclass: {subclass}
        Alignment: {alignment}
        Age: {age}
        Build: {build}
        Gender: {gender}
        Hair: {hair}
        Height: {height}
        Backstory: {backstory}
        Quirks: {quirks}
        Fashion: {fashion}
        Goals: {goals}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            console.log(JSON.stringify(characterInfo));

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: characterInfo.name,
                race: characterInfo.race,
                class: characterInfo.class,
                subclass: characterInfo.subclass,
                alignment: characterInfo.alignment,
                age: characterInfo.age,
                build: characterInfo.build,
                gender: characterInfo.gender,
                hair: characterInfo.hair,
                height: characterInfo.height,
                backstory: characterInfo.backstory,
                quirks: characterInfo.quirks,
                fashion: characterInfo.fashion,
                goals: characterInfo.goals,
            });

            return response;
        }),
    saveCharacter: privateProcedure
        .input(
            z.object({
                name: z.string(),
                race: z.string(),
                cClass: z.string(),
                subclass: z.string(),
                alignment: z.string(),
                age: z.string(),
                build: z.string(),
                gender: z.string(),
                hair: z.string(),
                height: z.string(),
                backstory: z.string(),
                quirks: z.string(),
                fashion: z.string(),
                goals: z.string(),
                worldID: z.string(),
                imageURL: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const character = await db.character.create({
                data: {
                    name: input.name,
                    race: input.race,
                    class: input.cClass,
                    subclass: input.subclass,
                    alignment: input.alignment,
                    age: input.age,
                    build: input.build,
                    gender: input.gender,
                    hair: input.hair,
                    height: input.height,
                    backstory: input.backstory,
                    quirks: input.quirks,
                    fashion: input.fashion,
                    goals: input.goals,
                    worldID: input.worldID,
                    image: input.imageURL,
                    userId,
                },
            });

            return character;
        }),
});

export type AppRouter = typeof appRouter;
