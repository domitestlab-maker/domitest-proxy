-- ============================================
-- Domitest — Esquema inicial
-- ============================================

-- ── QUOTES (cotizaciones) ────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  patient_name    TEXT,
  patient_doc     TEXT,
  patient_phone   TEXT,
  doctor_name     TEXT,
  exams           JSONB NOT NULL,
  zone_name       TEXT,
  zone_price      INTEGER DEFAULT 0,
  subtotal_exams  INTEGER DEFAULT 0,
  total           INTEGER DEFAULT 0,
  needs_fasting   BOOLEAN DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'created',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_code ON quotes(code);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);

-- ── AUXILIARES ───────────────────────────────
CREATE TABLE IF NOT EXISTS auxiliares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── APPOINTMENTS (citas) ─────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            UUID REFERENCES quotes(id) ON DELETE SET NULL,

  preferred_dates     DATE[] NOT NULL,
  preferred_slot      TEXT,

  patient_name        TEXT NOT NULL,
  patient_doc         TEXT NOT NULL,
  patient_birthdate   DATE,
  patient_address     TEXT NOT NULL,
  patient_phone1      TEXT NOT NULL,
  patient_phone2      TEXT,
  payment_method      TEXT,

  status              TEXT NOT NULL DEFAULT 'pending',
  auxiliar_id         UUID REFERENCES auxiliares(id),
  scheduled_date      DATE,
  scheduled_time      TIME,
  notes               TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  assigned_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_auxiliar ON appointments(auxiliar_id);
CREATE INDEX IF NOT EXISTS idx_appointments_quote ON appointments(quote_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments(created_at DESC);

-- ── DATOS INICIALES ──────────────────────────
-- Auxiliares (ajustar nombres reales)
INSERT INTO auxiliares (name, phone, active)
VALUES
  ('Auxiliar 1', NULL, true),
  ('Auxiliar 2', NULL, true)
ON CONFLICT DO NOTHING;
