import Link from "next/link";

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const accountId = resolvedParams.accountId as string | undefined;
  const contactId = resolvedParams.contactId as string | undefined;
  const caseId = resolvedParams.caseId as string | undefined;
  const orderId = resolvedParams.orderId as string | undefined;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16 bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-3xl w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
        <p className="text-gray-500 text-lg mb-10">
          Your order request has been logged in Salesforce.<br />
          Our team will review the details and contact you shortly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-xs">Account<br/>Created</span>
            {accountId && <span className="text-[10px] text-gray-500 mt-2 block font-mono bg-gray-200 px-1 py-0.5 rounded truncate w-full">ID: {accountId}</span>}
          </div>

          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-xs">Contact<br/>Created</span>
            {contactId && <span className="text-[10px] text-gray-500 mt-2 block font-mono bg-gray-200 px-1 py-0.5 rounded truncate w-full">ID: {contactId}</span>}
          </div>
          
          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-xs">Case<br/>Log</span>
            {caseId && <span className="text-[10px] text-gray-500 mt-2 block font-mono bg-gray-200 px-1 py-0.5 rounded truncate w-full">ID: {caseId}</span>}
          </div>
          
          <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-xs">Order<br/>Placed</span>
            {orderId && <span className="text-[10px] text-gray-500 mt-2 block font-mono bg-gray-200 px-1 py-0.5 rounded truncate w-full">ID: {orderId}</span>}
          </div>
        </div>

        <Link 
          href="/" 
          className="inline-block bg-[#e63329] text-white px-10 py-3 rounded-md font-medium text-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
