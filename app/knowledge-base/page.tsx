import KnowledgeBaseClient, { KBArticle } from "./KnowledgeBaseClient";
import { getKnowledgeArticles } from "../actions/salesforce";

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const rawArticles = await getKnowledgeArticles();

  const categoriesSet = new Set<string>();
  categoriesSet.add("All");

  const initialArticles: KBArticle[] = rawArticles.map((article: any) => {
    // Extract first tag as category
    const tags = article.Tags__c ? article.Tags__c.split(',').map((t: string) => t.trim()) : ["General"];
    const category = tags[0] || "General";
    categoriesSet.add(category);

    const imageUrl = `/images/kb/${article.Id}.png`;

    const rawBody = article.Article_Body__c || "No description available.";
    const cleanBody = rawBody.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

    return {
      id: article.Id,
      title: article.Title__c || "Untitled Article",
      category: category,
      shortDescription: cleanBody.substring(0, 150) + "...",
      imageUrl: imageUrl
    };
  });

  const categories = Array.from(categoriesSet);

  return (
    <KnowledgeBaseClient 
      initialArticles={initialArticles} 
      categories={categories} 
    />
  );
}
