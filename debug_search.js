const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
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

  // Query products directly to see what we have
  const res = await fetch(`${instanceUrl}/services/data/v60.0/query/?q=SELECT+Id,Name,IsActive+FROM+Product2+WHERE+Name+LIKE+'%25Excavator%25'`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const data = await res.json();
  console.log("Excavator Products:", JSON.stringify(data, null, 2));

  // Query PBE for those products
  if (data.records && data.records.length > 0) {
    const ids = data.records.map(r => `'${r.Id}'`).join(',');
    const pbeRes = await fetch(`${instanceUrl}/services/data/v60.0/query/?q=SELECT+Id,Product2Id,IsActive,Pricebook2.IsStandard+FROM+PricebookEntry+WHERE+Product2Id+IN+(${ids})`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const pbeData = await pbeRes.json();
    console.log("Associated PricebookEntries:", JSON.stringify(pbeData, null, 2));
  }
}

run().catch(console.error);
