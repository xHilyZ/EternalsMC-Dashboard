// force vercel rebuild
console.log(">>> getData.js LOADED <<<");
import pkg from '@supabase/supabase-js';
const { createClient } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Load funds
    const { data: funds, error: fundsError } = await supabase
      .from("funds")
      .select("*")
      .eq("id", 1)
      .single();

    if (fundsError) throw fundsError;

    // Load members
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: true });

    if (membersError) throw membersError;

    // Load transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (txError) throw txError;

    res.status(200).json({
      funds,
      members,
      transactions
    });

  } catch (err) {
    console.error("getData error:", err);
    res.status(500).json({ error: "Failed to load data" });
  }
}
