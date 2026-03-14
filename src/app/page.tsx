"use client";

import Link from "next/link";

const features = [
  {
    title: "Case Management",
    description:
      "Efficiently track and manage investigation cases with detailed status reporting and timeline tracking.",
  },
  {
    title: "Officer Assignment",
    description: "Assign and manage officer assignments with a clear audit trail of all changes.",
  },
  {
    title: "Analytics Dashboard",
    description: "Monitor performance metrics, resolution rates, and incident trends in real-time.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1F2937] flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#1F2937]">IRIS</h1>
          <p className="text-xl text-[#6B7280]">Integrated Response and Investigation System</p>
        </div>

        <p className="text-lg text-[#6B7280] mb-12">
          A comprehensive case management and incident tracking system for professional investigators and response teams.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-lg border border-[#E3E8EF] text-[#1F2937] hover:bg-white px-8 py-3 text-lg font-semibold transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white rounded-lg border border-[#E3E8EF] shadow-sm"
            >
              <h3 className="text-xl font-semibold text-[#1F2937] mb-3">{feature.title}</h3>
              <p className="text-[#6B7280] text-sm leading-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center text-[#6B7280] text-sm">
        <p>© 2026 IRIS System. All rights reserved.</p>
      </div>
    </div>
  );
}
