import { getAllProducts } from './app/actions/salesforce';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
