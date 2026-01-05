import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Login-Seite ist immer erlaubt
        if (pathname.startsWith("/admin/login")) {
          return true
        }
        
        // Alle anderen Admin-Seiten brauchen Authentifizierung
        if (pathname.startsWith("/admin")) {
          return !!token
        }
        
        // Andere Seiten sind öffentlich
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"],
}

