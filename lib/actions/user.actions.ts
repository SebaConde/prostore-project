'use server'

import { signInFormSchema } from "../validators";
import { signIn,signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";


//Sign in con credenciales.
export async function signInWithCredentials(prevState:unknown, formData: FormData){
try {
    const user = signInFormSchema.parse({
        email : formData.get('email'),
        password: formData.get('password'),
    });
    await signIn('credentials', user);
    return {success:true, message: 'Inicio de sesión exitoso'};    
} catch (error) {
    if(isRedirectError(error)){
        throw error;
    }
    return {success:false, message: 'Correo o contraseña incorrectos'};
    
}
}

//Cerrar sesión. 
export async function signOutUser() {
    await signOut();
}