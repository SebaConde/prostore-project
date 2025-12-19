'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

//Create order and order items.
export async function createOrder(){
    try {
    const session = await auth();
    if(!session) throw new Error('usuario no atuenticado');    

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if(!userId) throw new Error('no se encontro usuario');

    const user = await getUserById(userId);

    if(!cart || cart.items.length === 0){
        return{success: false, message: 'Your cart is empty', redirectTo:'/cart'}
    }
    if(!user.address){
        return{success: false, message: 'no address', redirectTo:'/shipping-address'}
    }
    if(!user.paymentMethod){
        return{success: false, message: 'theres no payment method', redirectTo:'/payment-method'}
    }

    //Create order object
    const order = insertOrderSchema.parse({
        userId: user.id,
        shippingAddres: user.address,
        paymentMethod: user.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
    })

    //Create transaction to create order y order items in the db
    const insertedOrderId= await prisma.$transaction(async(tx)=>{
       const insertedOrder = await tx.order.create({data:order});
       //create order items  from the cart items
       for(const item of cart.items as CartItem[]){
        await tx.orderItem.create({
            data:{
                ...item,
                price: item.price,
                orderId: insertedOrder.id
            },
        });
       }
       //Clear cart
       await tx.cart.update({
        where: {id: cart.id},
        data:{
            items:[],
            totalPrice:0,
            shippingPrice:0,
            itemsPrice:0
        },
       });
       return insertedOrder.id;
    });

    if(!insertedOrderId) throw new Error('No se creo la orden');
    return {success: true, message: 'Orden creada', redirectTo:`/order/${insertedOrderId}`}

    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.log('Error completo:', error);
        return {success: false, message: formatError(error)}
    }
}

//Get order by id
export async function getOrderById(orderId: string){
    const data = await prisma.order.findFirst({
        where:{
            id:orderId
        },
        include:{
            orderitems: true,
            user:{select: {name: true, email: true}}
        },
    });
    return convertToPlainObject(data);
}