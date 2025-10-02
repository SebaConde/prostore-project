'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react"; //con react 18 es useFormState
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user.actions";


const CredentialsSignInForm = () => {

    const [data, action] = useActionState(signInWithCredentials,{
        success: false,
        message: ''
    });

    const SignInButton = () =>{
        const {pending} = useFormStatus();
        return (
        <Button disabled={pending} className="w-full" variant='default'>
            {pending ? 'Signing in...' : 'Sign in'}
        </Button>)
    }

    return <form action={action}>
        <div className="space-y-6">
            <div className="">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={signInDefaultValues.email}/>
            </div>
            <div className="">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required autoComplete="password" defaultValue={signInDefaultValues.password}/>
            </div>
            <div>
                <SignInButton />
            </div>

            {data && !data.success &&(
                <div className="text-center text-destructive"> 
                    {data.message}
                </div>
            )}

            <div className="text-sm text-center text-mute-foreground">
                No tiene cuenta? {''}
                <Link href='/sign-up' target="_self" className="link">Sign up</Link>
            </div>
        </div>
    </form>
}
 
export default CredentialsSignInForm;