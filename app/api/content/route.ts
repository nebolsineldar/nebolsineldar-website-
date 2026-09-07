import { env } from "cloudflare:workers";

export async function GET() {
  const db = (env as any).DB;
  const [items, settings] = await Promise.all([
    db.prepare("SELECT * FROM content_items ORDER BY type, position, date DESC").all(),
    db.prepare("SELECT key, value FROM settings").all(),
  ]);
  return Response.json({items: items.results, settings: Object.fromEntries(settings.results.map((x:any)=>[x.key,x.value]))});
}
