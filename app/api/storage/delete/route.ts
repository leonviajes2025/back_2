import supabase from "../../../../lib/supabaseClient";
import { withApiAuth } from "@/lib/withApiAuth";

export const runtime = "nodejs";

export const DELETE = withApiAuth(async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const path = body?.path ?? new URL(req.url).searchParams.get("path");
    if (!path) return new Response(JSON.stringify({ error: "Missing path" }), { status: 400 });

    const bucket = process.env.NG_APP_SUPABASE_BUCKET || "productos";
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    return new Response(JSON.stringify({ data, path }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
}
