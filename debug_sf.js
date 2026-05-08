const fs = require('fs');

async function testConnection() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1]] = match[2].trim();
    });

    const { SF_INSTANCE_URL: instanceUrl, SF_CLIENT_ID: clientId, SF_CLIENT_SECRET: clientSecret } = env;

    console.log('Fetching token...');
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
    if (!tokenRes.ok) {
      console.error('Token fetch failed:', tokenData);
      return;
    }
    console.log('Token fetched successfully.');

    const accessToken = tokenData.access_token;

    console.log('Describing Product2...');
    const res = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Product2/describe`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const describe = await res.json();
    if (!res.ok) {
      console.error('Describe failed:', describe);
      return;
    }

    console.log('Describe successful. Number of fields:', describe.fields.length);
    console.log('Custom fields:', describe.fields.map(f => f.name).filter(n => n.endsWith('__c')));

  } catch (err) {
    console.error('Error:', err);
  }
}

testConnection();
