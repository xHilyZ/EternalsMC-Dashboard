import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Get funds (id = 1)
  const { data: funds, error: fundsError } = await supabase
    .from('Funds')
    .select('*')
    .eq('id', 1)
    .single();

  if (fundsError) return res.status(500).json({ error: fundsError.message });

  // Get members
  const { data: members, error: membersError } = await supabase
    .from('Members')
    .select('*');

  if (membersError) return res.status(500).json({ error: membersError.message });

  res.status(200).json({
    funds: {
      clean: funds.clean,
      dirty: funds.dirty
    },
    members
  });
}
