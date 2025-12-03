import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/', 
    '/sign-in(.*)', 
    '/sign-up(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // For public routes, allow access.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, check for authentication.
  const { userId } = auth();

  // If the user is not authenticated, redirect them to the sign-in page.
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is authenticated, allow them to proceed.
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
