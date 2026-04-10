import supabase from "../../../../lib/supabaseClient";
import { withApiAuth } from "@/lib/withApiAuth";

export const runtime = "nodejs";

export const POST = withApiAuth(async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });

    const bucket = process.env.NG_APP_SUPABASE_BUCKET || "productos";
    const pathPrefix = process.env.NG_APP_SUPABASE_PRODUCT_IMAGES_PATH || "productos";
    const filename = (form.get("filename") as string) ?? `${Date.now()}_${file.name}`;
    const filePath = `${pathPrefix}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, { upsert: true });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    const publicUrl = `${process.env.NG_APP_SUPABASE_STORAGE_URL?.replace(/\/storage\/v1\/s3$/, "")}/${bucket}/${filePath}`;

    return new Response(JSON.stringify({ data, path: filePath, url: publicUrl }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
}
