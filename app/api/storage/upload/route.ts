import getSupabase from "../../../../lib/supabaseClient";
import { withApiAuth } from "@/lib/withApiAuth";

export const runtime = "nodejs";

export const POST = withApiAuth(async function POST(req: Request) {
  try {
    console.log('[storage/upload] incoming request', {
      timestamp: new Date().toISOString(),
      url: req.url,
      contentType: req.headers.get('content-type'),
    });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      console.warn('[storage/upload] no file provided in formData');
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    console.log('[storage/upload] file received', {
      name: file.name,
      size: (file as any)?.size ?? null,
      type: (file as any)?.type ?? null,
    });

    const bucket = process.env.NG_APP_SUPABASE_BUCKET || "productos";
    const filename = (form.get("filename") as string) ?? `${Date.now()}_${file.name}`;
    const filePath = `/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, { upsert: true });

    console.log('[storage/upload] supabase response', { data, error: error?.message ?? null });

    if (error) {
      console.error('[storage/upload] upload error', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Obtener la URL pública mediante el SDK en lugar de construirla manualmente.
    // Si por alguna razón no hay publicUrl, conservamos el fallback anterior.
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl ?? `${process.env.NG_APP_SUPABASE_STORAGE_URL?.replace(/\/storage\/v1\/s3$/, "")}/${bucket}/${filePath}`;

    console.log('[storage/upload] uploaded', { path: filePath, publicUrl });

    return new Response(JSON.stringify({ data, path: filePath, url: publicUrl }), { status: 201 });
  } catch (err: any) {
    console.error('[storage/upload] unexpected error', err?.stack ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
});
