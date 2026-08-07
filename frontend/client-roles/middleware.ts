import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/signin",
  "/register",
  "/admin-register",
  "/admin-verify",
  "/admin-complete",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/first-login",
  "/po-verify",
  "/vendor-signin",
  "/vendor-register",
  "/vendor-kyc",
  "/vendor-pending",
  "/main-dashboard/admin",
];
const authRoutes = ["/signin", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isAuthenticated = request.cookies.get("auth_session")?.value === "1";

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/select-org", request.url));
  }

  const isPoVerifyRoute = /^\/[^/]+\/projects\/[^/]+\/po-verify\//.test(pathname);

  if (!isPublicRoute && !isAuthenticated && !isPoVerifyRoute) {
    const signinUrl = new URL("/signin", request.url);
    // Only set redirect param for non-root paths to avoid an infinite loop:
    //   unauthenticated / → /signin?redirect=/ → after login → / → loops again
    // Preserve the query string too, so deep links (e.g. a shared conference
    // link /conference?meeting=…) survive the round-trip through signin.
    if (pathname !== "/") {
      signinUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};

export default middleware;
