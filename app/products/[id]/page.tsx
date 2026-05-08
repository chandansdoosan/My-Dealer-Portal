import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "../../actions/salesforce";
import { getProductImage } from "@/lib/productImage";
import OrderForm from "./OrderForm";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Link */}
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#e63329] font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Image Gallery */}
        <div className="w-full lg:w-3/5">
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={getProductImage(product)} 
              alt={product.Name} 
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </div>
          {/* Thumbnails (Simulated) */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`bg-gray-100 rounded-lg overflow-hidden border-2 cursor-pointer ${i === 1 ? 'border-[#e63329]' : 'border-transparent hover:border-gray-300'} p-2 aspect-square flex items-center justify-center`}>
                <img src={getProductImage(product)} alt={`Thumbnail ${i}`} className="max-h-full object-contain" />
              </div>
            ))}
          </div>
          
          <div className="mt-12 prose prose-lg max-w-none text-gray-700">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Product Description</h3>
            <p className="mt-4 leading-relaxed">{product.Description || "No detailed description is available for this product. Please contact support for more information."}</p>
          </div>
        </div>

        {/* Right Column - Details and Order Form */}
        <div className="w-full lg:w-2/5">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.Name}</h1>
          <p className="text-gray-500 text-lg mb-6">Item Code: {product.ProductCode || 'N/A'} {product.Family ? `| Category: ${product.Family}` : ''}</p>
          
          {/* Specs List */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <span className="font-bold text-gray-900">{product.Price ? `$${product.Price.toLocaleString('en-US')}` : "Contact for Pricing"}</span>
                <span className="text-gray-500 text-sm block">Unit Price</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-8 rounded-xl border border-gray-100">
            <h3 className="font-bold text-xl text-gray-900 mb-4">Interested in this machine?</h3>
            <p className="text-gray-600 mb-6">Submit an order request and our sales team will contact you with a formal quote and delivery timeline.</p>
            
            <Link 
              href={`/details/order/${product.Id}`}
              className="w-full inline-block text-center bg-[#e63329] text-white py-4 rounded-md font-bold text-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              Order place
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Secure Request
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                24h Response
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
