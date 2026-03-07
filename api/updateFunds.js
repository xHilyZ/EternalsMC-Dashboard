// force vercel rebuild
import pkg from '@supabase/supabase-js';
const { createClient } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { clean, dirty } = req.body;

    const { error } = await supabase
      .from("funds")
      .update({ clean, dirty })
      .eq("id", 1);

    if (error) throw error;

    res.status(200).json({ clean, dirty });

  } catch (err) {
    console.error("updateFunds error:", err);
    res.status(500).json({ error: "Failed to update funds" });
  }
}
