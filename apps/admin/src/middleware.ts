import { updateSession } from "@pergon/database/middleware";
import { NextResponse, type NextRequest } from "next/server";

const REQUEST_ID_HEADER = "x-request-id";

function createRequestId() {
  return crypto.randomUUID();
}

function withRequestHeaders(request: NextRequest, requestId: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? createRequestId();

  try {
    const response = await updateSession(request, (req) => withRequestHeaders(req, requestId));
    response.headers.set(REQUEST_ID_HEADER, requestId);
    response.headers.set("x-pergon-app", "admin");
    return response;
  } catch {
    // Session refresh must never blank the app. Prefer a bare next() over a white screen.
    const response = withRequestHeaders(request, requestId);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    response.headers.set("x-pergon-app", "admin");
    return response;
  }
}

export const config = {
  // Node.js avoids Edge CSP blocking webpack/eval in the middleware graph (EvalError → blank UI).
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
