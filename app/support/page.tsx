'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCaseAction } from "@/app/actions/salesforce";

export default function SupportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCaseAction(formData);

    if (result.success) {
      router.push(`/support/success?id=${result.caseId}`);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="w-full bg-[#F5F6F8] min-h-[calc(100vh-64px)] py-[20px] px-[32px] flex justify-center items-center overflow-hidden">
      <div className="max-w-[1280px] w-full flex flex-col gap-[16px]">
        
        {/* Title Area */}
        <div>
          <h1 className="text-[#071B34] text-[24px] font-extrabold tracking-tight mb-[1px]">
            Raise Support Case
          </h1>
          <p className="text-[#6B7280] text-[13px] font-medium">
            Let us know how we can help you
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-[55%_45%] gap-[36px] items-center">
          
          {/* Left Column: Form Card */}
          <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-[24px] shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
              
              {/* Subject */}
              <div>
                <label className="block text-[13px] font-bold text-[#071B34] mb-[4px]">
                  Subject <span className="text-[#F97316]">*</span>
                </label>
                <input
                  name="subject"
                  required
                  placeholder="Enter subject"
                  className="w-full h-[40px] px-[12px] rounded-[6px] border border-[#D1D5DB] text-[13px] font-medium text-[#111827] bg-white focus:outline-none focus:border-[#F97316] placeholder:text-[#9CA3AF]"
                />
              </div>

              {/* Grid for Case Type */}
              <div>
                <label className="block text-[13px] font-bold text-[#071B34] mb-[4px]">
                  Case Type <span className="text-[#F97316]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="caseType"
                    required
                    defaultValue=""
                    className="w-full h-[40px] px-[12px] pr-[32px] rounded-[6px] border border-[#D1D5DB] text-[13px] font-medium text-[#111827] bg-white focus:outline-none focus:border-[#F97316] appearance-none"
                  >
                    <option value="" disabled>Select case type</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Structural">Structural</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status & Case Origin Side-by-Side */}
              <div className="grid grid-cols-2 gap-[16px]">
                {/* Status */}
                <div>
                  <label className="block text-[13px] font-bold text-[#071B34] mb-[4px]">
                    Status <span className="text-[#F97316]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      required
                      defaultValue="New"
                      className="w-full h-[40px] px-[12px] pr-[32px] rounded-[6px] border border-[#D1D5DB] text-[13px] font-medium text-[#111827] bg-white focus:outline-none focus:border-[#F97316] appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Working">Working</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                    <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Case Origin */}
                <div>
                  <label className="block text-[13px] font-bold text-[#071B34] mb-[4px]">
                    Case Origin <span className="text-[#F97316]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="caseOrigin"
                      required
                      defaultValue="Web"
                      className="w-full h-[40px] px-[12px] pr-[32px] rounded-[6px] border border-[#D1D5DB] text-[13px] font-medium text-[#111827] bg-white focus:outline-none focus:border-[#F97316] appearance-none"
                    >
                      <option value="Web">Web</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                    </select>
                    <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-bold text-[#071B34] mb-[4px]">
                  Description <span className="text-[#F97316]">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe your issue in detail..."
                  className="w-full p-[12px] rounded-[6px] border border-[#D1D5DB] text-[13px] font-medium text-[#111827] bg-white focus:outline-none focus:border-[#F97316] placeholder:text-[#9CA3AF] resize-none"
                />
              </div>

              {error && (
                <div className="p-[8px_12px] bg-red-50 border border-red-200 rounded-[6px] text-red-600 text-[12px]">
                  {error}
                </div>
              )}

              {/* Horizontal Action Buttons */}
              <div className="flex items-center gap-[12px] mt-[4px]">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="h-[40px] px-[28px] border border-[#D1D5DB] rounded-[6px] bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] px-[28px] bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[13px] rounded-[6px] cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Case'}
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-xl border-[6px] border-white rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="/support-agent.png" 
                alt="Support Agent" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
