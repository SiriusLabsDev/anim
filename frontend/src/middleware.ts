import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req, event) => {
  // Custom middleware logic here
  const response = NextResponse.next();

  // get all cookies from the request and set the domain to ".siriuslabs.dev"
  const cookies = req.cookies;
  for (const [name, value] of cookies) {
    response.cookies.set(name, value.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: ".siriuslabs.dev",
    });
  }

  return response;
}, {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  authorizedParties: [process.env.NEXT_PUBLIC_API_URL!],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};