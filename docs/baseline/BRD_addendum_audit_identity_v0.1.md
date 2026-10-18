# Proposed scoped audit identity exception

**Artifact ID:** BRD-ADDENDUM-AUDIT-01  
**Version/date:** 0.1 Proposed · 16 October 2026  
**Status:** Proposed business-baseline exception; owner-confirmed direction in [ADR-0012](../adr/0012-audit-visibility-and-durable-evidence.md), not an accepted BRD revision.  
**Trace:** BR-10, SC-06, H3; AGENTS §5.  

For a current project member holding scoped audit-read, the audit operation may show in-scope actor, action, restricted document entity ID and time. This is an explicit exception to SC-06's general restriction on metadata the user may not view, limited to the authorised audit surface. Title, content and protected before/after payload stay redacted without separate current document-read authority. Out-of-project events are omitted. Trace-read does not inherit audit identity; source, citation, search and AI access remain separately checked. Unknown/denied direct reads remain generic. Revocation of audit-read ends this entitlement. H3 evaluates disclosure against the operation's current entitlement, including this exception.

Formal owner acceptance of a revised BRD baseline remains a separate step; no application enforcement is claimed.
