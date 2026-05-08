import { NextResponse } from 'next/server';
import { getKnowledgeArticles } from '../../actions/salesforce';

export async function GET() {
  try {
    const articles = await getKnowledgeArticles();
    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
