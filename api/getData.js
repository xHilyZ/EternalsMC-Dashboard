const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  try {
    const { data: funds } = await supabase
      .from("funds")
      .select("*")
      .eq("id", 1)
      .single();

    const { data: members } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    res.status(200).json({
      funds,
      members,
      transactions
    });

  } catch (err) {
    console.error("getData error:", err);
    res.status(500).json({ error: "Failed to load data" });
  }
};
