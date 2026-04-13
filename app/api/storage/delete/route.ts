import getSupabase from "../../../../lib/supabaseClient";
import { withApiAuth } from "@/lib/withApiAuth";

export const runtime = "nodejs";

export const DELETE = withApiAuth(async function DELETE(req: Request) {
  try {
    console.log('[storage/delete] incoming request', {
      timestamp: new Date().toISOString(),
      url: req.url,
      contentType: req.headers.get('content-type'),
    });

    const body = await req.json().catch(() => null);
    const path = body?.path ?? new URL(req.url).searchParams.get("path");
    if (!path) {
      console.warn('[storage/delete] missing path in request');
      return new Response(JSON.stringify({ error: "Missing path" }), { status: 400 });
    }

    console.log('[storage/delete] deleting path', { path });

    const bucket = process.env.NG_APP_SUPABASE_BUCKET || "productos";
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    console.log('[storage/delete] supabase response', { data, error: error?.message ?? null });

    if (error) {
      console.error('[storage/delete] remove error', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ data, path }), { status: 200 });
  } catch (err: any) {
    console.error('[storage/delete] unexpected error', err?.stack ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
});
