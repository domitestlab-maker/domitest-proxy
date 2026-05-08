import { supabase } from '../../lib/supabase.js';
import { setCors, handlePreflight } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code required' });

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('code', String(code).toUpperCase())
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Quote not found' });

  return res.status(200).json(data);
}
