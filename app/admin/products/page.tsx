import { requiereAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import DeleteDialog from "@/components/shared/delete-dialog";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";


const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  requiereAdmin();
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    page: page,
    category: category
  });


  return <div className="space-y-2">
    <div className="flex-between">
    <div className='flex items-center gap-3'>
          <h1 className='h2-bold'>Products</h1>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>{' '}
              <Link href='/admin/products'>
                <Button variant='outline' size='sm'>
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
    <Button asChild variant='default'>
        <Link href='/admin/products/create'>Crear producto</Link>
    </Button>
    </div>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Raiting</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {products.data.map((product)=>(
                <TableRow key={product.id}>
                    <TableCell>{formatId(product.id)}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.rating}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button asChild variant='outline' size='sm'>
                            <Link href={`/admin/products/${product.id}`}>Editar</Link>
                        </Button>
                        <DeleteDialog id={product.id} action={deleteProduct} />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
    {products.totalPages >1 && (
        <Pagination page={page} totalPages={products.totalPages} />
    )}
  </div>;
};

export default AdminProductsPage;
