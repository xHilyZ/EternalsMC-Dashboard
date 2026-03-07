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
    const { name, role, removeId } = req.body;

    // REMOVE MEMBER
    if (removeId) {
      await supabase.from("members").delete().eq("id", removeId);
    }

    // ADD MEMBER
    if (name && role && !removeId) {
      await supabase.from("members").insert([
        { name, role, created_at: new Date().toISOString() }
      ]);
    }

    // RETURN UPDATED LIST
    const { data: updated } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    res.status(200).json({ members: updated });

  } catch (err) {
    console.error("updateMembers error:", err);
    res.status(500).json({ error: "Failed to update members" });
  }
};
