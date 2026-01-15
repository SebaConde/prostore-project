import ProductForm from "@/components/admin/product-form";
import { requiereAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Crear producto'
}

const CreateProductsPage = () => {
    requiereAdmin();
    return ( 
        <>
        <h1 className="font-bold">Crear nuevo producto</h1>
        <div className="my-8">
            <ProductForm  type='Create'/>
        </div>
        </>
     );
}
 
export default CreateProductsPage;