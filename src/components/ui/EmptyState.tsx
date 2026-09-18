import React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-[#F4EFE6] border border-[#E5DDCF] flex items-center justify-center mb-5 text-[#A6875C]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-serif font-medium text-[#241813] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#63534B] mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary">{actionLabel}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
