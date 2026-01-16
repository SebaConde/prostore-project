import { z } from "zod";
import { formatPrice } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatPrice(Number(value))),
    "Precio debe tener dos lugares despues de la ,"
  );

//Schema para agregar productos
export const insertProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
  category: z.string().min(3, "El category debe tener al menos 3 caracteres"),
  brand: z.string().min(3, "El brand debe tener al menos 3 caracteres"),
  description: z.string().min(3, "El description debe tener al menos 3 caracteres"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Tiene que tener al menos una imagen."),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

//Schema para actualizar productos
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'Se requiere el id'),
});

//Schema para hacer signIn
export const signInFormSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

//Schema para hacer sign Up
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Email invalido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La confrimacion de contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    //El método .refine en Zod se utiliza para agregar una validación personalizada a un esquema.
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

//Cart Schemas
//Item del carrito.
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  qty: z.number().int().nonnegative("La cantidad debe ser mayor a 1"),
  image: z.string().min(1, "Se requiere imagen"),
  price: currency,
});

//Schema del carrito.
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  sessionCartId: z.string().min(1, "Se requiere el Session Cart id"),
  userId: z.string().optional().nullable(),
});

//Schema para la direccion.
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener mas de 3 caracteres"),
  streetAddress: z
    .string()
    .min(3, "La direccion debe tener mas de 3 caracteres"),
  city: z.string().min(3, "La ciudad debe tener mas de 3 caracteres"),
  postalCode: z.string().min(3, "Codigo postal debe tener mas de 3 caracteres"),
  country: z.string().min(3, "El pais debe tener mas de 3 caracteres"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

//Schema para el metodo de pago.
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Se requiere un metodo de pago"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Metodo de pago invalido",
  });

//Schema para Order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddres: shippingAddressSchema,
});

//Schema para OrderItem
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

//Schema para el PaymentResult
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

//Schema para actualizar el perfil del usuario
export const updateProfileSchema = z.object({
  name: z.string().min(3, "El nombre debe tener minimo 3 caracteres"),
  email: z.email().min(3, "El email debe tener minimo 3 caracteres"),
});

//Schema para actualizar el usuario.
export const updateUserSchema = updateProfileSchema.extend({
    id: z.string().min(1, "El ID debe tener minimo un caracter"),
    role: z.string().min(1, "El role debe tener minimo un caracter"),
})