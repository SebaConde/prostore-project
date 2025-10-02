import { z } from "zod";
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
