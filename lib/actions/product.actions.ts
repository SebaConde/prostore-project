'use server';

import { prisma } from "@/db/prisma"; 
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";

//Get latest products.
//Devuelve un obj Primsa y hay que convertirlo en un obj JS.
export async function getLatestProducts() {

    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy:{createdAt:'desc'},
    });

    return convertToPlainObject(data);
}

//Obtener un producto por slug.
export async function getProductBySlug(slug: string){
    return await prisma.product.findFirst({
        where: {slug:slug}
    });
}