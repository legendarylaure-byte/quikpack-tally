export async function GET() {
  return Response.json({
    status: "ok",
    app: "quikpack-tally",
    time: new Date().toISOString(),
  });
}
