-- Internal prepared-record projection, not an authorization decision or handler.
-- Bind all context values from independently validated server request context:
-- $1 handoff_id, $2 actor_id, $3 project_id, $4 run_id,
-- $5 access_context_ref, $6 session_generation, $7 project_permission_revision.
-- Unknown authority must prevent this query; NULL/mismatched context returns no row.
-- PostgreSQL base64 output wraps lines. Remove only its LF separators so the
-- StoredHandoff transport profile is canonical while decoded bytes stay exact.
SELECT jsonb_build_object(
  'manifest', manifest,
  'manifest_bytes_base64', replace(encode(manifest_bytes, 'base64'), E'\n', ''),
  'manifest_digest', manifest_digest,
  'durable_commit_ref', durable_commit_ref::text
) AS stored_handoff
FROM knowledge.handoff_manifest
WHERE handoff_id = $1::text
  AND actor_id = $2::uuid
  AND project_id = $3::uuid
  AND run_id = $4::uuid
  AND manifest->>'access_context_ref' = $5::text
  AND manifest->>'session_generation' = $6::text
  AND manifest->>'project_permission_revision' = $7::text;
