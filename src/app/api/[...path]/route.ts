import { NextRequest, NextResponse } from "next/server";

// Server-only: never prefixed NEXT_PUBLIC_, so the backend URL stays out of
// the client bundle. This also means requests from the browser only see
// first-party /api/* URLs — the JWT cookie becomes first-party to this
// origin and survives third-party-cookie blocking on incognito + strict
// privacy browsers.
const BACKEND_URL =
  process.env.BACKEND_URL || "https://bridgeai-api-w58c.onrender.com";

// Don't try to statically render / cache the proxy.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const target = new URL(`/${params.path.join("/")}`, BACKEND_URL);

  // Preserve query string.
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  // Copy headers; strip Host so fetch sets the backend's host itself.
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length"); // let fetch recompute after body re-read

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual", // so 302s (OAuth, etc.) reach the browser
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target.toString(), init);

  // Drop length/encoding headers — if we re-stream the body, Next.js will
  // recompute them; keeping the old values makes the client wait for bytes
  // that never match the declared count.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  // For 3xx, send no body so the response closes immediately and the browser
  // follows Location. Previously /api/auth/google hung because the redirect's
  // HTML body stream wasn't flushing cleanly through NextResponse.
  const body =
    upstream.status >= 300 && upstream.status < 400 ? null : upstream.body;

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as DELETE,
  proxy as PATCH,
  proxy as OPTIONS,
  proxy as HEAD,
};
