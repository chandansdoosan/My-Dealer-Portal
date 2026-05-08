"use client";

import { useState } from "react";
import Link from "next/link";

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  imageUrl: string;
}

interface KnowledgeBaseClientProps {
  initialArticles: KBArticle[];
  categories: string[];
}

export default function KnowledgeBaseClient({ initialArticles, categories }: KnowledgeBaseClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredArticles = initialArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Knowledge Base</h1>
        <p className="text-gray-500 text-lg">Find answers to common questions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-4 pr-12 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-0 top-0 h-full w-12 bg-[#e63329] text-white flex items-center justify-center rounded-r-md cursor-pointer hover:bg-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-[#e63329] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-sm uppercase tracking-wider">{article.category}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">{article.shortDescription}</p>
                <Link 
                  href={`/knowledge-base/${article.id}`} 
                  className="text-[#e63329] font-medium text-sm flex items-center gap-1 hover:underline mt-auto"
                >
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No articles found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
