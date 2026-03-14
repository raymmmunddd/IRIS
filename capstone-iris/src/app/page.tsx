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
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">IRIS</h1>
          <p className="text-xl text-slate-300">Integrated Response and Investigation System</p>
        </div>

        <p className="text-lg text-slate-400 mb-12">
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
            className="w-full sm:w-auto rounded-lg border border-slate-500 text-slate-100 hover:bg-slate-800 px-8 py-3 text-lg font-semibold transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-slate-900 rounded-lg border border-slate-800 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center text-slate-500 text-sm">
        <p>© 2026 IRIS System. All rights reserved.</p>
      </div>
    </div>
  );
}
