import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ROLE_PERMISSIONS } from "@/types";
import type { Permission } from "@/types";
import type { UserRole } from "@prisma/client";

// In src/middleware.ts — replace ROUTE_PERMISSIONS with this
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/vehicles":      "vehicles:read",
  "/trips":         "trips:read",
  "/maintenance":   "maintenance:read",
  "/fuel-expenses": "fuel:read",
  "/drivers":       "drivers:read",
  "/analytics":     "analytics:read",
  // /dashboard intentionally excluded — all authenticated users can access it
};


export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn   = !!req.auth?.user;
  const pathname     = nextUrl.pathname;

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    return;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  const userRole = req.auth?.user?.role as UserRole | undefined;
  if (userRole) {
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
      pathname.startsWith(route)
    );
    if (matchedRoute) {
      const required    = ROUTE_PERMISSIONS[matchedRoute];
      const permissions = ROLE_PERMISSIONS[userRole] ?? [];
      if (!permissions.includes(required)) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
