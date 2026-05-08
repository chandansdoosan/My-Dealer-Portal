const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const fs = require('fs');

async function run() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1]] = match[2].replace(/\r$/, '');
    });

    const instanceUrl = env.SF_INSTANCE_URL;
    const clientId = env.SF_CLIENT_ID;
    const clientSecret = env.SF_CLIENT_SECRET;

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

    console.log("Creating Account...");
    const accountResult = await client.callTool({ name: 'createSobjectRecord', arguments: { "sobject-name": "Account", "body": { Name: "Test Company" } } });
    if (accountResult.isError) {
      console.error("Account Error:", JSON.stringify(accountResult, null, 2));
      return;
    }
    const accountId = JSON.parse(accountResult.content[0].text).id || JSON.parse(accountResult.content[0].text).Id;
    console.log("Account ID:", accountId);

    console.log("Creating Contact...");
    const contactResult = await client.callTool({ name: 'createSobjectRecord', arguments: { "sobject-name": "Contact", "body": { FirstName: "Test", LastName: "User", Email: "test@example.com", Phone: "123", AccountId: accountId } } });
    if (contactResult.isError) {
      console.error("Contact Error:", JSON.stringify(contactResult, null, 2));
      return;
    }
    const contactId = JSON.parse(contactResult.content[0].text).id || JSON.parse(contactResult.content[0].text).Id;
    console.log("Contact ID:", contactId);

    console.log("Creating Case...");
    const caseResult = await client.callTool({ name: 'createSobjectRecord', arguments: { "sobject-name": "Case", "body": { Subject: "Order Request: Test", Description: "Qty 1", AccountId: accountId, ContactId: contactId, Status: "New", Origin: "Web" } } });
    if (caseResult.isError) {
      console.error("Case Error:", JSON.stringify(caseResult, null, 2));
      return;
    }
    const caseId = JSON.parse(caseResult.content[0].text).id || JSON.parse(caseResult.content[0].text).Id;
    console.log("Case ID:", caseId);

    console.log("Creating Order...");
    const today = new Date().toISOString().split('T')[0];
    const orderResult = await client.callTool({ name: 'createSobjectRecord', arguments: { "sobject-name": "Order", "body": { AccountId: accountId, Status: "Draft", EffectiveDate: today } } });
    if (orderResult.isError) {
      console.error("Order Error:", JSON.stringify(orderResult, null, 2));
      return;
    }
    const orderId = JSON.parse(orderResult.content[0].text).id || JSON.parse(orderResult.content[0].text).Id;
    console.log("Order ID:", orderId);

    process.exit(0);
  } catch (e) {
    console.error("Exception:", e);
    process.exit(1);
  }
}

run();
