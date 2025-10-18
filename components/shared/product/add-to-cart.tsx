"use client";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { addItemToCart } from "@/lib/actions/cart.actions";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  
  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    
    if (!res?.success) {
      toast.error('Error al agregar al carrito');
    } else {
      toast.success(`${item.name} agregado al carrito`, {
        action: {
          label: 'Ver carrito',
          onClick: () => router.push('/cart')
        }
      });
    }
  };

  return (
    <>
      <Toaster richColors/>
      <Button className="w-full" type="button" onClick={handleAddToCart}>
       <Plus /> add to cart
      </Button>
    </>
  );
};

export default AddToCart;