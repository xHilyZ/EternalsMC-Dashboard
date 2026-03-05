import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clean, dirty } = req.body;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { error } = await supabase
    .from('eternals_data')
    .update({ clean, dirty })
    .eq('id', 1);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true });
}
