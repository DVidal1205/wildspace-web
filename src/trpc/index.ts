import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import {privateProcedure, publicProcedure, router} from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import {z} from 'zod'
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Character } from '@prisma/client';

export const appRouter = router({
    authCallback: publicProcedure.query(async ()  => {
        const {getUser} = getKindeServerSession();
        const user = await getUser();

        if (!user?.id || !user?.email) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
        }

        const dbUser = await db.user.findFirst({ 
            where: { 
                id: user.id 
            } 
        });

        if (!dbUser) {
            await db.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                }
            });
        }

        return { success: true };
    }),
    getUserWorlds: privateProcedure.query(async ({ ctx }) => {
        const {userId} = ctx;

        return await db.world.findMany({
            where:{
                userId 
            }
        })
    }),
    getWorldCharacters: privateProcedure.input(z.object({worldID: z.string()})).query(async ({ input }) => {
        const characters =  await db.character.findMany({
            where:{
                worldID: input.worldID, 
            }
        })

        return characters;
    }),
    deleteWorld: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ctx, input}) => {
        const {userId} = ctx;

        const world = await db.world.findFirst({
            where: {
                id: input.id,
                userId,
            }
        });

        if (!world) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'World not found' });
        }

        await db.world.delete({
            where: {
                id: input.id,
            }
        });

        return world;
    }),
    createWorld: privateProcedure.input(z.object({ name: z.string(), description: z.string(), worldYear: z.string(), magicLevel: z.string(), techLevel: z.string() })).mutation(async ({ctx, input}) => {
        const {userId} = ctx;

        const world = await db.world.create({
            data: {
                name: input.name,
                description: input.description,
                worldYear: input.worldYear,
                magicLevel: input.magicLevel,
                techLevel: input.techLevel,
                userId,
            }
        });

        return world;
    }),
    getWorld: privateProcedure.input(z.object({ id: z.string() })).query(async ({ctx, input}) => {
        const {userId} = ctx;

        const world = await db.world.findFirst({
            where: {
                id: input.id,
                userId,
            }
        });

        if (!world) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'World not found' });
        }

        return world;
    }),
    updateWorld: privateProcedure.input(z.object({ id: z.string(), name: z.string(), description: z.string(), worldYear: z.string(), magicLevel: z.string(), techLevel: z.string() })).mutation(async ({ctx, input}) => {
        const {userId} = ctx;

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
            }
        });

        return world;
    }),
    generateCharacter: privateProcedure.input(z.object({ 
        name: z.string(),
        race: z.string(),
        cClass: z.string(),
        subclass: z.string(),
        alignment: z.string(),
        age: z.string(),
        build: z.string(),
        eyes: z.string(),
        hair: z.string(),
        height: z.string(),
        backstory: z.string(),
        quirks: z.string(),
        fashion: z.string(),
        goals: z.string(),
        worldInfo: z.string(),
        prompt: z.string(),
    })).query(async ({ctx, input}) => {

        const parser = StructuredOutputParser.fromZodSchema(
            z.object({
                name: z.string().describe("Name of the character (First and Last). For naming schemes, use prefixes from various languages such as Latin, Roman, Arabic, or Greek to create fantasy names. "),
                race: z.string().describe("Fantasy Race of the Character"),
                class: z.string().describe("Class of the Character"),
                subclass: z.string().describe("Subclass of the Character"),
                alignment: z.string().describe("Alignment of the Character"),
                age: z.string().describe("Age of the Character"),
                build: z.string().describe("Build of the Character"),
                eyes: z.string().describe("Eye Color of the Character"),
                hair: z.string().describe("Hair Color of the Character"),
                height: z.string().describe("Height of the Character"),
                backstory: z.string().describe("Backstory of the Character (2-3 Sentences)"),
                quirks: z.string().describe("Quirks of the Character (2-3 Sentences)"),
                fashion: z.string().describe("Fashion of the Character (2-3 Sentences)"),
                goals: z.string().describe("Goals of the Character (2-3 Sentences)"),
            })
        );

        const characterInfo = {
            name: input.name,
            race: input.race,
            class: input.cClass,
            subclass: input.subclass,
            alignment: input.alignment,
            age: input.age,
            build: input.build,
            eyes: input.eyes,
            hair: input.hair,
            height: input.height,
            backstory: input.backstory,
            quirks: input.quirks,
            fashion: input.fashion,
            goals: input.goals
        };

        const worldInfo = {worldInfo: input.worldInfo};
        
        const promptTemplate = 
        `You are an expert Dungeon Master for Dungeons and Dragons Fifth Edition.
        You come up with catchy and memorable ideas for a Dungeons and Dragons Campaign. 
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
        Eyes: {eyes}
        Hair: {hair}
        Height: {height}
        Backstory: {backstory}
        Quirks: {quirks}
        Fashion: {fashion}
        Goals: {goals}

        {formatInstructions}`

        const chain = RunnableSequence.from([
            PromptTemplate.fromTemplate(promptTemplate),
            new OpenAI({temperature: 0.9, maxTokens: 1000}),
            parser
        ]);

        console.log(JSON.stringify(characterInfo))
    
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
            eyes: characterInfo.eyes,
            hair: characterInfo.hair,
            height: characterInfo.height,
            backstory: characterInfo.backstory,
            quirks: characterInfo.quirks,
            fashion: characterInfo.fashion,
            goals: characterInfo.goals,                   
        });

        return response

    }),
    saveCharacter: privateProcedure.input(z.object({name: z.string(),
        race: z.string(),
        cClass: z.string(),
        subclass: z.string(),
        alignment: z.string(),
        age: z.string(),
        build: z.string(),
        eyes: z.string(),
        hair: z.string(),
        height: z.string(),
        backstory: z.string(),
        quirks: z.string(),
        fashion: z.string(),
        goals: z.string(),
        worldID: z.string()
    })).mutation(async ({ctx, input}) => {
            const {userId} = ctx;
            
            const character = await db.character.create({
                data: {
                    name: input.name,
                    race: input.race,
                    class: input.cClass,
                    subclass: input.subclass,
                    alignment: input.alignment,
                    age: input.age,
                    build: input.build,
                    eyes: input.eyes,
                    hair: input.hair,
                    height: input.height,
                    backstory: input.backstory,
                    quirks: input.quirks,
                    fashion: input.fashion,
                    goals: input.goals,
                    worldID : input.worldID,
                    userId,
                }
            });

            return character;

        })


});

export type AppRouter = typeof appRouter;