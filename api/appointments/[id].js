import { supabase } from '../../lib/supabase.js';
import { setCors, handlePreflight } from '../../lib/cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(res);

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  if (req.method === 'GET') return getAppointment(id, res);
  if (req.method === 'PATCH') return updateAppointment(id, req.body, res);

  return res.status(405).json({ error: 'Method not allowed' });
}

async function getAppointment(id, res) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, quote:quotes(*), auxiliar:auxiliares(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Appointment not found' });
  return res.status(200).json(data);
}

async function updateAppointment(id, body, res) {
  const allowed = ['status', 'auxiliar_id', 'scheduled_date', 'scheduled_time', 'notes'];
  const update = {};
  for (const k of allowed) {
    if (body && body[k] !== undefined) update[k] = body[k];
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  if (update.status === 'assigned' && !update.assigned_at) update.assigned_at = new Date().toISOString();
  if (update.status === 'completed' && !update.completed_at) update.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
