import { Metadata } from "next";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import PaymentMethodForm from "./payment-method-form";


export const metadata:Metadata = {
    title:'Metodo de pago',
};

const PaymentMethodPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error ('Usuario no encontrado');
    const user = await getUserById(userId);

    return ( <>Payment method
    <PaymentMethodForm preferredPaymentMethod={user.paymentMethod}/>
    </> );
}
 
export default PaymentMethodPage;