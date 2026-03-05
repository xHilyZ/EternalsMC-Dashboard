import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cleanDelta, dirtyDelta } = req.body;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Get current funds
  const { data: funds, error: fetchError } = await supabase
    .from('Funds')
    .select('*')
    .eq('id', 1)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  const updated = {
    clean: funds.clean + cleanDelta,
    dirty: funds.dirty + dirtyDelta
  };

  // Update
  const { error: updateError } = await supabase
    .from('Funds')
    .update(updated)
    .eq('id', 1);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.status(200).json(updated);
}
