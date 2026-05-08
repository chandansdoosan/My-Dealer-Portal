const { getAllProducts } = require('./app/actions/salesforce');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  const products = await getAllProducts();
  console.log("Products count:", products.length);
  if (products.length > 0) {
    console.log("First 3 products:", products.slice(0, 3));
  }
}
test();
