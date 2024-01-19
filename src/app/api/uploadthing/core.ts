import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/dist/types/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "16MB" } })
        .middleware(async ({ req }) => {
            const { getUser } = getKindeServerSession();
            const user = await getUser();

            if (!user || !user.id) {
                throw new Error("Unauthorized");
            }

            return { UserId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;