"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { CV } from "@/lib/cv";

type CVBadgeVariant = "green" | "blue" | "red" | "purple" | "yellow" | "amber" | "indigo" | "pink";

interface CVBadgeProps {
  cv: CV;
  variant?: CVBadgeVariant;
  bgColor?: string;
  textColor?: string;
  href?: string;
  target?: string;
}

const variantStyles: Record<CVBadgeVariant, { bg: string; text: string }> = {
  green: { bg: "bg-green-100", text: "text-green-800" },
  blue: { bg: "bg-blue-100", text: "text-blue-800" },
  red: { bg: "bg-red-100", text: "text-red-800" },
  purple: { bg: "bg-purple-100", text: "text-purple-800" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
  amber: { bg: "bg-amber-100", text: "text-amber-800" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-800" },
  pink: { bg: "bg-pink-100", text: "text-pink-800" },
};

export default function CVBadge({
  cv,
  variant = "green",
  bgColor,
  textColor,
  href,
  target,
}: CVBadgeProps) {
  const style = variantStyles[variant];
  const finalBgColor = bgColor || style.bg;
  const finalTextColor = textColor || style.text;
  const defaultHref = href || `/dashboard/cv/${cv.id}`;

  const linkStyle: React.CSSProperties = {
    color: "inherit",
    textDecoration: "none",
    transition: "opacity 0.3s",
  };

  return (
    <Link
      key={cv.id}
      href={defaultHref}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      style={linkStyle}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${finalBgColor} ${finalTextColor} hover:opacity-80`}>
      <FileText className="h-3 w-3 mr-1" />
      {cv.parsedData.contact?.name}
    </Link>
  );
}
