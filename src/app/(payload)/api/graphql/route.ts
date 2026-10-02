/*
 * GraphQL is disabled (docs/cms/03_SECURITY_AND_OPS.md §1). This route answers 404 for every method
 * without loading Payload, so it stays closed even if the catch-all REST route changes.
 */
const notFound = () =>
  new Response(JSON.stringify({ message: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
