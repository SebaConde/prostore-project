import { CreditCard, DollarSign, Headset, ShoppingBag, WalletCards } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const IconBoxes = () => {
  return (
    <div>
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-4 p-4">
          <div className="space-y-2">
            <ShoppingBag />
            <div className="text-sm font-bold">Free shipping</div>
            <div className="text-sm text-muted-foreground">
              Free shipping on orders above 200 dolares.
            </div>
          </div>
          <div className="space-y-2">
            <DollarSign />
            <div className="text-sm font-bold">Money Back Guarantee</div>
            <div className="text-sm text-muted-foreground">
              within 30 days of purchase
            </div>
          </div>
          <div className="space-y-2">
            <Headset />
            <div className="text-sm font-bold">24/7 support</div>
            <div className="text-sm text-muted-foreground">
              Get support at any time.
            </div>
          </div>
          <div className="space-y-2">
            <CreditCard />
            <div className="text-sm font-bold">Pago flexible</div>
            <div className="text-sm text-muted-foreground">
             Paga conb cualquier cosa
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconBoxes;
