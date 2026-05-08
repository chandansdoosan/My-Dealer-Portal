/*import { NextResponse } from 'next/server';
import { getProductById } from '../../actions/salesforce';

export async function GET() {
  try {
    // Just mock the call or do it directly
    const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
    const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');

    // We already have callMCPToolWithRetry in salesforce.ts, let's export a raw test function from there if needed.
    // Actually, I can just write a raw fetch request here to the local MCP, but MCP is in salesforce.ts.
    // Let me just import callMCPToolWithRetry and run it, wait it's not exported.

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}*/

import { NextResponse } from 'next/server';
import { callMCPToolWithRetry } from '../../actions/salesforce';

export async function GET() {
  try {
    const result = await callMCPToolWithRetry('soqlQuery', { q: "SELECT Id, Product2Id, UnitPrice, IsActive FROM PricebookEntry LIMIT 20" });
    
    if (result.isError) {
      return NextResponse.json({ error: (result.content as any)[0].text }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: JSON.parse((result.content as any)[0].text) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

