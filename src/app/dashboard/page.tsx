import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
    const { getUser} = getKindeServerSession();
    const user = await getUser();

    if(!user || !user.id) redirect("/auth-callback?origin=dashboard");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-6xl font-bold">Welcome {user?.email}</h1>
            <p className="mt-3 text-2xl">You are now logged in!</p>
        </div>
    );
};

export default Dashboard;
