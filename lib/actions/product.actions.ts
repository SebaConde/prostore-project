'use server';

import { prisma } from "@/db/prisma"; 
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";

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

//Obtener todos los productos.
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category
}:{
    query: string,
    limit?: number,
    page: number,
    category?: string
}){
    const data = await prisma.product.findMany({
        skip:(page-1) * limit,
        take:limit
    });
    const dataCount = await prisma.product.count();

    return{
        data,
        totalPages: Math.ceil(dataCount / limit),
    }
}

//Borrar productos.
export async function deleteProduct(id:string) {
    try {
        const productExist = await prisma.product.findFirst({
            where:{id}
        });
        if (!productExist) {
            throw new Error('no se encuentra el producto');
        }
        await prisma.product.delete({
            where:{id}
        });
        revalidatePath('/admin/products');
        return{
            success:true, message: 'Producto removido con exito.'
        };
    } catch (error) {
        return{success:false, message: formatError(error)}
    }
}