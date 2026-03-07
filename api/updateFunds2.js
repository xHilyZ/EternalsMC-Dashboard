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
    const body = req.body;

    // Load current funds
    const { data: funds, error: loadError } = await supabase
      .from("funds")
      .select("*")
      .eq("id", 1)
      .single();

    if (loadError) throw loadError;

    let clean = funds.clean;
    let dirty = funds.dirty;

    // Apply changes based on frontend keys
    if (body.addClean) clean += body.addClean;
    if (body.removeClean) clean -= body.removeClean;

    if (body.addDirty) dirty += body.addDirty;
    if (body.removeDirty) dirty -= body.removeDirty;

    // Update DB
    const { error: updateError } = await supabase
      .from("funds")
      .update({ clean, dirty })
      .eq("id", 1);

    if (updateError) throw updateError;

    res.status(200).json({ clean, dirty });

  } catch (err) {
    console.error("updateFunds error:", err);
    res.status(500).json({ error: "Failed to update funds" });
  }
};
