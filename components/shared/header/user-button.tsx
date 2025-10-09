import Link from "next/link";
import { auth } from "@/auth"; //para saber si esta logeado o no
import { signOutUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";


const UserButton = async () => {
    const session = await auth(); //si esta logeado o no
    if(!session){
        return(
        <Button asChild >
            <Link href='/sign-in'>
                <UserIcon /> Sign in
            </Link>
        </Button>);
    }
    const fistInicial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';

    return (
    <div className="flex gap-2 items-center">
        <DropdownMenu>
            <DropdownMenuTrigger >   {/* asChild para que el trigger sea el boton */}
                <div className="flex items-center">
                    <Button variant='ghost' className="relative w-8 h-8 rounded-full ml-2 items-center justify-center bg-gray-200">
                        {fistInicial}
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium leading-none">
                            {session.user?.name}
                        </div>
                        <div className="text-sm text-muted-foreground leading-none">
                            {session.user?.email}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuItem className="p-0 mb-1">
                    <form action={signOutUser} className="w-full">
                        <Button className="w-full py-4 px-2 h-4 justify-stretch" variant='ghost'>Sign out</Button>    
                    </form> 
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>);
};
 
export default UserButton;