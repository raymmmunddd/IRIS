"use client";

import Link from "next/link";
import { useToggle } from "@/hooks/useToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ComponentsShowcase() {
  const toggle = useToggle(false);

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1F2937] px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Components</p>
          <h1 className="text-3xl font-bold">UI & Hooks Showcase</h1>
          <p className="text-sm text-[#6B7280]">
            Quick preview of shared UI elements and a simple toggle hook.
          </p>
        </header>

        <Card>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Primary CTA</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Toggle Hook</h2>
              <p className="text-sm text-[#6B7280]">State: {toggle.value ? "On" : "Off"}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={toggle.toggle}>Toggle</Button>
              <Button variant="secondary" onClick={toggle.setOff}>Reset</Button>
            </div>
          </div>
        </Card>

        <div className="text-sm text-[#6B7280]">
          <Link href="/login" className="text-[#1E4FA3] hover:text-[#173E82] font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
