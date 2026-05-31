// app/api/upload/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Service role key — only safe on the server, never expose to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← in .env.local, never NEXT_PUBLIC_
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const filePath = formData.get("filePath") as string;

  if (!file || !filePath) {
    return NextResponse.json({ error: "Missing file or path" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.storage
    .from("properties")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("properties")
    .getPublicUrl(filePath);

  return NextResponse.json({ publicUrl });
}