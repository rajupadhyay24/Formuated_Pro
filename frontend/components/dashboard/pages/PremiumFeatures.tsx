"use client";

import React, { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>
);

interface PricingCardProps {
  plan: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  onChoosePlan: (price: number, plan: string) => void;
  loading: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  price,
  description,
  features,
  isPopular = false,
  onChoosePlan,
  loading,
}) => (
  <div
    className={`border rounded-xl p-8 shadow-lg relative w-full max-w-md bg-white dark:bg-gray-800 transition-transform transform hover:scale-105 duration-300 ${isPopular ? "border-blue-600 border-2" : "border-gray-200 dark:border-gray-700"}`}
  >
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
        BEST VALUE
      </div>
    )}
    <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
      {plan}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-center mt-2 h-12">
      {description}
    </p>
    <p className="text-5xl font-extrabold text-center my-6 text-gray-900 dark:text-white">
      ₹{price}
      {plan !== "Student Plan" && (
        <span className="text-base font-medium text-gray-500 dark:text-gray-400">
          /{plan === "Pro Monthly" ? "month" : "year"}
        </span>
      )}
    </p>
    <ul className="space-y-4 my-8 text-gray-600 dark:text-gray-300">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-start">
          <CheckIcon />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={() => onChoosePlan(price, plan)}
      disabled={plan === "Student Plan" || loading}
      className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${isPopular ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-400/50 shadow-lg" : "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"} ${plan === "Student Plan" ? "cursor-not-allowed bg-gray-300 dark:bg-gray-600" : ""} ${loading ? "opacity-50 cursor-wait" : ""}`}
    >
      {loading
        ? "Processing..."
        : plan === "Student Plan"
          ? "Your Current Plan"
          : "Get Started"}
    </button>
  </div>
);

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumFeatures() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const plans = {
    free: {
      plan: "Student Plan",
      price: 0,
      description: "To try out our automation service.",
      features: [
        "1 Free Form Fill",
        "Standard Automation Speed",
        "Community Support",
      ],
    },
    monthly: {
      plan: "Pro Monthly",
      price: 199,
      description: "For users who fill forms regularly.",
      features: [
        "10 Form Fills per month",
        "Priority Automation Speed",
        "OCR Data Extraction from Marksheet",
        "Auto-save Application Progress",
        "Priority Email Support",
      ],
    },
    yearly: {
      plan: "Ultimate Yearly",
      price: 999,
      description: "For power users who want the best value.",
      features: [
        "Unlimited Form Fills",
        "Everything in Pro Monthly",
        "Application Status Tracking Dashboard",
        "Early Access to New Form Templates",
        "Dedicated Chat Support",
      ],
      isPopular: true,
    },
  };

  const handlePayment = async (amount: number, planName: string) => {
    const isPremium = localStorage.getItem("isPremium") === "true";
    if (isPremium) {
      alert("🎉 You already have premium access!");
      return;
    }
    if (amount === 0) return;
    setLoading(true);
    setError(null);
    console.log("Attempting to start payment...");

    try {
      const razorpayKey = "rzp_test_RS4NPxiiOElHvD";
      if (!razorpayKey) {
        throw new Error(
          "Razorpay Key ID is not configured. Please check your .env.local file.",
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay script not loaded. Please check your internet and layout.tsx file.",
        );
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "process.env.NEXT_PUBLIC_API_URL";
      console.log(`Creating order with backend at: ${API_URL}`);

      const orderResponse = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR" }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          `Server Error: ${errorData.error || "Could not create order."}`,
        );
      }
      const order = await orderResponse.json();
      console.log("Order created successfully:", order);

      const options = {
        key: "rzp_test_RS4NPxiiOElHvD",
        amount: order.amount,
        currency: "INR",
        name: "Formulated Pro",
        description: `Purchase: ${planName}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: localStorage.getItem("userId"),
              }),
            });

            const result = await verifyRes.json();
            if (result.status === "success") {
              alert(" Payment successful! Premium features unlocked.");
              localStorage.setItem("isPremium", "true");
              window.location.href = "/dashboard";
            } else {
              alert(" Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
          }
        },
        prefill: { name: "Test User", email: "test.user@example.com" },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) =>
        setError(response.error.description),
      );

      console.log("Opening Razorpay popup...");
      rzp.open();
    } catch (err: unknown) {
      console.error("Payment failed:", err);
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <div className="container mx-auto max-w-6xl py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            The Right Plan for Your Ambition
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Save hours on repetitive government forms. Our automation handles
            the work, so you can focus on what matters most: your preparation.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8">
          <PricingCard
            {...plans.free}
            onChoosePlan={handlePayment}
            loading={loading}
          />
          <PricingCard
            {...plans.yearly}
            onChoosePlan={handlePayment}
            loading={loading}
          />
          <PricingCard
            {...plans.monthly}
            onChoosePlan={handlePayment}
            loading={loading}
          />
        </div>
        {error && (
          <p className="mt-8 text-center text-red-500 dark:text-red-400 font-semibold">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
