'use server'

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { truncateByDomain } from "recharts/types/util/ChartUtils";

//Crear y actualizar reviews
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>){
    try {
        const session = await auth();
        if(!session) throw new Error('Usuario no autenticado');

        //Validar y guardar la review en una variable
        const review = insertReviewSchema.parse({
            ...data,
        userId: session?.user?.id,
        });

        //Obtener producto que esta siendo rese;ado
        const product = await prisma.product.findFirst({
            where:{id:review.productId}
        });
        if(!product) throw new Error('No se encontro el producto');

        //Checkear si el producto ya tiene una review.
        const reviewExist = await prisma.review.findFirst({
            where: {productId: review.productId, userId: review.userId}
        });

        await prisma.$transaction(async(tx)=>{
            if(reviewExist){
                //Update
                await tx.review.update({
                    where:{id:reviewExist.id},
                    data:{title: review.title,
                        description: review.description,
                        rating: review.rating
                    }
                });
            }else{
                //Crear una nueva
                await tx.review.create({data:review})
            };
            //get avg rating
            const averageRating = await tx.review.aggregate({
                _avg: {rating: true},
                where:{ productId: review.productId}
            })
            
            //Get number reviews
            const numReviews = await tx.review.count({
                where:{productId: review.productId}
            });

            //Update rating and numReviews on product table.
            await tx.product.update({
                where:{id:review.productId},
                data:{rating: averageRating._avg.rating || 0,
                    numReviews
                }
            })
        });

        revalidatePath(`/product/${product.slug}`);

        return {
            success:true,
            message: 'Review actualizada.'
        }

    } catch (error) {
        return{success:false, message: formatError(error)}
    }
}