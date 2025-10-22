"use client";
import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res?.success) {
      toast.error(`${res.message}`);
    } else {
      toast.success(`${res.message}`, {
        action: {
          label: "Ver carrito",
          onClick: () => router.push("/cart"),
        },
      });
    }
  };
  
  const hanldeRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId);
    toast.warning(`${res.message}`, {
        action: {
          label: "Ver carrito",
          onClick: () => router.push("/cart"),
        },
      });
  }

  //Checker si el item esta en el carrito
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={hanldeRemoveFromCart}>
        <Minus className="h-4  w-4"/>
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <Plus className="h-4  w-4"/>
      </Button>
    </div>
  ) : (
    <div>
      <Toaster richColors />
      <Button className="w-full" type="button" onClick={handleAddToCart}>
        <Plus /> add to cart
      </Button>
    </div>
  );
};

export default AddToCart;
