import { env } from "cloudflare:workers";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const email=(await headers()).get("cf-access-authenticated-user-email")?.toLowerCase();
  if (email !== "nebolsineldar@hotmail.com") return new Response("Forbidden", {status:403});
  const form = await request.formData();
  const file = form.get("file") as File;
  if (!file || file.size > 15_000_000) return new Response("Invalid file", {status:400});
  const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
  await (env as any).BUCKET.put(key, file.stream(), {httpMetadata:{contentType:file.type}});
  return Response.json({key,url:`/api/upload/${encodeURIComponent(key)}`});
}
