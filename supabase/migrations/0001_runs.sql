-- SPEC §10: run metrics only, no visitor text, no raw IPs. Written by the server with the
-- service role key; RLS is on with no policies, so the anon key can neither read nor write.
create table if not exists runs (
  id text primary key,            -- the trace/run id shown in X-ray
  created_at timestamptz default now(),
  mode text,                      -- fit | ask | sandbox
  drill text,                     -- null | kb | rate
  branch text,                    -- link | text
  steps jsonb,                    -- [{tool, status, ms}]
  guard_fired text,
  retries int,
  model text,
  input_tokens int, output_tokens int, cached_tokens int,
  cost_usd numeric(10,5),
  latency_ms int,
  prompt_version text
);
create table if not exists ai_crawls (id bigserial primary key, created_at timestamptz default now(), bot text, path text);

alter table runs enable row level security;
alter table ai_crawls enable row level security;
