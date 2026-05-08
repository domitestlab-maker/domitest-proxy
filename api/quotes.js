import { supabase } from '../lib/supabase.js';
import { setCors, handlePreflight } from '../lib/cors.js';
import { generateQuoteCode } from '../lib/code.js';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  setCors(res);

  if (req.method === 'POST') {
    return createQuote(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function createQuote(req, res) {
  const {
    patient_name, patient_doc, patient_phone, doctor_name,
    exams, zone_name, zone_price, subtotal_exams, total, needs_fasting
  } = req.body || {};

  if (!Array.isArray(exams) || exams.length === 0) {
    return res.status(400).json({ error: 'exams must be a non-empty array' });
  }

  // Generate a unique code with retry on collision
  let code, attempts = 0;
  while (attempts < 5) {
    code = generateQuoteCode();
    const { data: existing } = await supabase
      .from('quotes').select('id').eq('code', code).maybeSingle();
    if (!existing) break;
    attempts++;
  }

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      code,
      patient_name: patient_name || null,
      patient_doc: patient_doc || null,
      patient_phone: patient_phone || null,
      doctor_name: doctor_name || null,
      exams,
      zone_name: zone_name || null,
      zone_price: zone_price || 0,
      subtotal_exams: subtotal_exams || 0,
      total: total || 0,
      needs_fasting: !!needs_fasting,
      status: 'created'
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
}
