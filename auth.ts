import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

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
  callbacks:{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({session, user, trigger, token}: any){
        //establecer el user id desde el token
        session.user.id = token.sub;

        //si hay una actualizacion, actualizar el session con la info mas reciente de la db
        if(trigger === "update"){
            session.user.name = user.name;
        }

        return session;

    },
  },

} satisfies NextAuthConfig ;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
