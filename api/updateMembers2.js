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
    const { name, rank, removeId, editId } = req.body;

    // ============================
    // REMOVE MEMBER
    // ============================
    if (removeId) {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", removeId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    // ============================
    // EDIT MEMBER
    // ============================
    if (editId) {
      const { error } = await supabase
        .from("members")
        .update({ name, rank })
        .eq("id", editId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    // ============================
    // ADD MEMBER
    // ============================
    if (name && rank) {
      const { error } = await supabase
        .from("members")
        .insert({
          id: crypto.randomUUID(),
          name,
          rank,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Invalid request" });

  } catch (err) {
    console.error("updateMembers error:", err);
    res.status(500).json({ error: "Failed to update members" });
  }
};
