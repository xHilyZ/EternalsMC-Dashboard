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

    const { data: members, error: loadError } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    if (loadError) throw loadError;

    let updated = [...members];

    if (action === "add") {
      updated.push({
        name,
        rank,
        created_at: new Date().toISOString()
      });
    }

    if (action === "remove") {
      updated.splice(index, 1);
    }

    // Clear table
    const { error: deleteError } = await supabase
      .from("members")
      .delete()
      .neq("id", "");

    if (deleteError) throw deleteError;

    // Insert updated list
    const cleaned = updated.map(m => ({
      name: m.name,
      rank: m.rank,
      created_at: m.created_at
    }));

    const { error: insertError } = await supabase
      .from("members")
      .insert(cleaned);

    if (insertError) throw insertError;

    res.status(200).json({ members: cleaned });

  } catch (err) {
    console.error("updateMembers error:", err);
    res.status(500).json({ error: "Failed to update members" });
  }
};
