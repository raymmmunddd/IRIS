"use client";

import { ButtonHTMLAttributes } from "react";

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E4FA3] focus-visible:ring-offset-white disabled:opacity-70 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-[#1E4FA3] text-white hover:bg-[#173E82] px-4 py-2 border border-[#1E4FA3]",
  secondary:
    "bg-white text-[#1F2937] border border-[#E3E8EF] hover:bg-[#E8F0FF] px-4 py-2",
};

export type ButtonVariant = keyof typeof variants;

export type ButtonProps = {
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${baseClass} ${variants[variant]} ${className}`} {...props} />;
}
