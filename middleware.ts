import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Bloqueia o painel admin e sua API em produção.
 * Em desenvolvimento local (`npm run dev`) continua funcionando normalmente.
 * Para liberar em produção (não recomendado), defina ALLOW_ADMIN=1.
 */
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_ADMIN !== "1") {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
