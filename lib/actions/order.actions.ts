"use server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceipt } from "@/email";

//Create order and order items.
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("usuario no atuenticado");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("no se encontro usuario");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "no address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "theres no payment method",
        redirectTo: "/payment-method",
      };
    }

    //Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddres: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      totalPrice: cart.totalPrice,
    });

    //Create transaction to create order y order items in the db
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });
      //create order items  from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      //Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("No se creo la orden");
    return {
      success: true,
      message: "Orden creada",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.log("Error completo:", error);
    return { success: false, message: formatError(error) };
  }
}

//Get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return convertToPlainObject(data);
}

//Crear nueva orden de paypal
export async function createPaypalOrder(orderId: string) {
  try {
    //get order from db
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (order) {
      //Crear nueva orden de paypal
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      //Actualizar orden con el id de la paypal order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });
      return {
        success: true,
        message: "Item order created",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("no se encontro la orden");
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Aprobar order de paypal y actualizar order para pagar
export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error("No se encontro la orden");
    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error en el pago de Paypal");
    }
    //Actualizar la orden a pagada.
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Tu orden ha sido pagada",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Actulizar orden, paid true y paid at
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
    },
  });
  if (!order) throw new Error("Error en el pago de paypal");
  if (order.isPaid) throw new Error("La orden ya esta pagada");

  //transaction para actualizar la orden y la cuenta del stock de productos.
  await prisma.$transaction(async (tx) => {
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    //Marcar la orden como pagada
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  //Actualizar la orden despues de la transaccion
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });
  if (!updatedOrder) throw new Error("No se encontro la orden");

  sendPurchaseReceipt({
    order:{
      ...updatedOrder,
      shippingAddres: updatedOrder.shippingAddres as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    }
  })
}

//Obtener las ordenes de usuarios
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("Usuario no autorizado");

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type salesDataType = {
  month: string;
  totalSales: number;
}[];

//Obtener data de las ordenes y resumen de ordenes.
export async function getOrderSummary() {
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  //obtener ventas totales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  //obtener ventas mensuales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: salesDataType = salesDataRaw.map((sale) => ({
    month: sale.month,
    totalSales: Number(sale.totalSales),
  }));

  //Obtener ultimas ventas
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 6,
  });

  return {
    ordersCount, productsCount, usersCount, totalSales, latestSales, salesData
  };
}

//Obtener todas las ordenes.
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query
}:{
  limit?: number;
   page: number;
   query: string;
}){
  const queryFilter: Prisma.OrderWhereInput = query && query!== 'all' ? {
    user:{
      name:{
        contains:query,
        mode: 'insensitive'
      } as Prisma.StringFilter
    }
  } : {};

const data = await prisma.order.findMany({
  where:{
    ...queryFilter,
  },
  orderBy: {createdAt: 'desc'},
  take: limit,
  skip:(page-1) * limit,
  include: {user:{select:{name: true}}}
});

const dataCount = await prisma.order.count();
return{
  data,
  totalPages : Math.ceil(dataCount / limit)
}

}

//Borrar una orden.
export async function deleteOrder(id:string){
  try {
    await prisma.order.delete({
      where:{id}
    });
    revalidatePath('/admin/orders');
    return{
      success:true,
      message: 'Orden eliminada correctamente'
    }
  } catch (error) {
    return {success:false, message: formatError(error)}
  }
}

//Actualizar orden COD a paga.
export async function updateOrderToPaidCOD(orderId:string){
  try {
    await updateOrderToPaid({orderId});
    revalidatePath(`/orders/${orderId}`);

    return {success:true, message:'Orden marcada como paga.'}
  } catch (error) {
    return{success:false, message: formatError(error)}
  }
}

//Actualizar COD a entregado.
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where:{
        id:orderId,
      },
    });
    if(!order) throw new Error('no se pudo encontrar la orden');
    if(!order.isPaid) throw new Error('la orden no fue pagada.');

    await prisma.order.update({
      where :{
        id:orderId},
        data:{
          isDelivered:true,
          deliveredAt: new Date(),
        },
    });
    revalidatePath(`/order/${orderId}`);

    return{
      success:true,
      message: 'orden marcada como entregada.'
    }
  } catch (error) {
    return{success:false, message: formatError(error)}
  }
}