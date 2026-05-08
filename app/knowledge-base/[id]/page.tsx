import Link from "next/link";
import { notFound } from "next/navigation";
import { getKnowledgeArticleById } from "../../actions/salesforce";

export const dynamic = 'force-dynamic';

export default async function KnowledgeArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const articleId = resolvedParams.id;
  
  const article = await getKnowledgeArticleById(articleId);

  if (!article) {
    notFound();
  }

  const tags = article.Tags__c ? article.Tags__c.split(',').map((t: string) => t.trim()) : ["General"];
  const category = tags[0] || "General";
  
  const imageUrl = `/images/kb/${article.Id}.png`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/knowledge-base" className="hover:text-[#e63329] transition-colors">Knowledge Base</Link>
        <span>&gt;</span>
        <span className="text-gray-900">{category}</span>
        <span>&gt;</span>
        <span className="text-gray-900 truncate">{article.Title__c}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Content */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.Title__c}</h1>
          
          <div className="flex items-center gap-3 mb-8 text-sm">
            <span className="bg-[#fff1f0] text-[#e63329] px-3 py-1 rounded-sm font-medium">
              {category}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">Salesforce Knowledge Base</span>
          </div>

          <div className="prose prose-lg text-gray-700 leading-relaxed mb-12">
            {article.Article_Body__c.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').split('\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>

          {tags.length > 1 && (
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>If the issue persists, please raise a support case via your dealer portal.</p>
          </div>

          <Link href="/knowledge-base" className="inline-flex items-center gap-2 text-[#e63329] font-medium hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Articles
          </Link>
        </div>

        {/* Right Column - Image */}
        <div className="lg:w-5/12">
          <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 sticky top-24">
            <img 
              src={imageUrl} 
              alt={article.Title__c} 
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
