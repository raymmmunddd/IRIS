import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E3E8EF] bg-white shadow-sm px-4 py-5">
      {children}
    </div>
  );
}
