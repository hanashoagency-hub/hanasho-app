"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute(href: string): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
