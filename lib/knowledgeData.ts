export type Category = "All" | "Technical" | "Warranty" | "Orders" | "General";

export interface Article {
  id: string;
  title: string;
  category: Category;
  shortDescription: string;
  date: string;
  imageUrl: string;
  steps: string[];
}

export const knowledgeArticles: Article[] = [
  {
    id: "engine-troubleshooting-guide",
    title: "Engine Troubleshooting Guide",
    category: "Technical",
    shortDescription: "Step-by-step guide to troubleshoot engine issues.",
    date: "May 10, 2024",
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop",
    steps: [
      "Check the oil level and quality.",
      "Inspect the fuel system for leaks.",
      "Clean or replace the air filter.",
      "Check the battery and connections.",
      "Restart the engine and test performance."
    ]
  },
  {
    id: "warranty-claim-process",
    title: "Warranty Claim Process",
    category: "Warranty",
    shortDescription: "Learn how to submit and track your warranty claims.",
    date: "April 22, 2024",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop",
    steps: [
      "Gather your original purchase receipt.",
      "Take clear photos of the defective part.",
      "Log into the dealer portal and navigate to Claims.",
      "Fill out the warranty submission form with all details.",
      "Submit and wait 3-5 business days for processing."
    ]
  },
  {
    id: "order-tracking-guide",
    title: "Order Tracking Guide",
    category: "Orders",
    shortDescription: "How to track your orders and delivery status.",
    date: "June 01, 2024",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop",
    steps: [
      "Locate your Order Confirmation email.",
      "Find the tracking number provided in the email.",
      "Click the tracking link to view real-time status.",
      "Contact support if the tracking has not updated in 48 hours."
    ]
  },
  {
    id: "preventive-maintenance-tips",
    title: "Preventive Maintenance Tips",
    category: "General",
    shortDescription: "Best practices to keep your equipment running.",
    date: "March 15, 2024",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
    steps: [
      "Perform a daily visual inspection before operation.",
      "Grease all pivot points weekly.",
      "Check tire pressure and track tension regularly.",
      "Schedule professional servicing every 500 hours.",
      "Keep a log book of all maintenance performed."
    ]
  }
];
