"use client"

import { useEffect } from "react";

export function CartCookieProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verificar y crear la cookie de carrito si no existe
    if (!document.cookie.includes('sessionCartId')) {
      const sessionCartId = crypto.randomUUID();
      document.cookie = `sessionCartId=${sessionCartId}; path=/; max-age=${60*60*24*30}`;
    }
  }, []);

  return <>{children}</>;
}