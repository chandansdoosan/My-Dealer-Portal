import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "../../../actions/salesforce";
import OrderForm from "../../../products/[id]/OrderForm";

export const dynamic = 'force-dynamic';

export default async function OrderPlacementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href={`/products/${productId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#e63329] font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Product Details
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Order</h1>
          <p className="text-gray-500 mt-1">Requesting order for: <span className="font-semibold text-gray-900">{product.Name}</span></p>
        </div>
        
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm border border-gray-100">
              <img src="/images/products/generic.png" alt={product.Name} className="max-h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{product.Name}</h3>
              <p className="text-gray-500 text-sm">Code: {product.ProductCode || 'N/A'}</p>
              <p className="text-[#e63329] font-bold mt-1">
                {product.Price ? `$${product.Price.toLocaleString('en-US')}` : "Contact for Pricing"}
              </p>
            </div>
          </div>

          <OrderForm productId={product.Id} productName={product.Name} />
        </div>
      </div>
    </div>
  );
}
