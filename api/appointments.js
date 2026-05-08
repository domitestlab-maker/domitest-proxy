import { supabase } from '../lib/supabase.js';
import { setCors, handlePreflight } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(res);

  if (req.method === 'POST') return createAppointment(req, res);
  if (req.method === 'GET') return listAppointments(req, res);

  return res.status(405).json({ error: 'Method not allowed' });
}

async function createAppointment(req, res) {
  const {
    quote_code,
    preferred_dates, preferred_slot,
    patient_name, patient_doc, patient_birthdate, patient_address,
    patient_phone1, patient_phone2, payment_method
  } = req.body || {};

  if (!preferred_dates || !Array.isArray(preferred_dates) || preferred_dates.length === 0) {
    return res.status(400).json({ error: 'preferred_dates required' });
  }
  if (!patient_name || !patient_doc || !patient_address || !patient_phone1) {
    return res.status(400).json({ error: 'Missing required patient fields' });
  }

  let quote_id = null;
  if (quote_code) {
    const { data: q } = await supabase
      .from('quotes').select('id').eq('code', String(quote_code).toUpperCase()).maybeSingle();
    if (q) quote_id = q.id;
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      quote_id,
      preferred_dates,
      preferred_slot: preferred_slot || null,
      patient_name,
      patient_doc,
      patient_birthdate: patient_birthdate || null,
      patient_address,
      patient_phone1,
      patient_phone2: patient_phone2 || null,
      payment_method: payment_method || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (quote_id) {
    await supabase.from('quotes').update({ status: 'agendada' }).eq('id', quote_id);
  }

  return res.status(201).json(data);
}

async function listAppointments(req, res) {
  const { status, auxiliar_id } = req.query;

  let query = supabase
    .from('appointments')
    .select('*, quote:quotes(*), auxiliar:auxiliares(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (auxiliar_id) query = query.eq('auxiliar_id', auxiliar_id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(data || []);
}
