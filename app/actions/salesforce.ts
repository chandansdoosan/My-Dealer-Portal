'use server'

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface Product {
  Id: string;
  Name: string;
  Description: string | null;
  ProductCode: string | null;
  Family: string | null;
  Price?: number;
}

let globalMcpClient: Client | null = null;

async function getMCPClient(): Promise<Client> {
  if (globalMcpClient) return globalMcpClient;

  const instanceUrl = process.env.SF_INSTANCE_URL!;
  const clientId = process.env.SF_CLIENT_ID!;
  const clientSecret = process.env.SF_CLIENT_SECRET!;

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
  if (!tokenRes.ok || tokenData.error) {
    throw new Error(`OAuth failed: ${tokenData.error_description || tokenData.error}`);
  }

  const accessToken = tokenData.access_token;
  const mcpServerUrl = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');
  const transport = new StreamableHTTPClientTransport(mcpServerUrl, {
    requestInit: { headers: { 'Authorization': `Bearer ${accessToken}` } }
  });

  const client = new Client({ name: 'abc-heavy-equipments', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  await client.listTools();

  globalMcpClient = client;
  return client;
}

export async function callMCPToolWithRetry(toolName: string, args: any, attempt = 1): Promise<any> {
  let client;
  try {
    client = await getMCPClient();
    const result = await client.callTool({ name: toolName, arguments: args });

    if (result.isError) {
      const errorText = (result.content as {text:string}[])[0]?.text || '';
      if (errorText.includes("not been initialized") && attempt < 5) {
        console.log(`MCP server initialization lag on ${toolName}. Reconnecting (Attempt ${attempt + 1})...`);
        globalMcpClient = null;
        await new Promise(resolve => setTimeout(resolve, 3000));
        return callMCPToolWithRetry(toolName, args, attempt + 1);
      }
    }
    return result;
  } catch (err: any) {
    globalMcpClient = null;
    
    if (err.message?.includes("not been initialized") && attempt < 5) {
      console.log(`MCP transport lag on ${toolName}. Reconnecting (Attempt ${attempt + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return callMCPToolWithRetry(toolName, args, attempt + 1);
    }
    throw err;
  }
}

// Search Products (only those with active prices)
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const soql = `SELECT Product2.Id, Product2.Name, Product2.Description, Product2.ProductCode, Product2.Family, UnitPrice 
                  FROM PricebookEntry 
                  WHERE IsActive = true 
                  AND (Product2.Name LIKE '%${query}%' OR Product2.Family LIKE '%${query}%' OR Product2.ProductCode LIKE '%${query}%') 
                  ORDER BY Product2.CreatedDate DESC 
                  LIMIT 100`;
    
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

    if (result.isError || !result.content || (result.content as any).length === 0) return [];

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text || text.trim() === '') return [];
    
    let records: any[] = [];
    try {
      const parsed = JSON.parse(text);
      records = parsed.records || [];
    } catch (e: any) {
      console.error('searchProducts: JSON parse error:', e.message);
      return [];
    }
    
    // De-duplicate: only keep one pricebook entry per product
    const seen = new Set();
    const unique = records.filter((r: any) => {
      if (!r.Product2 || seen.has(r.Product2.Id)) return false;
      seen.add(r.Product2.Id);
      return true;
    });

    return unique.map((r: any) => ({
      Id: r.Product2.Id,
      Name: r.Product2.Name,
      Description: r.Product2.Description,
      ProductCode: r.Product2.ProductCode,
      Family: r.Product2.Family,
      Price: r.UnitPrice
    }));
  } catch (err: any) {
    console.error('searchProducts error:', err.message);
    return [];
  }
}

// Get a single Product by ID (full catalog lookup)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // 1. Get basic product details
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE Id = '${id}' AND IsActive = true LIMIT 1`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

    if (result.isError || !result.content || (result.content as any).length === 0) return null;

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text || text.trim() === '') return null;
    
    let product: Product | null = null;
    try {
      const parsed = JSON.parse(text);
      if (!parsed.records || parsed.records.length === 0) return null;
      product = parsed.records[0] as Product;
    } catch (e: any) {
      console.error('getProductById: JSON parse error:', e.message);
      return null;
    }
    
    if (product) {
      try {
        // 2. Fetch price from any active PricebookEntry
        const priceSoql = `SELECT UnitPrice FROM PricebookEntry WHERE Product2Id = '${id}' AND IsActive = true LIMIT 1`;
        const priceResult = await callMCPToolWithRetry('soqlQuery', { q: priceSoql });
        
        if (!priceResult.isError && priceResult.content && (priceResult.content as any).length > 0) {
          const pText = (priceResult.content as {text:string}[])[0]?.text;
          if (pText && pText.trim() !== '') {
            const pParsed = JSON.parse(pText);
            if (pParsed.records && pParsed.records.length > 0) {
              product.Price = pParsed.records[0].UnitPrice;
            }
          }
        }
      } catch (priceErr) {
        console.error('getProductById: Price lookup error:', priceErr);
      }
    }
    
    return product;
  } catch (err: any) {
    console.error('getProductById error:', err.message);
    return null;
  }
}

// Fetch all Products (full catalog of 28 products)
export async function getAllProducts(): Promise<Product[]> {
  try {
    // 1. Get all products from Product2
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 100`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

    if (result.isError || !result.content || (result.content as any).length === 0) {
      console.error('getAllProducts: SOQL query failed or returned no content');
      return [];
    }

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text || text.trim() === '') return [];
    
    let products: Product[] = [];
    try {
      const parsed = JSON.parse(text);
      products = (parsed.records || []) as Product[];
    } catch (parseErr) {
      console.error('getAllProducts: Failed to parse Product2 JSON:', text);
      return [];
    }
    
    if (products.length > 0) {
      try {
        // 2. Fetch prices for these products from any active PricebookEntry
        const ids = products.map(p => `'${p.Id}'`).join(',');
        const priceSoql = `SELECT Product2Id, UnitPrice FROM PricebookEntry WHERE Product2Id IN (${ids}) AND IsActive = true`;
        const priceResult = await callMCPToolWithRetry('soqlQuery', { q: priceSoql });
        
        if (!priceResult.isError && priceResult.content && (priceResult.content as any).length > 0) {
          const pText = (priceResult.content as {text:string}[])[0]?.text;
          if (pText && pText.trim() !== '') {
            const pParsed = JSON.parse(pText);
            const pRecords = pParsed.records || [];
            const priceMap = new Map();
            pRecords.forEach((r: any) => {
              priceMap.set(r.Product2Id, r.UnitPrice);
            });
            products.forEach(p => {
              p.Price = priceMap.get(p.Id);
            });
          }
        }
      } catch (priceErr) {
        console.error('getAllProducts: Non-fatal price lookup error:', priceErr);
        // Continue anyway - we still want to show the products!
      }
    }

    return products;
  } catch (err: any) {
    console.error('getAllProducts critical error:', err.message);
    return [];
  }
}

export async function createOrderFlowAction(formData: FormData): Promise<{ success: boolean; error?: string; accountId?: string; contactId?: string; caseId?: string; orderId?: string }> {
  const firstName = (formData.get('firstName') as string) || '';
  const lastName = (formData.get('lastName') as string) || 'Unknown';
  const email = (formData.get('email') as string) || '';
  const phone = (formData.get('phone') as string) || '';
  const company = (formData.get('company') as string) || lastName;
  const quantityStr = (formData.get('quantity') as string) || '1';
  const quantity = parseInt(quantityStr, 10) || 1;
  const notes = (formData.get('notes') as string) || '';
  const productName = (formData.get('productName') as string) || 'Unknown Product';
  const productId = formData.get('productId') as string;

  try {
    // Generate deterministic price as fallback if no pricebook entry exists
    let hash = 0;
    if (productId) {
      for (let i = 0; i < productId.length; i++) {
        hash = productId.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    const randomPrice = (Math.abs(hash) % 50000) + 10000;

    // 1. Create Account
    const accountResult = await callMCPToolWithRetry('createSobjectRecord', { 
      "sobject-name": "Account", 
      "body": { Name: company } 
    });
    if (accountResult.isError) throw new Error("Failed to create Account: " + JSON.stringify(accountResult.content));
    const accountId = JSON.parse((accountResult.content as {text:string}[])[0].text).id || JSON.parse((accountResult.content as {text:string}[])[0].text).Id;

    // 2. Create Contact
    const contactResult = await callMCPToolWithRetry('createSobjectRecord', { 
      "sobject-name": "Contact", 
      "body": { FirstName: firstName, LastName: lastName, Email: email, Phone: phone, AccountId: accountId } 
    });
    if (contactResult.isError) throw new Error("Failed to create Contact: " + JSON.stringify(contactResult.content));
    const contactId = JSON.parse((contactResult.content as {text:string}[])[0].text).id || JSON.parse((contactResult.content as {text:string}[])[0].text).Id;

    // 3. Create Case
    const caseResult = await callMCPToolWithRetry('createSobjectRecord', { 
      "sobject-name": "Case", 
      "body": { Subject: `Order Request: ${productName}`, Description: `Quantity: ${quantity}\n\nNotes:\n${notes}`, AccountId: accountId, ContactId: contactId, Status: 'New', Origin: 'Web' } 
    });
    if (caseResult.isError) throw new Error("Failed to create Case: " + JSON.stringify(caseResult.content));
    const caseId = JSON.parse((caseResult.content as {text:string}[])[0].text).id || JSON.parse((caseResult.content as {text:string}[])[0].text).Id;

    // Setup Pricebook logic
    let pbId = null;
    let pbeId = null;
    let finalPrice = randomPrice;

    if (productId) {
      const pbResult = await callMCPToolWithRetry('soqlQuery', { q: "SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1" });
      if (!pbResult.isError) {
        const pbRecords = JSON.parse((pbResult.content as {text:string}[])[0].text).records;
        if (pbRecords && pbRecords.length > 0) {
          pbId = pbRecords[0].Id;
          const pbeResult = await callMCPToolWithRetry('soqlQuery', { q: `SELECT Id, UnitPrice FROM PricebookEntry WHERE Product2Id = '${productId}' AND Pricebook2Id = '${pbId}' LIMIT 1` });
          const pbeRecords = !pbeResult.isError ? JSON.parse((pbeResult.content as {text:string}[])[0].text).records : [];
          if (pbeRecords && pbeRecords.length > 0) {
            pbeId = pbeRecords[0].Id;
            finalPrice = pbeRecords[0].UnitPrice;
          } else {
            const createPbeResult = await callMCPToolWithRetry('createSobjectRecord', {
              "sobject-name": "PricebookEntry",
              "body": { Pricebook2Id: pbId, Product2Id: productId, UnitPrice: randomPrice, IsActive: true }
            });
            if (!createPbeResult.isError) {
              pbeId = JSON.parse((createPbeResult.content as {text:string}[])[0].text).id || JSON.parse((createPbeResult.content as {text:string}[])[0].text).Id;
            }
          }
        }
      }
    }

    // 4. Create Order
    const today = new Date().toISOString().split('T')[0];
    const orderBody: any = { AccountId: accountId, Status: 'Draft', EffectiveDate: today };
    if (pbId && pbeId) orderBody.Pricebook2Id = pbId;
    
    const orderResult = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Order", "body": orderBody });
    if (orderResult.isError) throw new Error("Failed to create Order: " + JSON.stringify(orderResult.content));
    const orderId = JSON.parse((orderResult.content as {text:string}[])[0].text).id || JSON.parse((orderResult.content as {text:string}[])[0].text).Id;

    // 5. Create OrderItem
    if (orderId && pbeId) {
      await callMCPToolWithRetry('createSobjectRecord', {
        "sobject-name": "OrderItem",
        "body": { OrderId: orderId, PricebookEntryId: pbeId, Quantity: quantity, UnitPrice: finalPrice }
      });
    }

    return { success: true, accountId, contactId, caseId, orderId };
  } catch (err: any) {
    console.error('createOrderFlowAction error:', err.message);
    return { success: false, error: err.message };
  }
}

// Create a Salesforce Lead
export async function createLeadAction(formData: FormData): Promise<{ success: boolean; leadId?: string; error?: string }> {
  const fullName = (formData.get('fullName') as string) || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : fullName;
  const productId = formData.get('productId') as string;

  const leadData: Record<string, any> = {
    FirstName: firstName,
    LastName: lastName || 'Unknown',
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Company: (formData.get('company') as string) || 'Not Specified',
    Description: formData.get('message') as string,
    LeadSource: 'Web',
  };

  if (productId) {
    leadData.Interested_Product__c = productId;
  }

  try {
    const result = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Lead", "body": leadData });

    if (result.isError) {
      const errorMsg = (result.content as {text: string}[])[0]?.text || 'MCP error';
      return { success: false, error: errorMsg };
    }

    const text = (result.content as { type: string; text: string }[])[0].text;
    const parsed = JSON.parse(text);
    return { success: true, leadId: parsed.id || parsed.Id };
  } catch (err: any) {
    console.error('createLeadAction error:', err.message);
    return { success: false, error: err.message };
  }
}

// Get all Knowledge Base Articles
export async function getKnowledgeArticles(): Promise<any[]> {
  try {
    const soql = `SELECT Id, Title__c, Article_Body__c, Tags__c FROM Knowledge_Base__c ORDER BY CreatedDate DESC LIMIT 50`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

    if (result.isError) return [];

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.records || [];
  } catch (err: any) {
    console.error('getKnowledgeArticles error:', err.message);
    return [];
  }
}

// Get single Knowledge Base Article by ID
export async function getKnowledgeArticleById(id: string): Promise<any | null> {
  try {
    const soql = `SELECT Id, Title__c, Article_Body__c, Tags__c FROM Knowledge_Base__c WHERE Id = '${id}' LIMIT 1`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

    if (result.isError) return null;

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text) return null;
    
    const parsed = JSON.parse(text);
    const records = parsed.records || [];
    return records.length > 0 ? records[0] : null;
  } catch (err: any) {
    console.error('getKnowledgeArticleById error:', err.message);
    return null;
  }
}

// --- Unique Target Actions Merged ---

// Create a Case in Salesforce
export async function createCaseAction(formData: FormData) {
  const subject = formData.get('subject') as string;
  const caseType = formData.get('caseType') as string;
  const status = formData.get('status') as string;
  const caseOrigin = formData.get('caseOrigin') as string;
  const description = formData.get('description') as string;

  const caseData: Record<string, any> = {
    Subject: subject,
    Type: caseType,
    Description: description,
    Origin: caseOrigin || 'Web',
    Status: status || 'New',
    Priority: 'Medium',
  };

  try {
    const result = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Case", "body": caseData });

    if (result.isError) {
      const errorMsg = (result.content as {text: string}[])[0]?.text || 'MCP error';
      return { success: false, error: errorMsg };
    }

    const content = result.content as { type: string; text: string }[];
    const parsed = JSON.parse(content[0].text);
    const caseId = parsed.id || parsed.Id;

    console.log('✅ Case created via MCP! ID:', caseId);
    return { success: true, caseId };

  } catch (error: any) {
    console.error('❌ MCP Error:', error.message);
    return { success: false, error: error.message || 'Failed to create case via MCP.' };
  }
}

// Submit Onboarding to Salesforce (Account, Contact, Opportunity)
export async function createOnboardingAction(onboardingData: Record<string, any>) {
  try {
    // 1. Create Salesforce Account
    const accountPayload = {
      Name: onboardingData.companyName,
      Website: onboardingData.websiteUrl || '',
      BillingStreet: onboardingData.primaryStreet || '',
      BillingCity: onboardingData.primaryCity || '',
      BillingState: onboardingData.primaryState || '',
      BillingPostalCode: onboardingData.primaryZip || '',
      BillingCountry: onboardingData.primaryCountry || '',
      ShippingStreet: onboardingData.billingStreet || onboardingData.primaryStreet || '',
      ShippingCity: onboardingData.billingCity || onboardingData.primaryCity || '',
      ShippingState: onboardingData.billingState || onboardingData.primaryState || '',
      ShippingPostalCode: onboardingData.billingZip || onboardingData.primaryZip || '',
      ShippingCountry: onboardingData.billingCountry || onboardingData.primaryCountry || '',
      Description: `Equipment Specialties: ${onboardingData.specialties?.join(', ') || 'None'}. Territory: ${onboardingData.territory || 'Not Specified'}.`
    };

    const accountResult = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Account", "body": accountPayload });
    if (accountResult.isError) {
      throw new Error((accountResult.content as {text: string}[])[0]?.text || 'Failed to create Account');
    }
    const accParsed = JSON.parse((accountResult.content as { type: string; text: string }[])[0].text);
    const accountId = accParsed.id || accParsed.Id;

    // 2. Create Salesforce Contact (Linked to Account)
    const contactPayload = {
      FirstName: onboardingData.firstName || '',
      LastName: onboardingData.lastName || 'Onboarding Contact',
      Email: onboardingData.email || '',
      Phone: onboardingData.phone || '',
      AccountId: accountId,
      LeadSource: 'Web'
    };

    const contactResult = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Contact", "body": contactPayload });
    if (contactResult.isError) {
      throw new Error((contactResult.content as {text: string}[])[0]?.text || 'Failed to create Contact');
    }

    // 3. Create Salesforce Opportunity (Linked to Account, Closed Won)
    const currentDate = new Date().toISOString().split('T')[0];
    const opportunityPayload = {
      Name: `${onboardingData.companyName} - Onboarding Opportunity`,
      StageName: 'Closed Won',
      CloseDate: currentDate,
      AccountId: accountId,
      LeadSource: 'Web',
      Amount: 150000, // Hardcoded standard onboarding default amount
      Description: `Onboarding Opportunity for ABC Equipment. Bank Account Name: ${onboardingData.bankName || 'Not Specified'}.`
    };

    const opportunityResult = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Opportunity", "body": opportunityPayload });
    if (opportunityResult.isError) {
      throw new Error((opportunityResult.content as {text: string}[])[0]?.text || 'Failed to create Opportunity');
    }

    console.log('✅ Onboarding successfully completed for Account ID:', accountId);
    return { success: true, accountId };

  } catch (error: any) {
    console.error('❌ Onboarding MCP Error:', error.message);
    return { success: false, error: error.message || 'Failed to complete onboarding via MCP.' };
  }
}
