import { mime, z } from "zod";
import { formatPrice } from "./utils";

const currency = z.string().refine((value) => /^\d+(\.\d{2})?$/.test(formatPrice(Number(value))),
    "Precio debe tener dos lugares despues de la ,"
  );

//Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
  category: z.string().min(3, "El category debe tener al menos 3 caracteres"),
  brand: z.string().min(3, "El brand debe tener al menos 3 caracteres"),
  description: z.string().min(3, "El description debe tener al menos 3 caracteres"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(3, "Tiene que tener al menos una imagen."),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

//Schema para hacer signIn
export const signInFormSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

//Schema para hacer sign Up
export const signUpFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La confrimacion de contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, { //El método .refine en Zod se utiliza para agregar una validación personalizada a un esquema.
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

//Cart Schemas
//Item del carrito.
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  name: z.string().min(1,"El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  qty: z.number().int().nonnegative("La cantidad debe ser mayor a 1"),
  image: z.string().min(1,"Se requiere imagen"),
  price: currency
});

//Schema del carrito.
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  sessionCartId: z.string().min(1,"Se requiere el Session Cart id"),
  userId: z.string().optional().nullable(),
});

//Schema para la direccion.
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener mas de 3 caracteres'),
  streetAddress: z.string().min(3, 'La direccion debe tener mas de 3 caracteres'),
  city: z.string().min(3, 'La ciudad debe tener mas de 3 caracteres'),
  postalCode: z.string().min(3, 'Codigo postal debe tener mas de 3 caracteres'),
  country: z.string().min(3, 'El pais debe tener mas de 3 caracteres'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  
})