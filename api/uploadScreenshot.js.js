import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("screenshot");

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `log_${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("transaction_screenshots")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/transaction_screenshots/${fileName}`;

    const { error: insertError } = await supabase
      .from("screenshot_logs")
      .insert({
        logged_by: "Unknown",
        image_url: publicUrl,
      });

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: insertError.message });
    }

    const { data: logs } = await supabase
      .from("screenshot_logs")
      .select("*")
      .order("created_at", { ascending: false });

    return res.status(200).json({ logs });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
