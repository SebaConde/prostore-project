export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //cualquier pagina que pongamos en este grupo se va a renderizar con este diseño.
   <div className="flex-center min-h-screen w-full"> 
    {children}
   </div>
  );
}