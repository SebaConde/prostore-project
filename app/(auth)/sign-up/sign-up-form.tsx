'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react"; //con react 18 es useFormState
import { useFormStatus } from "react-dom";
import { signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";


const SignUpForm = () => {

    const [data, action] = useActionState(signUpUser,{
        success: false,
        message: ''
    });

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const SignUpButton = () =>{
        const {pending} = useFormStatus();
        return (
        <Button disabled={pending} className="w-full" variant='default'>
            {pending ? 'submitting' : 'Sign up'}
        </Button>)
    }

    return <form action={action}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
            <div className="">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" required autoComplete="name" defaultValue={signUpDefaultValues.email}/>
            </div>
            <div className="">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={signUpDefaultValues.email}/>
            </div>
            <div className="">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required autoComplete="password" defaultValue={signUpDefaultValues.password}/>
            </div>
             <div className="">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="confirmPassword" defaultValue={signUpDefaultValues.password}/>
            </div>
            <div>
                <SignUpButton />
            </div>

            {data && !data.success &&(
                <div className="text-center text-destructive"> 
                    {data.message}
                </div>
            )}

            <div className="text-sm text-center text-mute-foreground">
                Ya tienes una cuenta? {''}
                <Link href='/sign-in' target="_self" className="link">Sign in</Link>
            </div>
        </div>
    </form>
}
 
export default SignUpForm;