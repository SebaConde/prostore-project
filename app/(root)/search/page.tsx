import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";

const prices = [
  {
    name: "$1 a $30",
    value: "1-50",
  },
  {
    name: "$31 a $50",
    value: "31-50",
  },
  {
    name: "$51 a $80",
    value: "51-80",
  },
  {
    name: "$81 a $120",
    value: "81-120",
  },
  {
    name: "$121 a $1500",
    value: "121-1500",
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ["newest", "lowest", "highest", "rating"];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
  Search ${isQuerySet ? q : ""} 
  ${isCategorySet ? `: Category ${category}` : ""}
  ${isPriceSet ? `: Price ${price}` : ""}
  ${isRatingSet ? `: Rating ${rating}` : ""}`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  //Constructor filter url

  const getFilterUrl = ({
    cat,
    srt,
    pri,
    rat,
    pag,
  }: {
    cat?: string;
    srt?: string;
    pri?: string;
    rat?: string;
    pag?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };
    if (cat) params.category = cat;
    if (srt) params.sort = srt;
    if (pri) params.price = pri;
    if (rat) params.rating = rat;
    if (pag) params.page = pag;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md: gap-5">
      <div className="filter-links">
        {/* Category links */}
        <div className="text-xl mb-2 mt-8">Departament</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${(category === "all" || category === "") && "font-bold"}`}
                href={getFilterUrl({ cat: "all" })}
              >
                Todas
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.category}>
                <Link
                  className={`${category === cat.category && "font-bold"}`}
                  href={getFilterUrl({ cat: cat.category })}
                >
                  {cat.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Price links */}
        <div className="text-xl mb-2 mt-8">Price</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${price === "all" && "font-bold"}`}
                href={getFilterUrl({ pri: "all" })}
              >
                Sin rango de precio
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value && "font-bold"}`}
                  href={getFilterUrl({ pri: p.value })}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Raings links */}
        <div className="text-xl mb-2 mt-8">Ratings</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${rating === "all" && "font-bold"}`}
                href={getFilterUrl({ rat: "all" })}
              >
                Sin rango de calificaciones
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && "font-bold"}`}
                  href={getFilterUrl({ rat: `${r}` })}
                >
                  {`Mas de ${r} estrellas`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4 ">
          <div className="flex items-center">
            {q !== "all" && q !== "" && "Busqueda: " + q}
            {category !== "all" && category !== "" && "Categoria: " + category}
            {price !== "all" && " Price: " + price}
            {rating !== "all" && " Rating: " + rating + " estrellas o mas"}
            &nbsp;
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            rating !== "all" ||
            price !== "all" ? (
              <Button variant="link" asChild>
                <Link href="/search">Limpiar filtros</Link>
              </Button>
            ) : null}
          </div>
          <div>
            Sort by{" "}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort == s && "font-bold"}`}
                href={getFilterUrl({ srt: s })}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && <div> No hay productos </div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
