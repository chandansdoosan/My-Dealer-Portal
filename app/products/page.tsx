import ProductsClient from "./ProductsClient";
import { getAllProducts } from "../actions/salesforce";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getAllProducts();

  const categoriesSet = new Set<string>();
  categoriesSet.add("All Categories");

  products.forEach(p => {
    if (p.Family && p.Family.trim() !== '') {
      categoriesSet.add(p.Family);
    }
  });

  const categories = Array.from(categoriesSet);

  return <ProductsClient initialProducts={products} categories={categories} />;
}
