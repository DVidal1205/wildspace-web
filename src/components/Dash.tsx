"use client";

import { trpc } from "@/app/_trpc/client";
import { format } from "date-fns";
import { Ghost, Loader2, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import EditButton from "./EditButton";
import UploadButton from "./UploadButton";
import { Button } from "./ui/button";

const Dash = () => {
    const [currentlyDeletingWorld, setCurrentlyDeletingWorld] = useState<
        string | null
    >(null);

    const utils = trpc.useContext();

    const { data: worlds, isLoading } = trpc.getUserWorlds.useQuery();

    const { mutate: deleteWorld } = trpc.deleteWorld.useMutation({
        onSuccess: () => {
            utils.getUserWorlds.invalidate();
        },
        onMutate: ({ id }) => {
            setCurrentlyDeletingWorld(id);
        },
        onSettled() {
            setCurrentlyDeletingWorld(null);
        },
    });

    return (
        <main className="mx-auto max-w-7xl md:p-10">
            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-input pb-5 sm:flex-row sm:items-center sm:gap-0">
                <h1 className="mb-3 font-bold text-5xl text-foreground">
                    My Worlds
                </h1>

                <UploadButton />
            </div>

            {worlds && worlds?.length !== 0 ? (
                <ul className="mt-8 grid grid-cols-1 gap-6 divide-input md:grid-cols-2 lg:grid-cols-3">
                    {worlds
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                        .map((world) => (
                            <li
                                key={world.id}
                                className="col-span-1 divide-y divide-input rounded-lg shadow transition hover:shadow-lg border border-input"
                            >
                                <Link
                                    href={`/dashboard/${world.id}`}
                                    className="flex flex-col gap-2"
                                >
                                    <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                                        <div className="flex-1 truncate">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="truncate text-lg font-medium text-foreground">
                                                    {world.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-foreground">
                                    <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        {format(
                                            new Date(world.createdAt),
                                            "MMM yyyy"
                                        )}
                                    </div>

                                    <EditButton id={`${world.id}`} />

                                    <Button
                                        onClick={() =>
                                            deleteWorld({ id: world.id })
                                        }
                                        size="sm"
                                        className="w-full"
                                        variant="destructive"
                                    >
                                        {currentlyDeletingWorld === world.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </li>
                        ))}
                </ul>
            ) : isLoading ? (
                <Skeleton height={100} className="my-2" count={3} />
            ) : (
                <div className="mt-16 flex flex-col items-center gap-2">
                    <Ghost className="h-8 w-8 text-foreground" />
                    <h3 className="font-semibold text-xl">
                        Pretty empty here...
                    </h3>
                    <p className="text-foreground">
                        Create a world to get started.
                    </p>
                </div>
            )}
        </main>
    );
};

export default Dash;
