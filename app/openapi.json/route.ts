import spec from "@/lib/reference/openapi.public.json";

// The public subset of the API's OpenAPI document (the operations the reference documents),
// written by lib/reference/generate.mjs at build time. Served from a statically generated route
// rather than public/, because the standalone Docker image does not ship public/.
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'inline; filename="ipago-openapi.json"',
    },
  });
}
