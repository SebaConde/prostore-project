"use server";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    totalPrice = round2(itemsPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    //Buscar cookie del Carrito
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("No se encontro el cart session id");

    //Obtener Session y Usuario ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //Get Cart.
    const cart = await getMyCart();

    //Valida el item agregado con el Schema.
    const item = cartItemSchema.parse(data);

    //Buscr producto en la DB.
    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    });
    if (!product) throw new Error("No se encontró el producto.");

    if (!cart) {
      //si no hay carro hay que crear uno.
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      //Agregar a la BD
      await prisma.cart.create({
        data: newCart,
      });
      //Revalidar la product page | Muchas veces se hace para limpiar el cache.
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    }else{
      //Comprobar si el item ya esta en el carrito.
      const existItem = (cart.items as CartItem[]).find((x)=> x.productId === item.productId);
      if (existItem) {
        //Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error (`No hay stock de ${existItem.name}`);
        }
        //Aumentar la cantidad.
        (cart.items as CartItem[]).find((x)=> x.productId === item.productId)!.qty = existItem.qty +1;
      }else{
        //si el item no esta en el carrito.
        //Checkear stock.
        if (product.stock <1) throw new Error(`No hay stock de ${product.name}`);
        //Agregar el item a carrito.item
        cart.items.push(item);
      }

      //Guardar en la DB
      await prisma.cart.update({
        where: {id: cart.id},
        data:{
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[])
        }
      });
      revalidatePath(`/product/${product.slug}`);
      return{
        success: true,
        message: `${product.name} ${existItem ? "actualizado": "agregado al carrito"}`
      };  
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  //Buscar cookie del Carrito
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("No se encontro el cart session id");

  //Obtener Session y Usuario ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //Obtener el carrito desde la BD | Si esta logueado busca por el ID del usuario, sino usa el ID de la session cookie.
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  //Convertir decimales y return.
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
  });
}

export async function removeItemFromCart(productId:string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("No se encontro el cart session id");

    //obtener product, mediante el productId que le estoy pasando por parametro
    const product = await prisma.product.findFirst({
      where: {id: productId}
    });
    if(!product) throw new Error('No se encontro el producto');

    //obtener carrito del usuario
    const cart = await getMyCart();
    if(!cart) throw new Error('No se encontro el carrito');

    //Comprobar si el carrito tiene el item que deseo borrar.
    const exist = (cart.items as CartItem[]).find((x)=> x.productId === productId);
    if(!exist) throw new Error('El carrito no tiene el producto');

    //Comprobar si tiene uno solo o varios.
    if (exist.qty ===1) {
      //Remover del carrito
      cart.items = (cart.items as CartItem[]).filter((x)=> x.productId !== exist.productId);
    } else{
      //Reducir cantidad
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }
    //Update db
    await prisma.cart.update({
      where: {id: cart.id},
      data:{
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      }
    });
    //actualziar pagina
    revalidatePath(`/product/${product.slug}`);
    return{
      succes: true,
      message: `${product.name} fue removido del carrito`,
    }


  } catch (error) {
    return{
      succes: false,
      message: formatError(error)
    }
  }
}
