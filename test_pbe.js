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

    const tokenRes = await fetch(`${env.SF_INSTANCE_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env.SF_CLIENT_ID,
        client_secret: env.SF_CLIENT_SECRET,
      }),
    });
    const accessToken = (await tokenRes.json()).access_token;
    
    const client = new Client({ name: 'test', version: '1.0.0' }, { capabilities: {} });
    await client.connect(new StreamableHTTPClientTransport(new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all'), {
      requestInit: { headers: { 'Authorization': `Bearer ${accessToken}` } }
    }));
    await client.listTools();

    // Find a product
    const prodRes = await client.callTool({ name: 'soqlQuery', arguments: { q: "SELECT Id FROM Product2 LIMIT 1" } });
    const productId = JSON.parse(prodRes.content[0].text).records[0].Id;
    console.log("Product:", productId);

    // Get Standard Pricebook
    const pbRes = await client.callTool({ name: 'soqlQuery', arguments: { q: "SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1" } });
    const pbId = JSON.parse(pbRes.content[0].text).records[0].Id;
    console.log("Standard Pricebook:", pbId);

    // Check PBE
    const pbeRes = await client.callTool({ name: 'soqlQuery', arguments: { q: `SELECT Id FROM PricebookEntry WHERE Product2Id = '${productId}' AND Pricebook2Id = '${pbId}' LIMIT 1` } });
    let pbeId;
    const pbeRecords = JSON.parse(pbeRes.content[0].text).records;
    if (pbeRecords.length > 0) {
      pbeId = pbeRecords[0].Id;
      console.log("Existing PBE:", pbeId);
    } else {
      console.log("Creating PBE...");
      const createPbe = await client.callTool({ name: 'createSobjectRecord', arguments: { "sobject-name": "PricebookEntry", "body": { Pricebook2Id: pbId, Product2Id: productId, UnitPrice: 1000, IsActive: true } } });
      pbeId = JSON.parse(createPbe.content[0].text).id;
      console.log("Created PBE:", pbeId);
    }

    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
run();
