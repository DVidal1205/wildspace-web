import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "16MB" } })
        .middleware(async () => {
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
