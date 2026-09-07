import { headers } from "next/headers";
import AdminClient from "./admin-client";
export const dynamic = "force-dynamic";
export default async function AdminPage(){
  const h=await headers();
  const email=h.get("cf-access-authenticated-user-email")?.toLowerCase();
  if(email!=="nebolsineldar@hotmail.com") return <main className="admin-shell"><h1>Private administration</h1><p>This area is restricted to the site owner.</p></main>;
  return <AdminClient/>;
}
