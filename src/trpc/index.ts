import { db } from "@/db";
import { utapi } from "@/server/uploadthing";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { OpenAI } from "@langchain/openai";
import { TRPCError } from "@trpc/server";
import { StructuredOutputParser } from "langchain/output_parsers";
import { OpenAI as MyOpenAI } from "openai";
import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const maxDuration = 300;

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
    createStripeSession: privateProcedure
        .input(z.object({ slug: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { userId } = ctx;

            const billingUrl = absoluteUrl("/dashboard/billing");

            if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

            const dbUser = await db.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

            const subscriptionPlan = await getUserSubscriptionPlan();

            if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
                const stripeSession =
                    await stripe.billingPortal.sessions.create({
                        customer: dbUser.stripeCustomerId,
                        return_url: billingUrl,
                    });

                return { url: stripeSession.url };
            }

            const stripeSession = await stripe.checkout.sessions.create({
                success_url: billingUrl,
                cancel_url: billingUrl,
                mode: "subscription",
                billing_address_collection: "auto",
                line_items: [
                    {
                        price: PLANS.find((plan) => plan.name === input.slug)
                            ?.price.priceIds.production,
                        quantity: 1,
                    },
                ],
                metadata: {
                    userId: userId,
                },
            });

            return { url: stripeSession.url };
        }),
    getUserWorlds: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;

        return await db.world.findMany({
            where: {
                userId,
            },
        });
    }),
    getWorldEntities: privateProcedure
        .input(z.object({ worldID: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const characters = await db.character.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const cities = await db.city.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const factions = await db.faction.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const quests = await db.quest.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const buildings = await db.building.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const monsters = await db.monster.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const items = await db.item.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            const spells = await db.spell.findMany({
                where: {
                    worldID: input.worldID,
                    userId,
                },
            });

            return {
                characters,
                cities,
                factions,
                quests,
                buildings,
                monsters,
                items,
                spells,
            };
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

            const characters = await db.character.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const cities = await db.city.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const factions = await db.faction.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const monsters = await db.monster.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const quests = await db.quest.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const buildings = await db.building.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const items = await db.item.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            const spells = await db.spell.findMany({
                where: {
                    worldID: input.id,
                    userId,
                },
            });

            for (const character of characters) {
                if (character.imageKey) {
                    await utapi.deleteFiles(character.imageKey);
                }
            }

            for (const city of cities) {
                if (city.imageKey) {
                    await utapi.deleteFiles(city.imageKey);
                }
            }

            for (const faction of factions) {
                if (faction.imageKey) {
                    await utapi.deleteFiles(faction.imageKey);
                }
            }

            for (const monster of monsters) {
                if (monster.imageKey) {
                    await utapi.deleteFiles(monster.imageKey);
                }
            }

            for (const quest of quests) {
                if (quest.imageKey) {
                    await utapi.deleteFiles(quest.imageKey);
                }
            }

            for (const building of buildings) {
                if (building.imageKey) {
                    await utapi.deleteFiles(building.imageKey);
                }
            }

            for (const item of items) {
                if (item.imageKey) {
                    await utapi.deleteFiles(item.imageKey);
                }
            }

            for (const spell of spells) {
                if (spell.imageKey) {
                    await utapi.deleteFiles(spell.imageKey);
                }
            }

            if (!world) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "World not found",
                });
            }

            await db.world.delete({
                where: {
                    id: input.id,
                    userId,
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
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    prompt: z
                        .string()
                        .describe(
                            "The prompt sent to the Dall E model to generate an image"
                        ),
                })
            );

            const promptTemplate = `You are an expert in writing prompts for image generation. You are writing a prompt for an image of concept art based on an input JSON object with various fields, such as fantasy race, or architecture.
            Be as descriptive as possible in your prompt, aiming for an image that is detailed and unique. Strongly specify no text in the image at the start of the generation prompt. 
            
            If it is a character, specify no background in the nature of concept art.

            If it is an organization, specify the image to be of the organization crest, alongside what a typical member of the organization would look like.
            
            If it is a questline, specify the image to be of a scene from the questline.

            If it is a spell, specify the image to be of a scene using the spell.

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

            console.log(response.prompt);

            const openai = new MyOpenAI();
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: response.prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json",
                quality: "standard",
            });

            const imageb64 = imageResponse.data[0].b64_json;

            return imageb64;
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
                context: z.any(),
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
                        .describe(
                            "Backstory of the Character. Go into depth about where the character grew up, how they got their abilities, and what led them to become who they are now. (3-5 Sentences)"
                        ),
                    quirks: z
                        .string()
                        .describe(
                            "Quirks of the Character for roleplaying. Be specific with mannerisms or behaviors. (2-3 Sentences)"
                        ),
                    fashion: z
                        .string()
                        .describe(
                            "Fashion and physical description of the Character (2-3 Sentences)"
                        ),
                    goals: z
                        .string()
                        .describe(
                            "Goals of the Character. Be sure to tie these into the backstory of the character, and make these goals in depth. (3-5 Sentences)"
                        ),
                })
            );

            const characterInfo = {
                name: input.name,
                race: input.race || randomRace,
                class: input.cClass || randomClass,
                subclass: input.subclass || randomSubclass,
                alignment: input.alignment,
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
        When making this character, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the character. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

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
                context: JSON.stringify(input.context),
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
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let character;
            if (input.imageb64 === "") {
                character = await db.character.create({
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
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File(
                    [imageBlob],
                    `character-${filename}.png`,
                    {
                        type: "image/png",
                    }
                );
                try {
                    const response = await utapi.uploadFiles(file);
                    const imageKey = response.data?.key;
                    const imageURL = `https://utfs.io/f/${imageKey}`;

                    if (imageKey && imageURL) {
                        character = await db.character.create({
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
                                imageURL: imageURL,
                                imageKey: imageKey,
                                userId,
                            },
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            return character;
        }),
    getCharacter: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const character = await db.character.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!character) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Character not found",
                });
            }

            return character;
        }),
    updateCharacter: privateProcedure
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
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedCharacter;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.character.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });
                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }
                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File(
                    [imageBlob],
                    `character-${filename}.png`,
                    {
                        type: "image/png",
                    }
                );
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedCharacter = await db.character.update({
                        where: {
                            id: input.id,
                            userId,
                        },
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
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedCharacter = await db.character.update({
                    where: {
                        id: input.id,
                        userId,
                    },
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
                    },
                });
            }

            return updatedCharacter;
        }),
    deleteCharacter: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const character = await db.character.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (character) {
                const imageKey = character.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedCharacter = await db.character.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedCharacter;
        }),
    generateCity: privateProcedure
        .input(
            z.object({
                name: z.string(),
                population: z.string(),
                sprawl: z.string(),
                architecture: z.string(),
                industries: z.string(),
                climate: z.string(),
                safety: z.string(),
                education: z.string(),
                modernity: z.string(),
                wealth: z.string(),
                governance: z.string(),
                lore: z.string(),
                quests: z.string(),
                description: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the City"),
                    population: z
                        .string()
                        .describe(
                            "Population of the City (Add a range, and the numbers should be rounded and not evenly rounded off: i.e 135,196 instead of 135,000)"
                        ),
                    sprawl: z
                        .string()
                        .describe("Sprawl of the City (1-3 Words)"),
                    architecture: z
                        .string()
                        .describe("Architecture of the City (1-5 Words only)"),
                    industries: z
                        .string()
                        .describe("Industries of the City (1-5 Words only)"),
                    climate: z
                        .string()
                        .describe("Climate of the City (1-5 Words only)"),
                    safety: z
                        .string()
                        .describe("Safety of the City (1-5 Words only)"),
                    education: z
                        .string()
                        .describe("Education of the City (1-5 Words only)"),
                    modernity: z
                        .string()
                        .describe("modernity of the City (1-5 Words only)"),
                    wealth: z
                        .string()
                        .describe("Wealth of the City (1-5 Words only)"),
                    governance: z
                        .string()
                        .describe(
                            "Governance of the City. Detail the governing bodies structure and type (democracy, oligarchy, etc), influence over the city, and other practices they may have. Be sure to name the governing body (i.e. instead of saying council, perhaps something like the Grand Morellan Magistrate, etc.) (2-3 Sentences)"
                        ),
                    lore: z
                        .string()
                        .describe(
                            "Lore of the City. Describe the founding of the city, the foundations it was built upon, and how it has changed over time (2-3 Sentences)"
                        ),
                    quests: z
                        .string()
                        .describe(
                            "Quests of the City. Describe the quests that can be found in the city, and other plot lines for a potential session. Please be specific, using things like rumors or questboards to detail specific people or places where these plotlines can originate. (3-5 Sentences)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the City. Describe the city in detail, including the layout, the people, and the culture (3-5 Sentences)"
                        ),
                })
            );

            const cityInfo = {
                name: input.name,
                population: input.population,
                sprawl: input.sprawl,
                architecture: input.architecture,
                industries: input.industries,
                climate: input.climate,
                safety: input.safety,
                education: input.education,
                modernity: input.modernity,
                wealth: input.wealth,
                governance: input.governance,
                lore: input.lore,
                quests: input.quests,
                description: input.description,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a city concept for an location your party may travel to using the following information.  
        When making this city, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the city. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the city fields that are empty. For example, if the city already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Lore: ) Use the fields from the city information that are present to populate the JSON you will return.
        Existing City Information:
        Name: {name}
        Population: {population}
        Sprawl: {sprawl}
        Architecture: {architecture}
        Industries: {industries}
        Climate: {climate}
        Safety: {safety}
        Education: {education}
        Modernity: {modernity}
        Wealth: {wealth}
        Governance: {governance}
        Lore: {lore}
        Quests: {quests}
        Description: {description}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: cityInfo.name,
                population: cityInfo.population,
                sprawl: cityInfo.sprawl,
                architecture: cityInfo.architecture,
                industries: cityInfo.industries,
                climate: cityInfo.climate,
                safety: cityInfo.safety,
                education: cityInfo.education,
                modernity: cityInfo.modernity,
                wealth: cityInfo.wealth,
                governance: cityInfo.governance,
                lore: cityInfo.lore,
                quests: cityInfo.quests,
                description: cityInfo.description,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveCity: privateProcedure
        .input(
            z.object({
                name: z.string(),
                population: z.string(),
                sprawl: z.string(),
                architecture: z.string(),
                industries: z.string(),
                climate: z.string(),
                safety: z.string(),
                education: z.string(),
                modernity: z.string(),
                wealth: z.string(),
                governance: z.string(),
                lore: z.string(),
                quests: z.string(),
                description: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let city;
            if (input.imageb64 === "") {
                city = await db.city.create({
                    data: {
                        name: input.name,
                        population: input.population,
                        sprawl: input.sprawl,
                        architecture: input.architecture,
                        industries: input.industries,
                        climate: input.climate,
                        safety: input.safety,
                        education: input.education,
                        modernity: input.modernity,
                        wealth: input.wealth,
                        governance: input.governance,
                        lore: input.lore,
                        quests: input.quests,
                        description: input.description,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `city-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    city = await db.city.create({
                        data: {
                            name: input.name,
                            population: input.population,
                            sprawl: input.sprawl,
                            architecture: input.architecture,
                            industries: input.industries,
                            climate: input.climate,
                            safety: input.safety,
                            education: input.education,
                            modernity: input.modernity,
                            wealth: input.wealth,
                            governance: input.governance,
                            lore: input.lore,
                            quests: input.quests,
                            description: input.description,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return city;
        }),
    deleteCity: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const city = await db.city.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (city) {
                const imageKey = city.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedCity = await db.city.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedCity;
        }),
    getCity: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const city = await db.city.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!city) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "City not found",
                });
            }

            return city;
        }),
    updateCity: privateProcedure
        .input(
            z.object({
                name: z.string(),
                population: z.string(),
                sprawl: z.string(),
                architecture: z.string(),
                industries: z.string(),
                climate: z.string(),
                safety: z.string(),
                education: z.string(),
                modernity: z.string(),
                wealth: z.string(),
                governance: z.string(),
                lore: z.string(),
                quests: z.string(),
                description: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedCity;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.city.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                console.log("test?");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `city-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedCity = await db.city.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            population: input.population,
                            sprawl: input.sprawl,
                            architecture: input.architecture,
                            industries: input.industries,
                            climate: input.climate,
                            safety: input.safety,
                            education: input.education,
                            modernity: input.modernity,
                            wealth: input.wealth,
                            governance: input.governance,
                            lore: input.lore,
                            quests: input.quests,
                            description: input.description,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedCity = await db.city.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        population: input.population,
                        sprawl: input.sprawl,
                        architecture: input.architecture,
                        industries: input.industries,
                        climate: input.climate,
                        safety: input.safety,
                        education: input.education,
                        modernity: input.modernity,
                        wealth: input.wealth,
                        governance: input.governance,
                        lore: input.lore,
                        quests: input.quests,
                        description: input.description,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedCity;
        }),
    generateFaction: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                population: z.string(),
                alignment: z.string(),
                presence: z.string(),
                devotion: z.string(),
                description: z.string(),
                goals: z.string(),
                lore: z.string(),
                traits: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Faction"),
                    population: z
                        .string()
                        .describe(
                            "Population of the Faction (Add a range, and the numbers should be rounded and not evenly rounded off: i.e 135,196 instead of 135,000)"
                        ),
                    type: z
                        .string()
                        .describe(
                            "Type of the Faction, such as legislative body, cult, royal family, activism group, etc (1-5 Words)"
                        ),
                    alignment: z
                        .string()
                        .describe("Moral Alignment of the Faction"),
                    presence: z
                        .string()
                        .describe(
                            "Presence of the Faction, such as malicious, auspicious, guiding, etc. Capture the presence of this faction in the world (1-5 Words)"
                        ),
                    devotion: z
                        .string()
                        .describe(
                            "Average level of Devotion tp the Faction, such as fanatic, moderate belief, etc. Capture the devotion the average member has (1-5 Words)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Faction. Describe the faction in detail, including the layout, the people, the structure, and the culture (3-5 Sentences)"
                        ),
                    goals: z
                        .string()
                        .describe(
                            "Goals of the Faction. Describe the goals that the faction has, and how they plan to achieve them. (3-5 Sentences)"
                        ),
                    lore: z
                        .string()
                        .describe(
                            "Lore of the Faction. Describe the founding of the faction, the foundations it was built upon, and how it has changed over time (2-3 Sentences)"
                        ),
                    traits: z
                        .string()
                        .describe(
                            "Traits of the Faction. Describe the traits that the faction has, such as mannerisms of members, actions, or perhaps vanity items like clothing or jewelry (2-3 Sentences)"
                        ),
                })
            );

            const factionInfo = {
                name: input.name,
                population: input.population,
                type: input.type,
                alignment: input.alignment,
                presence: input.presence,
                devotion: input.devotion,
                description: input.description,
                goals: input.goals,
                lore: input.lore,
                traits: input.traits,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a faction concept for a faction your party may encounter the following information.  
        When making this faction, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the faction. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the faction fields that are empty. For example, if the faction already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Lore: ) Use the fields from the faction information that are present to populate the JSON you will return.
        
        Existing Faction Information:
        Name: {name}
        Population: {population}
        Type: {type}
        Alignment: {alignment}
        Presence: {presence}
        Devotion: {devotion}
        Description: {description}
        Goals: {goals}
        Lore: {lore}
        Traits: {traits}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: factionInfo.name,
                population: factionInfo.population,
                type: factionInfo.type,
                alignment: factionInfo.alignment,
                presence: factionInfo.presence,
                devotion: factionInfo.devotion,
                description: factionInfo.description,
                goals: factionInfo.goals,
                lore: factionInfo.lore,
                traits: factionInfo.traits,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveFaction: privateProcedure
        .input(
            z.object({
                name: z.string(),
                population: z.string(),
                type: z.string(),
                alignment: z.string(),
                presence: z.string(),
                devotion: z.string(),
                description: z.string(),
                goals: z.string(),
                lore: z.string(),
                traits: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let faction;
            if (input.imageb64 === "") {
                faction = await db.faction.create({
                    data: {
                        name: input.name,
                        population: input.population,
                        type: input.type,
                        alignment: input.alignment,
                        presence: input.presence,
                        devotion: input.devotion,
                        description: input.description,
                        goals: input.goals,
                        lore: input.lore,
                        traits: input.traits,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `faction-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    faction = await db.faction.create({
                        data: {
                            name: input.name,
                            population: input.population,
                            type: input.type,
                            alignment: input.alignment,
                            presence: input.presence,
                            devotion: input.devotion,
                            description: input.description,
                            goals: input.goals,
                            lore: input.lore,
                            traits: input.traits,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return faction;
        }),
    deleteFaction: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const faction = await db.faction.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (faction) {
                const imageKey = faction.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedFaction = await db.faction.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedFaction;
        }),
    getFaction: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const faction = await db.faction.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!faction) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Character not found",
                });
            }

            return faction;
        }),
    updateFaction: privateProcedure
        .input(
            z.object({
                name: z.string(),
                population: z.string(),
                type: z.string(),
                alignment: z.string(),
                presence: z.string(),
                devotion: z.string(),
                goals: z.string(),
                lore: z.string(),
                traits: z.string(),
                description: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedFaction;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.faction.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `faction-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedFaction = await db.faction.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            population: input.population,
                            type: input.type,
                            alignment: input.alignment,
                            presence: input.presence,
                            devotion: input.devotion,
                            description: input.description,
                            goals: input.goals,
                            lore: input.lore,
                            traits: input.traits,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedFaction = await db.faction.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        population: input.population,
                        type: input.type,
                        alignment: input.alignment,
                        presence: input.presence,
                        devotion: input.devotion,
                        description: input.description,
                        goals: input.goals,
                        lore: input.lore,
                        traits: input.traits,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedFaction;
        }),
    generateQuest: privateProcedure
        .input(
            z.object({
                name: z.string(),
                difficulty: z.string(),
                description: z.string(),
                discovery: z.string(),
                objective: z.string(),
                consequences: z.string(),
                rewards: z.string(),
                outcomes: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Quest"),
                    difficulty: z
                        .string()
                        .describe(
                            "Difficulty of the Quest (1-5 Words, i.e. Easy, Hard, etc)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Quest. Describe the quest in detail, including the layout, the people, and the process. Pay great attention to the steps the party must do to complete the quests, as if you are taking notes for the session as a DM (3-5 Sentences)"
                        ),
                    discovery: z
                        .string()
                        .describe(
                            "Discovery of the Quest. Describe how the quest is discovered, and how the party may find it, as well as who or where the quest is hosted. Also, detail the information the party will know, which should not be the full picture (3-5 Sentences)"
                        ),
                    objective: z
                        .string()
                        .describe(
                            "Objective of the Quest. Describe the objective of the quest, and how the party may complete it (3-5 Sentences)"
                        ),
                    consequences: z
                        .string()
                        .describe(
                            "Consequences of the Quest. Describe the consequences of the quest, and how the party may be affected by it (3-5 Sentences)"
                        ),
                    rewards: z
                        .string()
                        .describe(
                            "Rewards of the Quest. Describe the rewards of the quest, and how the party may be rewarded by it (3-5 Sentences)"
                        ),
                    outcomes: z
                        .string()
                        .describe(
                            "Outcomes of the Quest. Describe the outcomes of the quest, and how the party may be affected by it (3-5 Sentences)"
                        ),
                })
            );

            const questInfo = {
                name: input.name,
                difficulty: input.difficulty,
                description: input.description,
                discovery: input.discovery,
                objective: input.objective,
                consequences: input.consequences,
                rewards: input.rewards,
                outcomes: input.outcomes,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a quest/plotline concept for a quest your party may encounter the following information.  
        When making this quest, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the quest. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the quest fields that are empty. For example, if the quest already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Backstory: ) Use the fields from the quest information that are present to populate the JSON you will return.
        
        Existing Quest Information:
        Name: {name}
        Difficulty: {difficulty}
        Description: {description}
        Discovery: {discovery}
        Objective: {objective}
        Consequences: {consequences}
        Rewards: {rewards}
        Outcomes: {outcomes}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: questInfo.name,
                difficulty: questInfo.difficulty,
                description: questInfo.description,
                discovery: questInfo.discovery,
                objective: questInfo.objective,
                consequences: questInfo.consequences,
                rewards: questInfo.rewards,
                outcomes: questInfo.outcomes,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveQuest: privateProcedure
        .input(
            z.object({
                name: z.string(),
                difficulty: z.string(),
                description: z.string(),
                discovery: z.string(),
                objective: z.string(),
                consequences: z.string(),
                rewards: z.string(),
                outcomes: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let quest;
            if (input.imageb64 === "") {
                quest = await db.quest.create({
                    data: {
                        name: input.name,
                        difficulty: input.difficulty,
                        description: input.description,
                        discovery: input.discovery,
                        objective: input.objective,
                        consequences: input.consequences,
                        rewards: input.rewards,
                        outcomes: input.outcomes,

                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `quest-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    quest = await db.quest.create({
                        data: {
                            name: input.name,
                            difficulty: input.difficulty,
                            description: input.description,
                            discovery: input.discovery,
                            objective: input.objective,
                            consequences: input.consequences,
                            rewards: input.rewards,
                            outcomes: input.outcomes,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return quest;
        }),
    deleteQuest: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const quest = await db.quest.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (quest) {
                const imageKey = quest.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedQuest = await db.quest.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedQuest;
        }),
    getQuest: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const quest = await db.quest.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!quest) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Quest not found",
                });
            }

            return quest;
        }),
    updateQuest: privateProcedure
        .input(
            z.object({
                name: z.string(),
                difficulty: z.string(),
                description: z.string(),
                discovery: z.string(),
                objective: z.string(),
                consequences: z.string(),
                rewards: z.string(),
                outcomes: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedQuest;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.quest.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `quest-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedQuest = await db.quest.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            difficulty: input.difficulty,
                            description: input.description,
                            discovery: input.discovery,
                            objective: input.objective,
                            consequences: input.consequences,
                            rewards: input.rewards,
                            outcomes: input.outcomes,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedQuest = await db.quest.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        difficulty: input.difficulty,
                        description: input.description,
                        discovery: input.discovery,
                        objective: input.objective,
                        consequences: input.consequences,
                        rewards: input.rewards,
                        outcomes: input.outcomes,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedQuest;
        }),
    generateBuilding: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                ambience: z.string(),
                architecture: z.string(),
                traffic: z.string(),
                description: z.string(),
                vendor: z.string(),
                goods: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Building"),
                    type: z
                        .string()
                        .describe(
                            "Type of the Building, such as commercial, industrial, etc. If goods or services are offered, specify what type of building (Ex. Library, Tavern, Antique Shop, etc). (1-5 Words)"
                        ),
                    size: z
                        .string()
                        .describe(
                            "Size of the Building, such as small, large, etc. (1-5 Words)"
                        ),
                    architecture: z
                        .string()
                        .describe(
                            "Architecture of the Building, such as modern, gothic, etc. (1-5 Words)"
                        ),
                    ambience: z
                        .string()
                        .describe(
                            "Ambience of the Building, such as busy, quiet, etc. (1-5 Words)"
                        ),
                    traffic: z
                        .string()
                        .describe(
                            "Foot traffic of the Building, such as busy, quiet, etc. (1-5 Words)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Building. Describe the building in detail, including the layout, the people, and the scene upon entering (3-5 Sentences)"
                        ),
                    vendor: z
                        .string()
                        .describe(
                            "Vendor of the Building. Describe the vendor of the building, what they offer, and how they interact with people in the building. Be sure to give a name and a fantasy race when describing the vendor. (3-5 Sentences)"
                        ),
                    goods: z
                        .string()
                        .describe(
                            "Goods and Services of the Building. This should be represented as a string representing a two-columned markdown table, representing the good and the cost (in sp or gp). Be creative with these items or services, some including Names, as they should be unique to each shop. (i.e., the Broken Barstool may sell the Begrudged Beer for 5sp, which is the bars specialty.) Be sure to separate new lines with the \n character. An example table would be formatted as follows: | Price | Item | \n | ---- | ---- | \n | Healing Potion | 5gp | Note the row with ---- to separate the header and footer. The last row should NOT be followd be \n. The \n MUST have a space on the left and right of it in order to work  (Markdown Table, with 10-15 rows, 2 columns)"
                        ),
                })
            );

            const buildingInfo = {
                name: input.name,
                type: input.type,
                size: input.size,
                ambience: input.ambience,
                architecture: input.architecture,
                traffic: input.traffic,
                description: input.description,
                vendor: input.vendor,
                goods: input.goods,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a building/shop concept for a building your party may encounter the following information.  
        When making this building, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the building. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the building fields that are empty. For example, if the buidling already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Backstory: ) Use the fields from the building information that are present to populate the JSON you will return.
        
        Existing Building Information:
        Name: {name}
        Type: {type}
        Size: {size}
        Ambience: {ambience}
        Architecture: {architecture}
        Traffic: {traffic}
        Description: {description}
        Vendor: {vendor}
        Goods: {goods}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1000 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: buildingInfo.name,
                type: buildingInfo.type,
                size: buildingInfo.size,
                ambience: buildingInfo.ambience,
                architecture: buildingInfo.architecture,
                traffic: buildingInfo.traffic,
                description: buildingInfo.description,
                vendor: buildingInfo.vendor,
                goods: buildingInfo.goods,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveBuilding: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                ambience: z.string(),
                architecture: z.string(),
                traffic: z.string(),
                description: z.string(),
                vendor: z.string(),
                goods: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let building;
            if (input.imageb64 === "") {
                building = await db.building.create({
                    data: {
                        name: input.name,
                        type: input.type,
                        size: input.size,
                        ambience: input.ambience,
                        architecture: input.architecture,
                        traffic: input.traffic,
                        description: input.description,
                        vendor: input.vendor,
                        goods: input.goods,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `building-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    building = await db.building.create({
                        data: {
                            name: input.name,
                            type: input.type,
                            size: input.size,
                            ambience: input.ambience,
                            architecture: input.architecture,
                            traffic: input.traffic,
                            description: input.description,
                            vendor: input.vendor,
                            goods: input.goods,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return building;
        }),
    deleteBuilding: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const building = await db.building.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (building) {
                const imageKey = building.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedBuilding = await db.building.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedBuilding;
        }),
    getBuilding: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const building = await db.building.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!building) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Building not found",
                });
            }

            return building;
        }),
    updateBuilding: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                ambience: z.string(),
                architecture: z.string(),
                traffic: z.string(),
                description: z.string(),
                vendor: z.string(),
                goods: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedBuilding;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.building.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `building-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedBuilding = await db.building.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            type: input.type,
                            size: input.size,
                            ambience: input.ambience,
                            architecture: input.architecture,
                            traffic: input.traffic,
                            description: input.description,
                            vendor: input.vendor,
                            goods: input.goods,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedBuilding = await db.building.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        type: input.type,
                        size: input.size,
                        ambience: input.ambience,
                        architecture: input.architecture,
                        traffic: input.traffic,
                        description: input.description,
                        vendor: input.vendor,
                        goods: input.goods,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedBuilding;
        }),
    generateMonster: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                alignment: z.string(),
                resistances: z.string(),
                stats: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Monster"),
                    type: z
                        .string()
                        .describe(
                            "Type of the creature, such as humanoid, aberration, fiend, etc (1-5 Words)"
                        ),
                    size: z
                        .string()
                        .describe(
                            "Size of the creature, such as small, medium, large, huge, etc. (1-5 Words)"
                        ),
                    alignment: z
                        .string()
                        .describe(
                            "Alignment of the creature, such as lawful good, chaotic evil, etc. (1-5 Words)"
                        ),
                    resistances: z
                        .string()
                        .describe(
                            "Damage resistances of the creature, such as fire, poison, etc."
                        ),
                    stats: z
                        .string()
                        .describe(
                            "Stats of the creature, and MUSt include Armor Class, Movement Speed in feet, Passive Perception, Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. This should be represented as a string representing a nine-columned markdown table, representing the statistic and its value. Be sure to separate new lines with the \n character. An example table would be formatted as follows: | AC | Move Speed | \n | ---- | ---- | \n | 18 | 50ft, 30ft flying |. Note the row with ---- to separate the header and footer. The last row should not be followed by \n or a period. The \n MUST have a space on the left and right of it in order to work (| \n | and not |\n|)  (Markdown Table with 2 rows and 9 columns)"
                        ),
                    abilities: z
                        .string()
                        .describe(
                            "Abilities of the creature, including passive abilities, Actions, Reactions, and Bonus Actions. If these abilities do damage, include the amount as a combination of dice (i.e. 10d8, 4d6, 5d4) This should be represented as a string representing a three-columned markdown table, representing the name of the ability, the description of the ability, and the action cost of the ability (Action, Bonus Action, Reaction). Be sure to separate new lines with the \n character. An example table would be formatted as follows: | Name | Description | Cost | \n | ---- | ---- | ---- | \n | Amphibious | The creature can breathe air and water. | Passive Ability |. Note the row with ---- to separate the header and footer. The last row should not be followed by \n or a period. The \n MUST have a space on the left and right of it in order to work (| \n | and not |\n|)  (Markdown Table with 2 rows and 3 columns)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Monster. Describe the monster in detail, including the physical description, nature of abilities, and the scene it is in (3-5 Sentences)"
                        ),
                    lore: z
                        .string()
                        .describe(
                            "Lore of the Monster. Describe the lore of the monster, and how it came to be. (3-5 Sentences)"
                        ),
                })
            );

            const monsterTypes = [
                "Aberration",
                "Beast",
                "Celestial",
                "Construct",
                "Dragon",
                "Elemental",
                "Fey",
                "Fiend",
                "Giant",
                "Humanoid",
                "Monstrosity",
                "Ooze",
                "Plant",
                "Undead",
            ];

            const monsterSizes = [
                "Tiny",
                "Small",
                "Medium",
                "Large",
                "Huge",
                "Gargantuan",
            ];

            const monsterAlignments = [
                "Lawful Good",
                "Neutral Good",
                "Chaotic Good",
                "Lawful Neutral",
                "Neutral",
                "Chaotic Neutral",
                "Lawful Evil",
                "Neutral Evil",
                "Chaotic Evil",
            ];

            function getRandomSize(): string {
                const randomIndex = Math.floor(
                    Math.random() * monsterSizes.length
                );
                return monsterSizes[randomIndex];
            }

            function getRandomAlignment(): string {
                const randomIndex = Math.floor(
                    Math.random() * monsterAlignments.length
                );
                return monsterAlignments[randomIndex];
            }

            function getRandomType(): string {
                const randomIndex = Math.floor(
                    Math.random() * monsterTypes.length
                );
                return monsterTypes[randomIndex];
            }

            const randomSize = getRandomSize();
            const randomAlignment = getRandomAlignment();
            const randomType = getRandomType();

            const monsterInfo = {
                name: input.name,
                type: input.type ? input.type : randomType,
                size: input.size ? input.size : randomSize,
                alignment: input.alignment ? input.alignment : randomAlignment,
                resistances: input.resistances,
                stats: input.stats,
                abilities: input.abilities,
                description: input.description,
                lore: input.lore,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a Creature/Enemy concept for a creature your party may encounter the following information.  
        When making this enemy, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the creature. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the monster fields that are empty. For example, if the monster already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Backstory: ) Use the fields from the monster information that are present to populate the JSON you will return.
        
        Existing Monster Information:
        Name: {name}
        Type: {type}
        Size: {size}
        Alignment: {alignment}
        Resistances: {resistances}
        Stats: {stats}
        Abilities: {abilities}
        Description: {description}
        Lore: {lore}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1500 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: monsterInfo.name,
                type: monsterInfo.type,
                size: monsterInfo.size,
                alignment: monsterInfo.alignment,
                resistances: monsterInfo.resistances,
                stats: monsterInfo.stats,
                abilities: monsterInfo.abilities,
                description: monsterInfo.description,
                lore: monsterInfo.lore,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveMonster: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                alignment: z.string(),
                resistances: z.string(),
                stats: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let monster;
            if (input.imageb64 === "") {
                monster = await db.monster.create({
                    data: {
                        name: input.name,
                        type: input.type,
                        size: input.size,
                        alignment: input.alignment,
                        resistances: input.resistances,
                        stats: input.stats,
                        abilities: input.abilities,
                        description: input.description,
                        lore: input.lore,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `monster-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    monster = await db.monster.create({
                        data: {
                            name: input.name,
                            type: input.type,
                            size: input.size,
                            alignment: input.alignment,
                            resistances: input.resistances,
                            stats: input.stats,
                            abilities: input.abilities,
                            description: input.description,
                            lore: input.lore,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return monster;
        }),
    deleteMonster: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const monster = await db.monster.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (monster) {
                const imageKey = monster.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedMonster = await db.monster.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedMonster;
        }),
    getMonster: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const monster = await db.monster.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!monster) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Monster not found",
                });
            }

            return monster;
        }),
    updateMonster: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                size: z.string(),
                alignment: z.string(),
                resistances: z.string(),
                stats: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedMonster;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.monster.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `monster-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedMonster = await db.monster.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            type: input.type,
                            size: input.size,
                            alignment: input.alignment,
                            resistances: input.resistances,
                            stats: input.stats,
                            abilities: input.abilities,
                            description: input.description,
                            lore: input.lore,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedMonster = await db.monster.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        type: input.type,
                        size: input.size,
                        alignment: input.alignment,
                        resistances: input.resistances,
                        stats: input.stats,
                        abilities: input.abilities,
                        description: input.description,
                        lore: input.lore,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedMonster;
        }),
    generateItem: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Item"),
                    type: z
                        .string()
                        .describe(
                            "Type of the item, which includes its rarity (i.e. Legendary Weapon, Uncommon Wondrous Item, etc) (1-5 Words)"
                        ),
                    abilities: z
                        .string()
                        .describe(
                            "Abilities of the item, including passive abilities, Actions, Reactions, and Bonus Actions. If these abilities do damage, include the amount as a combination of dice (i.e. 10d8, 4d6, 5d4) This should be represented as a string representing a three-columned markdown table, representing the name of the ability, the description of the ability, and the action cost of the ability (Action, Bonus Action, Reaction). Be sure to separate new lines with the \n character. An example table would be formatted as follows: | Name | Description | Cost | \n | ---- | ---- | ---- | \n | Retraction | As a bonus action, you can retract the armblade into your forearm or extend it from there. While it is extended, you can use the weapon as if you were holding it, and you can't use that hand for other purposes. | Bonus Action |. Note the row with ---- to separate the header and footer. The last row should not be followed by \n or a period. The \n MUST have a space on the left and right of it in order to work (| \n | and not |\n|)  (Markdown Table with 4-5 rows and 3 columns)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Item. Describe the item in detail, including the physical description, nature of abilities, and the scene it is found in (3-5 Sentences)"
                        ),
                    lore: z
                        .string()
                        .describe(
                            "Lore of the Item. Describe the lore of the item, and how it came to be. (3-5 Sentences)"
                        ),
                })
            );

            function getRandomRarityAndType(): string {
                const itemTypes = [
                    "Weapon",
                    "Armor",
                    "Wondrous Item",
                    "Potion",
                    "Scroll",
                    "Ring",
                    "Rod",
                    "Staff",
                    "Wand",
                ];

                const itemRarities = [
                    "Common",
                    "Uncommon",
                    "Rare",
                    "Very Rare",
                    "Legendary",
                    "Artifact",
                    "Unique",
                    "Unknown",
                ];

                const randomType =
                    itemTypes[Math.floor(Math.random() * itemTypes.length)];
                const randomRarity =
                    itemRarities[
                        Math.floor(Math.random() * itemRarities.length)
                    ];

                const requiresAttunement =
                    Math.random() < 0.2 ? ", requires Attunement" : "";

                return `${randomRarity} ${randomType}${requiresAttunement}`;
            }

            const randomTypeAndRarity = getRandomRarityAndType();

            const itemInfo = {
                name: input.name,
                type: input.type ? input.type : randomTypeAndRarity,
                abilities: input.abilities,
                description: input.description,
                lore: input.lore,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a item concept for a creature your party may encounter the following information.  
        When making this item, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the item. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the item fields that are empty. For example, if the item already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Backstory: ) Use the fields from the item information that are present to populate the JSON you will return.
        
        Existing Item Information:
        Name: {name}
        Type: {type}
        Abilities: {abilities}
        Description: {description}
        Lore: {lore}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1500 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: itemInfo.name,
                type: itemInfo.type,
                abilities: itemInfo.abilities,
                description: itemInfo.description,
                lore: itemInfo.lore,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveItem: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let item;
            if (input.imageb64 === "") {
                item = await db.item.create({
                    data: {
                        name: input.name,
                        type: input.type,
                        abilities: input.abilities,
                        description: input.description,
                        lore: input.lore,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `item-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    item = await db.item.create({
                        data: {
                            name: input.name,
                            type: input.type,
                            abilities: input.abilities,
                            description: input.description,
                            lore: input.lore,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return item;
        }),
    deleteItem: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const item = await db.item.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (item) {
                const imageKey = item.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedItem = await db.item.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedItem;
        }),
    getItem: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const item = await db.item.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!item) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Item not found",
                });
            }

            return item;
        }),
    updateItem: privateProcedure
        .input(
            z.object({
                name: z.string(),
                type: z.string(),
                abilities: z.string(),
                description: z.string(),
                lore: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedItem;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.item.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `item-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedItem = await db.item.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            type: input.type,
                            abilities: input.abilities,
                            description: input.description,
                            lore: input.lore,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedItem = await db.item.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        type: input.type,
                        abilities: input.abilities,
                        description: input.description,
                        lore: input.lore,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedItem;
        }),
    generateSpell: privateProcedure
        .input(
            z.object({
                name: z.string(),
                level: z.string(),
                school: z.string(),
                castingTime: z.string(),
                range: z.string(),
                components: z.string(),
                duration: z.string(),
                description: z.string(),
                spellList: z.string(),
                context: z.any(),
                prompt: z.string(),
                worldInfo: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const parser = StructuredOutputParser.fromZodSchema(
                z.object({
                    name: z.string().describe("Name of the Spell"),
                    level: z
                        .string()
                        .describe(
                            "Level of the spell, such as 1st, 2nd, 3rd, etc. (Maximum 9th. If 9th, do not include details on upcasting) (1-5 Words)"
                        ),
                    school: z
                        .string()
                        .describe(
                            "School of the spell, such as Conjuration, Evocation, etc. (1-5 Words)"
                        ),
                    castingTime: z
                        .string()
                        .describe(
                            "Casting time of the spell, such as 1 action, 1 minute, etc. (1-5 Words)"
                        ),
                    range: z
                        .string()
                        .describe(
                            "Range of the spell, such as 30 feet, 60 feet, etc. (1-5 Words)"
                        ),
                    components: z
                        .string()
                        .describe(
                            "Components of the spell, such as Verbal, Somatic, Material, etc. If it requires material components, please specify which (1-5 Words)"
                        ),
                    duration: z
                        .string()
                        .describe(
                            "Duration of the spell, such as Instantaneous, 1 minute, etc. If the spell requires concentration, specify that as well (1-5 Words)"
                        ),
                    description: z
                        .string()
                        .describe(
                            "Description of the Spell in markdown. The description should start with the spells name, bolded using markdown conventions and with a colon. Describe the spells abilities in detail, including dice values for any damage or healing dealth by the spell. Mention if the spell is single target or multiple, and if it is an area of effect, specify the area. Lastly, on a new line using the \n character, detail the upcast scaling for this spell, if applicable. Use markdown formatting to create this spell description, using ** for bold (i.e. **Detect Evil and Good:**). Also use the \n tag as needed to separate content properly (3-5 Sentences)"
                        ),
                    spellList: z
                        .string()
                        .describe(
                            "Spell List of the Spell. Specify which classes can learn this spell. (1-6 Words, which are classes in a comma separated list)"
                        ),
                })
            );

            const spellInfo = {
                name: input.name,
                level: input.level,
                school: input.school,
                castingTime: input.castingTime,
                range: input.range,
                components: input.components,
                duration: input.duration,
                description: input.description,
                spellList: input.spellList,
            };

            const worldInfo = { worldInfo: input.worldInfo };

            const promptTemplate = `You are an expert World Builder for Fictional Fantasy Worlds.
        You come up with catchy and memorable ideas for a Fictional World. 
        Create a spell concept for a creature your party may encounter the following information.  
        When making this spell, be sure to contextualize the following information about the world as best as possible, i.e, include the world into your generation of the spell. You may be also asked to contextualize another entity, such as a person, place, or country. Be sure to include details of that entity, and be sure to use the name of the entity.
        
        Your generation Prompt: 
        {question}
        
        World Information:
        {worldInfo}

        Other Entity to contextualize:
        {context}

        Only generate information in the spell fields that are empty. For example, if the spell already has a name (i.e. Name: Demacia), do not generate a new name. Only generate for the fields that are empty (i.e. Backstory: ) Use the fields from the spell information that are present to populate the JSON you will return.
        
        Existing Spell Information:
        Name: {name}
        Level: {level}
        School: {school}
        Casting Time: {castingTime}
        Range: {range}
        Components: {components}
        Duration: {duration}
        Description: {description}
        Spell List: {spellList}

        {formatInstructions}`;

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(promptTemplate),
                new OpenAI({ temperature: 0.9, maxTokens: 1500 }),
                parser,
            ]);

            const response = await chain.invoke({
                question: input.prompt,
                formatInstructions: parser.getFormatInstructions(),
                worldInfo: worldInfo.worldInfo,
                name: spellInfo.name,
                level: spellInfo.level,
                school: spellInfo.school,
                castingTime: spellInfo.castingTime,
                range: spellInfo.range,
                components: spellInfo.components,
                duration: spellInfo.duration,
                description: spellInfo.description,
                spellList: spellInfo.spellList,
                context: JSON.stringify(input.context),
            });

            return response;
        }),
    saveSpell: privateProcedure
        .input(
            z.object({
                name: z.string(),
                level: z.string(),
                school: z.string(),
                castingTime: z.string(),
                range: z.string(),
                components: z.string(),
                duration: z.string(),
                description: z.string(),
                spellList: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let spell;
            if (input.imageb64 === "") {
                spell = await db.spell.create({
                    data: {
                        name: input.name,
                        level: input.level,
                        school: input.school,
                        castingTime: input.castingTime,
                        range: input.range,
                        components: input.components,
                        duration: input.duration,
                        description: input.description,
                        spellList: input.spellList,
                        worldID: input.worldID,
                        imageURL: "",
                        imageKey: "",
                        userId,
                    },
                });
            } else {
                const imageBlob = b64toBlob(input.imageb64, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `spell-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    spell = await db.spell.create({
                        data: {
                            name: input.name,
                            level: input.level,
                            school: input.school,
                            castingTime: input.castingTime,
                            range: input.range,
                            components: input.components,
                            duration: input.duration,
                            description: input.description,
                            spellList: input.spellList,
                            worldID: input.worldID,
                            imageURL: imageURL,
                            imageKey: imageKey,
                            userId,
                        },
                    });
                }
            }

            return spell;
        }),
    deleteSpell: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            const spell = await db.spell.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (spell) {
                const imageKey = spell.imageKey;
                if (imageKey) {
                    await utapi.deleteFiles(imageKey);
                }
            }

            const deletedSpell = await db.spell.delete({
                where: {
                    id: input.id,
                    userId,
                },
            });

            return deletedSpell;
        }),
    getSpell: privateProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const { userId } = ctx;

            const spell = await db.spell.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            });

            if (!spell) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Spell not found",
                });
            }

            return spell;
        }),
    updateSpell: privateProcedure
        .input(
            z.object({
                name: z.string(),
                level: z.string(),
                school: z.string(),
                castingTime: z.string(),
                range: z.string(),
                components: z.string(),
                duration: z.string(),
                description: z.string(),
                spellList: z.string(),
                worldID: z.string(),
                imageb64: z.string(),
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx;

            function b64toBlob(
                b64Data: string,
                contentType: string = ""
            ): Blob {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 512
                ) {
                    const slice = byteCharacters.slice(offset, offset + 512);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                return new Blob(byteArrays, { type: contentType });
            }

            let updatedSpell;

            if (input.imageb64.startsWith("data:image/png;base64,")) {
                const preMutate = await db.spell.findFirst({
                    where: {
                        id: input.id,
                        userId,
                    },
                });

                if (preMutate) {
                    const imageKey = preMutate.imageKey;
                    if (imageKey) {
                        await utapi.deleteFiles(imageKey);
                    }
                }

                const b64Data = input.imageb64.split(",")[1];
                const imageBlob = b64toBlob(b64Data, "image/png");
                const filename = input.name
                    ? input.name.toLowerCase().replace(/ /g, "_")
                    : "default";

                const file = new File([imageBlob], `spell-${filename}.png`, {
                    type: "image/png",
                });
                const response = await utapi.uploadFiles(file);
                const imageKey = response.data?.key;
                const imageURL = `https://utfs.io/f/${imageKey}`;

                if (imageKey && imageURL) {
                    updatedSpell = await db.spell.update({
                        where: {
                            id: input.id,
                            userId,
                        },
                        data: {
                            name: input.name,
                            level: input.level,
                            school: input.school,
                            castingTime: input.castingTime,
                            range: input.range,
                            components: input.components,
                            duration: input.duration,
                            description: input.description,
                            spellList: input.spellList,
                            worldID: input.worldID,
                            imageKey: imageKey,
                            imageURL: imageURL,
                        },
                    });
                }
            } else {
                updatedSpell = await db.spell.update({
                    where: {
                        id: input.id,
                        userId,
                    },
                    data: {
                        name: input.name,
                        level: input.level,
                        school: input.school,
                        castingTime: input.castingTime,
                        range: input.range,
                        components: input.components,
                        duration: input.duration,
                        description: input.description,
                        spellList: input.spellList,
                        worldID: input.worldID,
                    },
                });
            }

            return updatedSpell;
        }),
});

export type AppRouter = typeof appRouter;
