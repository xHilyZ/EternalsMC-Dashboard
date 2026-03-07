// force vercel rebuild
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { members } = req.body;

    // Clear table
    const { error: deleteError } = await supabase
      .from("members")
      .delete()
      .neq("id", 0);

    if (deleteError) throw deleteError;

    // Insert new members
    const { error: insertError } = await supabase
      .from("members")
      .insert(members);

    if (insertError) throw insertError;

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("updateMembers error:", err);
    res.status(500).json({ error: "Failed to update members" });
  }
};
