import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, name, rank, index } = req.body;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  if (action === 'add') {
    const { error } = await supabase
      .from('Members')
      .insert([{ name, rank }]);

    if (error) return res.status(500).json({ error: error.message });
  }

  if (action === 'remove') {
    const { data: members } = await supabase
      .from('Members')
      .select('*');

    const member = members[index];

    const { error } = await supabase
      .from('Members')
      .delete()
      .eq('id', member.id);

    if (error) return res.status(500).json({ error: error.message });
  }

  // Return updated list
  const { data: updatedMembers } = await supabase
    .from('Members')
    .select('*');

  res.status(200).json({ members: updatedMembers });
}
