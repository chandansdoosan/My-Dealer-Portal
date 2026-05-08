"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "../actions/salesforce";
import { getProductImage } from "@/lib/productImage";

interface ProductsClientProps {
  initialProducts: Product[];
  categories: string[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All Categories");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = product.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.ProductCode && product.ProductCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "All Categories" || (product.Family || "") === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Products</h1>
        <p className="text-gray-500 text-lg">Search and explore our equipment</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4">Category</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  checked={activeCategory === "All Categories"} 
                  onChange={() => setActiveCategory("All Categories")}
                  className="w-4 h-4 text-[#e63329] focus:ring-[#e63329]" 
                />
                <span className="text-gray-700">All Categories</span>
              </label>
              {categories.map(cat => cat !== "All Categories" && (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={activeCategory === cat} 
                    onChange={() => setActiveCategory(cat)}
                    className="w-4 h-4 text-[#e63329] focus:ring-[#e63329]" 
                  />
                  <span className="text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          

        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="flex gap-4">
              <select 
                className="border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e63329]"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="bg-[#e63329] text-white px-6 py-2.5 rounded-md font-medium hover:bg-red-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.Id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                  <div className="h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.Name} 
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{product.Name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{product.ProductCode || 'Standard Equipment'}</p>
                    
                    {/* Real Category & Price */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        {product.Family ? (
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {product.Family}
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <span className="font-bold text-gray-900">
                          {product.Price ? `$${product.Price.toLocaleString('en-US')}` : 'Contact for Price'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-end mt-2">
                        <Link 
                          href={`/products/${product.Id}`} 
                          className="text-[#e63329] font-medium text-sm flex items-center gap-1 hover:underline"
                        >
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
