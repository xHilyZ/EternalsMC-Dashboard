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
    const { name, role } = req.body;

    // Insert new member (must be array)
    const { error: insertError } = await supabase
      .from("members")
      .insert([{ 
        name, 
        role, 
        created_at: new Date().toISOString() 
      }]);

    if (insertError) throw insertError;

    // Return updated list
    const { data: updated, error: loadError } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    if (loadError) throw loadError;

    res.status(200).json({ members: updated });

  } catch (err) {
    console.error("updateMembers error:", err);
    res.status(500).json({ error: "Failed to update members" });
  }
};
