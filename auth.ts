import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, //30 dias
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (credentials == null) return null;
        //Buscar usuario
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        //Chequear si el usuario existe y si la contraseña es correcta

        if (user && user?.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          ); //Compara la contraseña con la contraseña hash de la db y se asegura de que coincidan.
          //si coinciden, devuelve el usuario
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        //Si el usuario no existe o la contraseña es incorrecta, devuelve null
        return null;
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, trigger, token }: any) {
      //establecer el user id desde el token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      //si hay una actualizacion, actualizar el session con la info mas reciente de la db
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      //Asignar los campos del usuario al token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        //si el usuario no tiene nombre usa la primera parte de mail antes del @
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          //Actulizar la DB para mostrar el nombre del token
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        } 
        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {sessionCartId},
            });
            if (sessionCart) {
              //Borra el carrito actual
              await prisma.cart.deleteMany({
                where: {userId: user.id}, //userId es del cart, user.id es del user que paso por parametro.
              });
              //Asigna el nuevo
              await prisma.cart.update({
                where: {id: sessionCart.id},
                data: {userId: user.id}
              })
            }
          }
        }
      }

      //Hanlde session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized({ request, auth }: any) {
  // Array con las rutas que queremos proteger.
  const protectedPaths = [
    /\/shipping-address/,
    /\/payment-method/,
    /\/place-order/,
    /\/profile/,
    /\/user\/(.*)/,
    /\/order\/(.*)/,
    /\/admin/,
  ];
  
  // Obtener el pathname del url
  const { pathname } = request.nextUrl;
  
  // Checkear si la ruta actual es una ruta protegida
  const isProtectedPath = protectedPaths.some((p) => p.test(pathname)); 
  
  // Si es una ruta protegida y NO está autenticado, denegar acceso
  if (isProtectedPath && !auth) {
    const loginUrl = new URL("/sign-in", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
  
  // Lógica del carrito (solo si está autenticado o no es ruta protegida)
  if (!request.cookies.get('sessionCartId')) {
    const sessionCartId = crypto.randomUUID();
    const newRequestHeaders = new Headers(request.headers);
    
    const response = NextResponse.next({
      request: {
        headers: newRequestHeaders,
      },
    });
    
    response.cookies.set('sessionCartId', sessionCartId);
    return response; // Retornar el response con la cookie
  }
  
  // Permitir acceso
  return true;
},
    
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);