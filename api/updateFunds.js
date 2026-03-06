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
    const { clean, dirty } = req.body;

    const { data: funds } = await supabase
      .from("funds")
      .select("*")
      .eq("id", 1)
      .single();

    const newClean = clean;
    const newDirty = dirty;

    await supabase
      .from("funds")
      .update({ clean: newClean, dirty: newDirty })
      .eq("id", 1);

    res.status(200).json({
      clean: newClean,
      dirty: newDirty
    });

  } catch (err) {
    console.error("updateFunds error:", err);
    res.status(500).json({ error: "Failed to update funds" });
  }
};
