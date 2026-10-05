/*
# Add metric_value column to inspection_evidence

1. Modified Tables
- `inspection_evidence`
  - Added `metric_value` (numeric, nullable) — stores the recorded metric from the field,
    e.g. the milk fridge temperature in °C at the time the evidence photo was captured.
2. Security
- No RLS changes — existing policies cover the new column.
*/

ALTER TABLE inspection_evidence
ADD COLUMN IF NOT EXISTS metric_value numeric;
