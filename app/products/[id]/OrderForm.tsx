"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderFlowAction } from "../../actions/salesforce";

interface OrderFormProps {
  productId: string;
  productName: string;
}

export default function OrderForm({ productId, productName }: OrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('productId', productId);
    formData.append('productName', productName);

    try {
      const result = await createOrderFlowAction(formData);
      
      if (result.success) {
        const queryParams = new URLSearchParams();
        if (result.accountId) queryParams.append('accountId', result.accountId);
        if (result.contactId) queryParams.append('contactId', result.contactId);
        if (result.caseId) queryParams.append('caseId', result.caseId);
        if (result.orderId) queryParams.append('orderId', result.orderId);
        
        router.push(`/thank-you?${queryParams.toString()}`);
      } else {
        setError(result.error || "Failed to submit order request. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 bg-gray-50 p-6 rounded-lg border border-gray-100">
      <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 pb-3">Request an Order</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input required type="text" name="firstName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input required type="text" name="lastName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input required type="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input required type="tel" name="phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input required type="text" name="company" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329]" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
        <div className="flex items-center gap-3 w-32">
          <input 
            required 
            type="number" 
            name="quantity" 
            defaultValue="1" 
            min="1" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329] text-center" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea 
          name="notes" 
          rows={3}
          placeholder="Add any special instructions or notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e63329] resize-none" 
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#e63329] text-white py-3 rounded-md font-medium text-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-sm"
      >
        {isSubmitting ? "Processing..." : "Place Order Request"}
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
        By placing an order request, our team will create your account and contact you to finalize payment and delivery.
      </p>
    </form>
  );
}
