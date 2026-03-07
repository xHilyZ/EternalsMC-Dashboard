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
    const { action, id, name, role } = req.body;

    // REMOVE MEMBER
    if (action === "remove" && id) {
      await supabase.from("members").delete().eq("id", id);
    }

    // ADD MEMBER
    if (action === "add" && name && role) {
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
