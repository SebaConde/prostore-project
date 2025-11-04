'use server'

import { shippingAddressSchema, signInFormSchema, signUpFormSchema, paymentMethodSchema } from "../validators";
import { signIn,signOut, auth } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import z from "zod";

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
    return {success:false, message: formatError(error)}; 
    
        
    }
}

//Buscar usuario por el id 
export async function getUserById(userId:string) {
    const user = await prisma.user.findFirst({
        where: {id: userId } 
    });
    if(!user) throw new Error('No se encontro al usuario')
    return user;
}

//Actualizar la direccion del usuario
export async function updateUserAddress(data: ShippingAddress){
try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
        where: {id: session?.user?.id}
    }) 
    if (!currentUser)throw new Error('No se encontro el usuario');
    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
        where: {id: currentUser.id},
        data: {address}
    })
    return{
        success: true,
        message: 'Direccion actualizada correctamente.'
    }

} catch (error) {
    return {success: false, message: formatError(error)}
}
}

//Actualizar medio de pago del usuario.
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where: {id: session?.user?.id}
        });

        if (!currentUser) throw new Error('No se encontro el usuario');
        
        const paymentMethod=paymentMethodSchema.parse(data);
        await prisma.user.update({
            where: {id: currentUser?.id},
            data: {paymentMethod: paymentMethod.type}
        })
        return {success: true, message: 'Metodo de pago actualizado correctamente'};
    } catch (error) {
        return{success: false, message: formatError(error)}
    }
}