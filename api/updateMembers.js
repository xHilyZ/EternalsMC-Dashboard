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
    const { action, name, rank, index } = req.body;

    if (action === "add") {
      await supabase.from("members").insert({
        name,
        rank,
        created_at: new Date().toISOString()
      });
    }

    if (action === "remove") {
      // Get the member to delete
      const { data: members } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: true });

      const memberToDelete = members[index];

      if (memberToDelete) {
        await supabase
          .from("members")
          .delete()
          .eq("id", memberToDelete.id);
      }
    }

    // Return updated list
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
