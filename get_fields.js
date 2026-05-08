const fs = require('fs');

async function run() {
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

  const res = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Product2/describe`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const describe = await res.json();
  const fields = describe.fields.map(f => f.name);
  console.log("Product2 fields:", fields.filter(f => f.endsWith('__c')));

  const orderRes = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Order/describe`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const orderDesc = await orderRes.json();
  const orderFields = orderDesc.fields.map(f => f.name);
  console.log("Order fields:", orderFields.filter(f => f.endsWith('__c') || f === 'Status' || f === 'AccountId'));
}

run().catch(console.error);
