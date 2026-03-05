import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, name, rank, index } = req.body;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { data, error: fetchError } = await supabase
    .from('eternals_data')
    .select('*')
    .single();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  let members = data.members || [];

  if (action === 'add') {
    members.push({ name, rank });
  }

  if (action === 'remove') {
    members.splice(index, 1);
  }

  const { error: updateError } = await supabase
    .from('eternals_data')
    .update({ members })
    .eq('id', 1);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ members });
}
