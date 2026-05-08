const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const instanceUrl = process.env.SF_INSTANCE_URL;
    const clientId = process.env.SF_CLIENT_ID;
    const clientSecret = process.env.SF_CLIENT_SECRET;

    const tokenRes = await fetch(`${instanceUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const mcpServerUrl = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');
    const transport = new StreamableHTTPClientTransport(mcpServerUrl, {
      requestInit: { headers: { 'Authorization': `Bearer ${accessToken}` } }
    });

    const client = new Client({ name: 'test', version: '1.0.0' }, { capabilities: {} });
    await client.connect(transport);
    await client.listTools();

    const productQuery = `SELECT Id, Name, Description, ProductCode, Family, Engine_Power__c, Operating_Weight__c, Starting_Price__c FROM Product2 LIMIT 1`;
    const res = await client.callTool({ name: 'soqlQuery', arguments: { q: productQuery } });
    console.log("Product2 (attempt 1):", JSON.stringify(res, null, 2));

    if (res.isError) {
      const productQuery2 = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 LIMIT 1`;
      const res2 = await client.callTool({ name: 'soqlQuery', arguments: { q: productQuery2 } });
      console.log("Product2 (attempt 2):", JSON.stringify(res2, null, 2));
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
