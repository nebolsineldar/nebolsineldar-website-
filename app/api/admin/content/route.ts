import { env } from "cloudflare:workers";
import { headers } from "next/headers";

async function authorized() {
  return (await headers()).get("cf-access-authenticated-user-email")?.toLowerCase() === "nebolsineldar@hotmail.com";
}

export async function POST(request: Request) {
  if (!(await authorized())) return new Response("Forbidden", {status:403});
  const db = (env as any).DB;
  const body = await request.json() as any;
  if (body.kind === "setting") {
    await db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(body.key, body.value ?? "").run();
  } else if (body.kind === "delete") {
    await db.prepare("DELETE FROM content_items WHERE id=?").bind(body.id).run();
  } else {
    const x = body.item;
    if (x.id) await db.prepare("UPDATE content_items SET type=?,title=?,subtitle=?,date=?,url=?,image_key=?,language=?,position=? WHERE id=?").bind(x.type,x.title,x.subtitle||"",x.date||"",x.url||"",x.imageKey||"",x.language||"",Number(x.position)||0,x.id).run();
    else await db.prepare("INSERT INTO content_items(type,title,subtitle,date,url,image_key,language,position) VALUES(?,?,?,?,?,?,?,?)").bind(x.type,x.title,x.subtitle||"",x.date||"",x.url||"",x.imageKey||"",x.language||"",Number(x.position)||0).run();
  }
  return Response.json({ok:true});
}
