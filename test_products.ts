import { getAllProducts } from './app/actions/salesforce';
async function test() {
  const products = await getAllProducts();
  console.log('Products count:', products.length);
  if (products.length > 0) {
    console.log('First product:', products[0]);
  } else {
    console.log('No products returned.');
  }
}
test();
