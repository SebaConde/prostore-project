'use server'
import { CartItem } from "@/types"
import { cookies } from "next/headers"
import { convertToPlainObject, formatError } from "../utils"
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

export async function addItemToCart(data:CartItem) {
   //Buscar cookie del Carrito
   const sessionCartId = (await cookies()).get('sessionCartId')?.value;
   if (!sessionCartId) throw new Error('No se encontro el cart session id');

   //Obtener Session y Usuario ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    //Get Cart.
    const cart = getMyCart();

    //Valida el item agregado con el Schema.
    const item = cartItemSchema.parse(data);

    //Buscr producto en la DB.
    const product = await prisma.product.findFirst({
        where:{
            id: item.productId
        }
    })
   //TEST
   console.log({
    'Session Cart id:' : sessionCartId,
    'User ID:' :userId,
    'Item requested:' : item,
    'Product found:' : product,

   });
   
   
    try {
        return{
        success:true,
        message: 'item added to cart'
    }
    } catch (error) {
        return{
            success:false,
            message: formatError(error)

        }
    }
      
} 

export async function getMyCart(){
    //Buscar cookie del Carrito
   const sessionCartId = (await cookies()).get('sessionCartId')?.value;
   if (!sessionCartId) throw new Error('No se encontro el cart session id');

   //Obtener Session y Usuario ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined

  

    //Obtener el carrito desde la BD | Si esta logueado busca por el ID del usuario, sino usa el ID de la session cookie.
    const cart = await prisma.cart.findFirst({
        where: userId ? {userId:userId} : {sessionCartId: sessionCartId}
    })
    if (!cart) return undefined;

    //Convertir decimales y return.
    return convertToPlainObject({
        ...cart,
        items:cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString()
    })
}