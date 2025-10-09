'use server'

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn,signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import {prisma} from "@/db/prisma";
import { success } from "zod";

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

//Sign up
export async function signUpUser(prevState: unknown, formData: FormData){
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });
        const plainPassword = user.password; //para guardar el password sin pasarlo por hash

        user.password = hashSync(user.password,10);
        await prisma.user.create({
            data:{
                name: user.name,
                email: user.email,
                password: user.password
            }
        });

        await signIn('credentials',{
            email: user.email,
            password: plainPassword,
        });
        return {success:true, message: 'Usuario registrado correctamente.'}
    } catch (error) {
        if(isRedirectError(error)){
        throw error;
    }
    return {success:false, message: 'El usuario no fue registrado.'};
    
        
    }
}