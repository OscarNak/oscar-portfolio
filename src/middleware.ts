import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ajouter des headers de cache pour les images optimisées
  if (request.nextUrl.pathname.startsWith('/optimized/')) {
    const response = NextResponse.next()
    
    // Cache dans le navigateur pendant 1 semaine
    response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
    
    return response
  }

  return NextResponse.next()
}
