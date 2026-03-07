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
    const { clean = 0, dirty = 0 } = req.body;

    const { data: funds, error: loadError } = await supabase
      .from("funds")
      .select("*")
      .eq("id", 1)
      .single();

    if (loadError) throw loadError;

    const newClean = funds.clean + Number(clean);
    const newDirty = funds.dirty + Number(dirty);

    const { error: updateError } = await supabase
      .from("funds")
      .update({ clean: newClean, dirty: newDirty })
      .eq("id", 1);

    if (updateError) throw updateError;

    res.status(200).json({
      clean: newClean,
      dirty: newDirty
    });

  } catch (err) {
    console.error("updateFunds error:", err);
    res.status(500).json({ error: "Failed to update funds" });
  }
};
