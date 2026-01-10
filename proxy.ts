import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // This middleware will run on the server
  // For now, we'll handle route protection on the client side
  // since Firebase Auth is client-side in this implementation
  return NextResponse.next()
}

export const config = {
  matcher: ["/technician/:path*", "/admin/:path*", "/profile/:path*", "/history/:path*"],
}
