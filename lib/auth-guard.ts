import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requiereAdmin(){
    const session = await auth();

    if(session?.user?.role!== 'admin'){
        redirect('/unauthorized');
    }
    return session;
}