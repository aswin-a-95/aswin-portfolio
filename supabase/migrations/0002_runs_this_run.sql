-- Design update 3 (2026-11-19), SPEC §10: the run log provides every field of X-ray's "This run".
-- Run id, timestamp (created_at), branch, retries, guards, latency, tokens and cost were already here.
alter table runs add column if not exists requirement_count int;   -- requirements jd.parse found
alter table runs add column if not exists sources_retrieved int;   -- entries kb.search returned
alter table runs add column if not exists sources_cited int;       -- distinct sources the matches cite
alter table runs add column if not exists fallback text;           -- null | error | limited | budget
