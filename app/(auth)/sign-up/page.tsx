import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
    title: 'Sign up',
};

const SignUpPage = async (props: {
    searchParams: Promise<{
        callbackUrl: string;

    }>
}) => {
    const {callbackUrl} = await props.searchParams;

    const session = await auth();

    if(session){
      return redirect( callbackUrl || '/');
    }    

    return ( 
        <div>
            <Card>
                <CardContent className='space-y-4'>
                    <Link href='/' className='flex-center'>
                        <Image src='/images/logo.svg' alt={`${APP_NAME} logo`} width={100} height={100} priority={true}/>
                    </Link>
                    <CardTitle className="text-center">Create account</CardTitle>
                    <CardDescription className="text-center">Enter your info below to sign up</CardDescription>
                    <CardContent className="space-y-4">
                        <SignUpForm />
                    </CardContent>
                </CardContent>
            </Card>
        </div>

     );
}
 
export default SignUpPage;