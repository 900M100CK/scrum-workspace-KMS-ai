#!/usr/bin/env python3
"""Comprehensive Generator for diagrams-1

Generates 14 native .drawio and companion .mmd diagrams:
1. use-case/use-case-diagram
2. logical-view/service-composition
3. logical-view/application-sitemap
4. logical-view/domain-model
5. process-view/ai-qa-flow
6. process-view/board-flow
7. process-view/docs-flow
8. process-view/permission-read-flow
9. process-view/permission-ai-checkpoints
10. development-view/package-layering
11. physical-view/deployment-topology
12. scenarios-view/core-scenarios-mapping
13. scenarios-view/core-user-journeys
14. sdlc/sdlc-process-flow
Plus diagrams-1/README.md and manifest.json.
"""

import os
import xml.etree.ElementTree as ET
from xml.dom import minidom

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "diagrams-1")

class DrawioDiagram:
    def __init__(self, diagram_id, name, width=2200, height=1400):
        self.diagram_id = diagram_id
        self.name = name
        self.width = width
        self.height = height
        self.cells = []
        self.cell_ids = set(["0", "1"])

    def add_title(self, title_id, title_text, meta_text, x=60, y=20, w=1800, h=60):
        val = f"<b>{title_text}</b><br/><span style='font-size:12px;color:#555;'>{meta_text}</span>"
        style = "text;html=1;whiteSpace=wrap;fontSize=16;fontStyle=0;align=left;verticalAlign=middle;"
        self.add_vertex(title_id, val, style, x, y, w, h)

    def add_vertex(self, cid, val, style, x, y, w, h, parent="1"):
        if cid in self.cell_ids:
            raise ValueError(f"Duplicate cell ID: {cid}")
        self.cell_ids.add(cid)
        cell = ET.Element("mxCell", {
            "id": str(cid),
            "value": val,
            "style": style,
            "vertex": "1",
            "parent": str(parent)
        })
        ET.SubElement(cell, "mxGeometry", {
            "x": str(round(x, 1)),
            "y": str(round(y, 1)),
            "width": str(round(w, 1)),
            "height": str(round(h, 1)),
            "as": "geometry"
        })
        self.cells.append(cell)
        return cell

    def add_edge(self, cid, source, target, val="", style=None, waypoints=None, parent="1",
                 exit_xy=None, entry_xy=None):
        if cid in self.cell_ids:
            raise ValueError(f"Duplicate cell ID: {cid}")
        self.cell_ids.add(cid)
        if style is None:
            style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;labelBackgroundColor=#ffffff;"
        if exit_xy:
            style += f"exitX={exit_xy[0]};exitY={exit_xy[1]};"
        if entry_xy:
            style += f"entryX={entry_xy[0]};entryY={entry_xy[1]};"

        cell = ET.Element("mxCell", {
            "id": str(cid),
            "value": val,
            "style": style,
            "edge": "1",
            "parent": str(parent),
            "source": str(source),
            "target": str(target)
        })
        geo = ET.SubElement(cell, "mxGeometry", {
            "relative": "1",
            "as": "geometry"
        })
        if waypoints:
            arr = ET.SubElement(geo, "Array", {"as": "points"})
            for pt in waypoints:
                ET.SubElement(arr, "mxPoint", {"x": str(round(pt[0], 1)), "y": str(round(pt[1], 1))})
        self.cells.append(cell)
        return cell

    def to_xml(self):
        mxfile = ET.Element("mxfile", {"host": "drawio", "version": "26.0.0"})
        diagram = ET.SubElement(mxfile, "diagram", {"id": self.diagram_id, "name": self.name})
        model = ET.SubElement(diagram, "mxGraphModel", {
            "dx": "1400", "dy": "900", "grid": "1", "gridSize": "10",
            "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1",
            "fold": "1", "page": "0", "pageScale": "1",
            "pageWidth": str(self.width), "pageHeight": str(self.height),
            "math": "0", "shadow": "0"
        })
        root = ET.SubElement(model, "root")
        ET.SubElement(root, "mxCell", {"id": "0"})
        ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})
        for c in self.cells:
            root.append(c)

        xml_str = ET.tostring(mxfile, encoding="utf-8")
        parsed = minidom.parseString(xml_str)
        return parsed.toprettyxml(indent="  ")

    def save(self, rel_path):
        full_path = os.path.join(OUT_DIR, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(self.to_xml())
        print(f"Saved: {full_path}")

def save_mmd(rel_path, content):
    full_path = os.path.join(OUT_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Saved MMD: {full_path}")

# ==============================================================================
# 1. USE CASE DIAGRAM
# ==============================================================================
def build_use_case():
    d = DrawioDiagram("DGM-UC-01", "use-case-diagram", width=2200, height=1300)
    d.add_title("title", "DGM-UC-01 v1.0 | Complete Use Case Model & System Boundary | 16 October 2026",
                "Sources: UC-02 v0.3, PRD-01 v0.5, SAD-03 v0.7; 13 Use Cases, Actor Specialization, Supporting Systems",
                x=60, y=20, w=1800, h=60)

    # System boundary container
    d.add_vertex("Boundary", "System: Scrum Workspace + AI Project KMS",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#4a5568;strokeWidth=1.5;fontStyle=1;fontSize=14;align=center;",
                 x=320, y=100, w=1120, h=920)

    # Primary Actors (Left Column)
    actor_style = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    actor_box_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=11;fontStyle=1;"
    
    d.add_vertex("act_user", "User", actor_style, x=80, y=130, w=40, h=70)
    d.add_vertex("act_member", "Authorised Member", actor_style, x=80, y=250, w=40, h=70)
    d.add_vertex("act_admin", "Project Admin /<br/>Membership Mgr", actor_box_style, x=50, y=380, w=140, h=50)
    d.add_vertex("act_po", "Product Owner", actor_box_style, x=50, y=450, w=140, h=50)
    d.add_vertex("act_sm", "Sprint Manager", actor_box_style, x=50, y=520, w=140, h=50)
    d.add_vertex("act_author", "Content Author", actor_box_style, x=50, y=590, w=140, h=50)
    d.add_vertex("act_access", "Doc Access Mgr", actor_box_style, x=50, y=660, w=140, h=50)
    d.add_vertex("act_life", "Lifecycle Mgr", actor_box_style, x=50, y=730, w=140, h=50)
    d.add_vertex("act_insp", "Audit / Execution<br/>Inspector", actor_box_style, x=50, y=800, w=140, h=50)

    # Actor Specialization Edges
    gen_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=0;strokeColor=#4a5568;"
    d.add_edge("gen_m_u", "act_member", "act_user", "", gen_style)
    d.add_edge("gen_ad_m", "act_admin", "act_member", "", gen_style)
    d.add_edge("gen_po_m", "act_po", "act_member", "", gen_style)
    d.add_edge("gen_sm_m", "act_sm", "act_member", "", gen_style)
    d.add_edge("gen_au_m", "act_author", "act_member", "", gen_style)
    d.add_edge("gen_ac_m", "act_access", "act_member", "", gen_style)
    d.add_edge("gen_li_m", "act_life", "act_member", "", gen_style)
    d.add_edge("gen_in_m", "act_insp", "act_member", "", gen_style)

    # Use Cases (inside boundary)
    uc_style = "ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;strokeWidth=1.5;fontSize=11;fontStyle=1;"
    uc_audit_style = "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;fontSize=11;fontStyle=1;"

    # Column 1: Scrum & Core Work (inside boundary, relative to boundary)
    d.add_vertex("uc01", "UC-01: Establish &amp; end<br/>a session", uc_style, x=40, y=60, w=220, h=60, parent="Boundary")
    d.add_vertex("uc02", "UC-02: Create project &amp;<br/>manage membership", uc_style, x=40, y=150, w=220, h=60, parent="Boundary")
    d.add_vertex("uc03", "UC-03: Create a task in<br/>the project backlog", uc_style, x=40, y=240, w=220, h=60, parent="Boundary")
    d.add_vertex("uc04", "UC-04: Update work state<br/>&amp; record blockers", uc_style, x=40, y=330, w=220, h=60, parent="Boundary")
    d.add_vertex("uc05", "UC-05: Plan, start &amp;<br/>complete a Sprint", uc_style, x=40, y=420, w=220, h=60, parent="Boundary")

    # Column 2: Knowledge & AI Retrieval
    d.add_vertex("uc06", "UC-06: Create restricted doc<br/>&amp; manage access", uc_style, x=380, y=60, w=240, h=60, parent="Boundary")
    d.add_vertex("uc07", "UC-07: Revise &amp; retire<br/>a knowledge version", uc_style, x=380, y=150, w=240, h=60, parent="Boundary")
    d.add_vertex("uc08", "UC-08: Find linked knowledge<br/>without AI (Keyword)", uc_style, x=380, y=240, w=240, h=60, parent="Boundary")
    d.add_vertex("uc09", "UC-09: Answer question with<br/>exact evidence", uc_style, x=380, y=330, w=240, h=60, parent="Boundary")
    d.add_vertex("uc10", "UC-10: Answer current<br/>work-state question", uc_style, x=380, y=420, w=240, h=60, parent="Boundary")

    # Column 3: Governance & AI Fallback
    d.add_vertex("uc12", "UC-12: Continue work<br/>during AI failure", uc_style, x=740, y=150, w=240, h=60, parent="Boundary")
    d.add_vertex("uc13", "UC-13: Inspect scoped audit<br/>&amp; answer evidence", uc_style, x=740, y=270, w=240, h=60, parent="Boundary")
    d.add_vertex("uc11", "UC-11: Capture business audit<br/>&amp; answer provenance", uc_audit_style, x=740, y=420, w=260, h=70, parent="Boundary")

    # Supporting Systems (Right Column)
    sys_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1;fontSize=12;"
    d.add_vertex("sys_id", "Identity Provider /<br/>Session Store", sys_style, x=1500, y=160, w=180, h=60)
    d.add_vertex("sys_ai", "AI Model API<br/>(Generation Relay)", sys_style, x=1500, y=430, w=180, h=60)
    d.add_vertex("sys_embed", "Embedding Service<br/>(pgvector Exact)", sys_style, x=1500, y=520, w=180, h=60)

    # Actor-to-UC connections
    assoc_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=none;strokeColor=#4a5568;strokeWidth=1.2;"
    d.add_edge("e_u_01", "act_user", "uc01", "", assoc_style)
    d.add_edge("e_ad_02", "act_admin", "uc02", "", assoc_style)
    d.add_edge("e_po_03", "act_po", "uc03", "", assoc_style)
    d.add_edge("e_m_04", "act_member", "uc04", "", assoc_style)
    d.add_edge("e_sm_05", "act_sm", "uc05", "", assoc_style)
    d.add_edge("e_au_06", "act_author", "uc06", "", assoc_style)
    d.add_edge("e_ac_06", "act_access", "uc06", "", assoc_style)
    d.add_edge("e_au_07", "act_author", "uc07", "", assoc_style)
    d.add_edge("e_li_07", "act_life", "uc07", "", assoc_style)
    d.add_edge("e_m_08", "act_member", "uc08", "", assoc_style)
    d.add_edge("e_m_09", "act_member", "uc09", "", assoc_style)
    d.add_edge("e_m_10", "act_member", "uc10", "", assoc_style)
    d.add_edge("e_m_12", "act_member", "uc12", "", assoc_style)
    d.add_edge("e_in_13", "act_insp", "uc13", "", assoc_style)

    # UC to Supporting System connections
    d.add_edge("e_01_id", "uc01", "sys_id", "", assoc_style)
    d.add_edge("e_09_ai", "uc09", "sys_ai", "", assoc_style)
    d.add_edge("e_10_ai", "uc10", "sys_ai", "", assoc_style)
    d.add_edge("e_12_ai", "uc12", "sys_ai", "", assoc_style)
    d.add_edge("e_09_em", "uc09", "sys_embed", "", assoc_style)
    d.add_edge("e_12_em", "uc12", "sys_embed", "", assoc_style)

    # <<include>> dependencies to UC-11
    inc_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=open;dashed=1;strokeColor=#b85450;fontSize=10;"
    for u in ["uc02", "uc03", "uc04", "uc05", "uc06", "uc07", "uc09", "uc10", "uc12"]:
        d.add_edge(f"inc_{u}_11", u, "uc11", "<<include>>", inc_style)

    d.save("use-case/use-case-diagram.drawio")

    mmd = """flowchart LR
    subgraph PrimaryActors["Primary Actors"]
        actor_user["User"]
        actor_member["Authorised Member"]
        actor_proj_admin["Project Admin / Membership Manager"]
        actor_po["Product Owner"]
        actor_sprint_mgr["Sprint Manager"]
        actor_author["Content Author"]
        actor_access_mgr["Document Access Manager"]
        actor_lifecycle["Lifecycle Manager"]
        actor_inspector["Audit / Execution Inspector"]
    end

    subgraph Boundary["System: Scrum Workspace + AI Project KMS"]
        uc01(["UC-01: Establish and end a session"])
        uc02(["UC-02: Create project & manage membership"])
        uc03(["UC-03: Create a task in the backlog"])
        uc04(["UC-04: Update work state & blockers"])
        uc05(["UC-05: Plan, start & complete a Sprint"])
        uc06(["UC-06: Create restricted knowledge & manage access"])
        uc07(["UC-07: Revise & retire a knowledge version"])
        uc08(["UC-08: Find linked knowledge without AI"])
        uc09(["UC-09: Answer a question with exact evidence"])
        uc10(["UC-10: Answer a current work-state question"])
        uc11(["UC-11: Capture business audit & answer provenance"]):::audit
        uc12(["UC-12: Continue work during AI failure"])
        uc13(["UC-13: Inspect scoped audit & answer evidence"])

        uc02 -.->|"<<include>>"| uc11
        uc03 -.->|"<<include>>"| uc11
        uc04 -.->|"<<include>>"| uc11
        uc05 -.->|"<<include>>"| uc11
        uc06 -.->|"<<include>>"| uc11
        uc07 -.->|"<<include>>"| uc11
        uc08 -.->|"<<include>>"| uc11
        uc09 -.->|"<<include>>"| uc11
        uc10 -.->|"<<include>>"| uc11
        uc12 -.->|"<<include>>"| uc11
    end

    subgraph SupportingSystems["Supporting Systems"]
        actor_identity["Identity Provider"]
        actor_ai["AI Model API (Generation)"]
        actor_embed["Embedding Service (pgvector)"]
    end

    actor_member -->|specializes| actor_user
    actor_proj_admin -->|specializes| actor_member
    actor_po -->|specializes| actor_member
    actor_sprint_mgr -->|specializes| actor_member
    actor_author -->|specializes| actor_member
    actor_access_mgr -->|specializes| actor_member
    actor_lifecycle -->|specializes| actor_member
    actor_inspector -->|specializes| actor_member

    actor_user --- uc01
    actor_proj_admin --- uc02
    actor_po --- uc03
    actor_member --- uc04
    actor_sprint_mgr --- uc05
    actor_author --- uc06
    actor_access_mgr --- uc06
    actor_author --- uc07
    actor_lifecycle --- uc07
    actor_member --- uc08
    actor_member --- uc09
    actor_member --- uc10
    actor_member --- uc12
    actor_inspector --- uc13

    uc01 --- actor_identity
    uc09 --- actor_ai
    uc10 --- actor_ai
    uc12 --- actor_ai
    uc09 --- actor_embed
    uc12 --- actor_embed

    classDef audit fill:#f8cecc,stroke:#b85450,stroke-width:2px;
"""
    save_mmd("use-case/use-case-diagram.mmd", mmd)

# ==============================================================================
# 2. LOGICAL VIEW - SERVICE COMPOSITION
# ==============================================================================
def build_service_composition():
    d = DrawioDiagram("DGM-ARCH-01", "service-composition", width=2200, height=1300)
    d.add_title("title", "DGM-ARCH-01 v1.0 | Logical View: Minimal Microservices & Component Decomposition",
                "Sources: SAD-03 §2, ADR-0002, ADR-0004, ADR-0006; Minimal Microservices, Zero Cross-DB Writes, Trust Boundaries",
                x=60, y=20, w=1800, h=60)

    # Client Web UI
    d.add_vertex("web_ui", "<b>Web UI Client</b><br/>(Presentation / Backlog &amp; Board / Docs Browser / AI Modal)",
                 "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=13;",
                 x=650, y=100, w=500, h=70)

    # Workspace Service
    d.add_vertex("svc_workspace", "<b>Workspace Service (Port 8000)</b><br/>Identity, Permission Authority, Scrum Domain, Guarded Relay",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#6c8ebf;strokeWidth=1.5;fontStyle=1;fontSize=13;align=center;",
                 x=200, y=220, w=640, h=480)

    box_w_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    d.add_vertex("ws_gateway", "Gateway &amp; Auth<br/>- Session Validation &amp; CSRF<br/>- Route Dispatch &amp; Rate Limit", box_w_style, x=30, y=50, w=260, h=70, parent="svc_workspace")
    d.add_vertex("ws_policy", "Authoritative Policy<br/>- Project &amp; Document ACLs<br/>- Member Invalidation &amp; Revocation", box_w_style, x=340, y=50, w=260, h=70, parent="svc_workspace")
    d.add_vertex("ws_scrum", "Scrum Work Domain<br/>- Backlog, Sprint, Task States<br/>- Blocker Event Tracking &amp; Optimistic Lock", box_w_style, x=30, y=150, w=260, h=70, parent="svc_workspace")
    d.add_vertex("ws_relay", "Guarded Provider Relay<br/>- ADR-0006 Transport Mutex<br/>- Evidence Manifest &amp; Whole-Draft Withholding", box_w_style, x=340, y=150, w=260, h=70, parent="svc_workspace")
    
    # Workspace DB
    db_style = "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;fontStyle=1;"
    d.add_vertex("ws_db", "<b>Workspace Database</b> (PostgreSQL 17)<br/>- sessions, users, members, document_acls<br/>- sprints, tasks, blocker_events, audit_events",
                 db_style, x=140, y=260, w=360, h=100, parent="svc_workspace")

    # Knowledge Service
    d.add_vertex("svc_knowledge", "<b>Knowledge Service (Port 8001 Loopback)</b><br/>Immutable Sources, Vector/Keyword Search, Evidence Resolution",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#82b366;strokeWidth=1.5;fontStyle=1;fontSize=13;align=center;",
                 x=960, y=220, w=640, h=480)

    box_k_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;fontStyle=1;"
    d.add_vertex("kn_doc", "Document &amp; Passage Store<br/>- Documents &amp; Immutable Versions<br/>- Chunking &amp; Lifecycle (Current/Superseded)", box_k_style, x=30, y=50, w=260, h=70, parent="svc_knowledge")
    d.add_vertex("kn_search", "Independent Keyword and Semantic Paths<br/>- PostgreSQL English FTS and pgvector exact<br/>- Scope Pre-filtering &amp; Lifecycle Filter", box_k_style, x=340, y=50, w=260, h=70, parent="svc_knowledge")
    d.add_vertex("kn_evidence", "Evidence &amp; Citation Engine<br/>- Claim Support &amp; Exact Locators<br/>- Insufficient Evidence Determination", box_k_style, x=30, y=150, w=260, h=70, parent="svc_knowledge")
    d.add_vertex("kn_audit", "Provenance &amp; Audit Logger<br/>- Run Manifests &amp; Model Metadata<br/>- Knowledge Provenance Audit Trail", box_k_style, x=340, y=150, w=260, h=70, parent="svc_knowledge")

    # Knowledge DB
    d.add_vertex("kn_db", "<b>Knowledge Database</b> (PostgreSQL 17 + pgvector)<br/>- documents, versions, passages, embeddings<br/>- keyword_index, knowledge_audit, provenance",
                 db_style, x=140, y=260, w=360, h=100, parent="svc_knowledge")

    # External Provider
    ext_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;"
    d.add_vertex("ext_provider", "<b>External AI Provider</b><br/>(Cloud LLM / Local Ollama / Embeddings)",
                 ext_style, x=380, y=750, w=280, h=80)

    # Trust Boundaries Legend
    legend_style = "shape=note;whiteSpace=wrap;html=1;size=14;verticalAlign=top;align=left;spacing=8;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;"
    legend_text = ("<b>Trust Boundaries &amp; Security Invariants (SAD-03 §5)</b><br/>"
                   "• <b>TB1 (Browser → Gateway):</b> HTTPS, same-origin (Port 8000), opaque session cookie + CSRF token.<br/>"
                   "• <b>TB2 (Gateway → Knowledge):</b> Internal HTTP (Port 8001), shared secret service key + actor session header.<br/>"
                   "• <b>TB3 (Services → Database):</b> Local socket/TCP, dedicated users (workspace_user, knowledge_user). Zero cross-DB writes!<br/>"
                   "• <b>TB4 (Workspace Relay → AI Provider):</b> Outbound HTTPS, ADR-0006 guarded relay, whole-draft buffered verification.")
    d.add_vertex("legend_tb", legend_text, legend_style, x=960, y=740, w=640, h=100)

    # Edges
    edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;labelBackgroundColor=#ffffff;"
    
    # UI -> Workspace
    d.add_edge("e_ui_ws", "web_ui", "ws_gateway", "TB1: HTTPS / Opaque Session", edge_style,
               exit_xy=(0.25, 1), entry_xy=(0.5, 0))
    # Workspace internal DB write
    d.add_edge("e_ws_db", "ws_scrum", "ws_db", "TB3: Own DB Writes", edge_style,
               exit_xy=(0.5, 1), entry_xy=(0.25, 0))
    # Workspace -> Knowledge (Internal HTTP)
    d.add_edge("e_ws_kn", "ws_gateway", "kn_doc", "TB2: Internal HTTP (Key + Actor)", edge_style,
               exit_xy=(1, 0.5), entry_xy=(0, 0.5))
    # Knowledge -> Workspace (Internal policy callback)
    d.add_edge("e_kn_ws", "kn_search", "ws_policy", "Policy Check (evaluateAccess)", edge_style,
               exit_xy=(0, 0.5), entry_xy=(1, 0.5))
    # Knowledge internal DB write
    d.add_edge("e_kn_db", "kn_doc", "kn_db", "TB3: Own DB Writes", edge_style,
               exit_xy=(0.5, 1), entry_xy=(0.25, 0))
    # Workspace Relay -> External Provider
    d.add_edge("e_ws_ext", "ws_relay", "ext_provider", "TB4: Guarded Outbound HTTPS", edge_style,
               exit_xy=(0.5, 1), entry_xy=(0.5, 0))

    d.save("logical-view/service-composition.drawio")

    mmd = """flowchart TD
    subgraph Client["Presentation Layer"]
        UI["Web UI Client (Port 8000 Same-Origin)"]
    end

    subgraph WorkspaceService["Workspace Service (Port 8000)"]
        WS_GW["Gateway & Session Auth"]
        WS_POL["Authoritative Permission Policy"]
        WS_SCRUM["Scrum Work Domain"]
        WS_RELAY["Guarded Provider Relay (ADR-0006)"]
        WS_DB[("Workspace DB (PostgreSQL 17)")]
    end

    subgraph KnowledgeService["Knowledge Service (Port 8001 Loopback)"]
        KN_DOC["Document & Passage Store"]
        KN_SEARCH["Independent PostgreSQL English FTS and pgvector exact"]
        KN_EVID["Evidence & Citation Engine"]
        KN_AUDIT["Provenance & Audit Logger"]
        KN_DB[("Knowledge DB (PostgreSQL 17)")]
    end

    subgraph ExternalProvider["External Infrastructure"]
        AI_PROV["AI Provider (Generation & Embeddings)"]
    end

    UI -->|"TB1: HTTPS / Opaque Session + CSRF"| WS_GW
    WS_GW --> WS_SCRUM
    WS_GW --> WS_POL
    WS_SCRUM -->|"TB3: Own DB Writes"| WS_DB
    WS_POL -->|"TB3: Own DB Writes"| WS_DB

    WS_GW -->|"TB2: Internal HTTP (Service Key + Actor)"| KN_DOC
    WS_GW -->|"TB2: Internal HTTP (Scope Query)"| KN_SEARCH
    KN_SEARCH -.->|"Policy Callback (evaluateAccess)"| WS_POL

    KN_DOC -->|"TB3: Own DB Writes"| KN_DB
    KN_SEARCH -->|"TB3: Own DB Reads"| KN_DB
    KN_EVID --> KN_AUDIT
    KN_AUDIT -->|"TB3: Own DB Writes"| KN_DB

    WS_RELAY -->|"TB4: Guarded Outbound HTTPS"| AI_PROV
"""
    save_mmd("logical-view/service-composition.mmd", mmd)

# ==============================================================================
# 3. LOGICAL VIEW - APPLICATION SITEMAP
# ==============================================================================
def build_application_sitemap():
    d = DrawioDiagram("DGM-SITE-01", "application-sitemap", width=2200, height=1300)
    d.add_title("title", "DGM-SITE-01 v1.0 | Logical View: Application Sitemap & Navigation Hierarchy",
                "Sources: UX-SITEMAP-03 v0.4, SAD-03 §2.1; Screen Structure, Navigation Flow, Generic 404 Invariant",
                x=60, y=20, w=1800, h=60)

    node_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;"
    sub_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8f9fa;strokeColor=#b0bec5;fontSize=11;"
    err_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;fontStyle=1;"

    # Root
    d.add_vertex("s_login", "Sign-in / Auth Screen<br/><code>/login</code> (UC-01)", node_style, x=800, y=100, w=220, h=60)
    d.add_vertex("s_hub", "Project Hub Dashboard<br/><code>/projects/{projectId}</code> (UC-02)", node_style, x=800, y=200, w=220, h=60)

    # Level 2 Primary Sections
    d.add_vertex("s_board", "Scrum Board<br/><code>/board</code> (UC-04, UC-05)", node_style, x=150, y=320, w=220, h=60)
    d.add_vertex("s_backlog", "Project Backlog<br/><code>/backlog</code> (UC-03)", node_style, x=450, y=320, w=220, h=60)
    d.add_vertex("s_docs", "Knowledge Center<br/><code>/docs</code> (UC-06, UC-08)", node_style, x=800, y=320, w=220, h=60)
    d.add_vertex("s_ai", "AI Q&amp;A Workspace<br/><code>/ai-qa</code> (UC-09, UC-10)", node_style, x=1150, y=320, w=220, h=60)
    d.add_vertex("s_audit", "Audit &amp; Trace View<br/><code>/audit</code> (UC-13)", node_style, x=1450, y=320, w=220, h=60)

    # Level 3 Detail Views & Modals
    d.add_vertex("sub_board", "• 3 Core Columns (To Do, In Progress, Done)<br/>• Blocker Management Dialog<br/>• Filters: All / Blocked / My Tasks", sub_style, x=150, y=430, w=220, h=80)
    d.add_vertex("sub_backlog", "• Task Creation &amp; Prioritization<br/>• Sprint Planning Drawer<br/>• Link Documents &amp; Decisions", sub_style, x=450, y=430, w=220, h=80)
    d.add_vertex("sub_docs", "• Document Browser &amp; Category Filter<br/>• Markdown Viewer &amp; Editor Modal<br/>• Revisions Badge: Current vs History<br/>• Manage Access Panel (Shared vs Grant)", sub_style, x=790, y=430, w=240, h=100)
    d.add_vertex("sub_ai", "• Question Submission &amp; Scope Input<br/>• Buffered Synthesized Answer<br/>• Citation Inspector Drawer<br/>• Insufficient Evidence Banner", sub_style, x=1150, y=430, w=220, h=100)
    d.add_vertex("sub_audit", "• Scoped Business Mutation Log<br/>• AI Run Manifest &amp; Provenance<br/>• AI Outage / Fallback Indicator", sub_style, x=1450, y=430, w=220, h=80)

    # Generic 404 (Security Invariant)
    d.add_vertex("s_404", "Generic 404 Not Found Page<br/><code>/404</code> (Resource Unavailable - Denied or Missing)", err_style, x=800, y=600, w=240, h=60)

    # Edges
    edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_log_hub", "s_login", "s_hub", "Authenticated Session", edge_style)
    d.add_edge("e_hub_board", "s_hub", "s_board", "", edge_style)
    d.add_edge("e_hub_backlog", "s_hub", "s_backlog", "", edge_style)
    d.add_edge("e_hub_docs", "s_hub", "s_docs", "", edge_style)
    d.add_edge("e_hub_ai", "s_hub", "s_ai", "", edge_style)
    d.add_edge("e_hub_audit", "s_hub", "s_audit", "", edge_style)

    # Sub links
    d.add_edge("e_b_sub", "s_board", "sub_board", "", edge_style)
    d.add_edge("e_bl_sub", "s_backlog", "sub_backlog", "", edge_style)
    d.add_edge("e_d_sub", "s_docs", "sub_docs", "", edge_style)
    d.add_edge("e_ai_sub", "s_ai", "sub_ai", "", edge_style)
    d.add_edge("e_au_sub", "s_audit", "sub_audit", "", edge_style)

    # 404 security edge
    dash_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;dashed=1;strokeColor=#b85450;fontSize=10;"
    d.add_edge("e_docs_404", "s_docs", "s_404", "Denied / Missing", dash_style)

    d.save("logical-view/application-sitemap.drawio")

    mmd = """flowchart TD
    Login["Sign-in Screen (/login)"] -->|Authenticated Session| Hub["Project Hub (/projects/{id})"]
    
    Hub --> Board["Scrum Board (/board)"]
    Hub --> Backlog["Project Backlog (/backlog)"]
    Hub --> Docs["Knowledge Center (/docs)"]
    Hub --> AI["AI Q&A Modal (/ai-qa)"]
    Hub --> Audit["Audit & Trace Log (/audit)"]

    Board --> BoardDetail["To Do / In Progress / Done<br/>Blockers Dialog & Filters"]
    Backlog --> BacklogDetail["Task Creation & Sprints<br/>Link Decisions & Specs"]
    Docs --> DocsDetail["Doc Browser & Markdown Viewer<br/>Current vs History Badge<br/>Manage Access Panel"]
    AI --> AIDetail["Question & Buffered Answer<br/>Citation Inspector<br/>Insufficient Evidence Banner"]
    Audit --> AuditDetail["Mutation Audit Records<br/>AI Provenance & Manifests"]

    Docs -.->|Denied Access / Missing ID| NotFound["Generic 404 (Resource Unavailable)"]:::error

    classDef error fill:#f8cecc,stroke:#b85450,stroke-width:1.5px;
"""
    save_mmd("logical-view/application-sitemap.mmd", mmd)

# ==============================================================================
# 4. LOGICAL VIEW - DOMAIN MODEL
# ==============================================================================
def build_domain_model():
    d = DrawioDiagram("DGM-DOMAIN-01", "domain-model", width=2200, height=1300)
    d.add_title("title", "DGM-DOMAIN-01 v1.0 | Logical View: Domain Entity Model & Bounded Contexts",
                "Sources: contracts/data-model.json, SAD-03 §2.2; Two Bounded Contexts, Isolated Storage, Soft References",
                x=60, y=20, w=1800, h=60)

    # Workspace Context
    d.add_vertex("ctx_ws", "<b>Workspace Bounded Context</b> (Owned by Workspace Service)",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#6c8ebf;strokeWidth=1.5;fontStyle=1;fontSize=13;",
                 x=150, y=100, w=720, h=820)

    entity_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#6c8ebf;fontSize=11;align=left;spacing=6;"
    
    d.add_vertex("ent_user", "<b>User</b><br/>+ user_id: UUID [PK]<br/>+ email: String<br/>+ display_name: String<br/>+ created_at: Timestamp", entity_style, x=30, y=50, w=200, h=80, parent="ctx_ws")
    d.add_vertex("ent_session", "<b>Session</b><br/>+ session_token: String [PK]<br/>+ user_id: UUID [FK]<br/>+ expires_at: Timestamp<br/>+ csrf_token: String", entity_style, x=270, y=50, w=200, h=80, parent="ctx_ws")
    d.add_vertex("ent_project", "<b>Project</b><br/>+ project_id: UUID [PK]<br/>+ name: String<br/>+ key: String<br/>+ owner_id: UUID [FK]", entity_style, x=30, y=170, w=200, h=80, parent="ctx_ws")
    d.add_vertex("ent_member", "<b>ProjectMember</b><br/>+ project_id: UUID [PK, FK]<br/>+ user_id: UUID [PK, FK]<br/>+ role: String<br/>+ joined_at: Timestamp", entity_style, x=270, y=170, w=200, h=80, parent="ctx_ws")
    
    d.add_vertex("ent_task", "<b>Task</b><br/>+ task_id: UUID [PK]<br/>+ project_id: UUID [FK]<br/>+ sprint_id: UUID [FK, Nullable]<br/>+ title: String<br/>+ state: Enum(ToDo, InProgress, Done)<br/>+ version: Integer [Optimistic Lock]", entity_style, x=30, y=300, w=240, h=110, parent="ctx_ws")
    d.add_vertex("ent_sprint", "<b>Sprint</b><br/>+ sprint_id: UUID [PK]<br/>+ project_id: UUID [FK]<br/>+ name: String<br/>+ status: Enum(Planned, Active, Done)<br/>+ start_date / end_date: Date", entity_style, x=310, y=300, w=240, h=100, parent="ctx_ws")
    d.add_vertex("ent_blocker", "<b>BlockerEvent</b><br/>+ blocker_id: UUID [PK]<br/>+ task_id: UUID [FK]<br/>+ reason: String<br/>+ raised_by: UUID [FK]<br/>+ resolved_at: Timestamp", entity_style, x=30, y=440, w=240, h=90, parent="ctx_ws")
    d.add_vertex("ent_acl", "<b>DocumentAclPolicy</b><br/>+ document_id: UUID [PK]<br/>+ project_id: UUID [FK]<br/>+ classification: Enum(Shared, Restricted)<br/>+ explicit_grants: UserID[]<br/>+ acl_version: Integer", entity_style, x=310, y=440, w=260, h=100, parent="ctx_ws")
    d.add_vertex("ent_w_audit", "<b>WorkspaceAuditEvent</b><br/>+ event_id: UUID [PK]<br/>+ actor_id: UUID<br/>+ action: String<br/>+ entity_type: String<br/>+ entity_id: UUID<br/>+ timestamp: Timestamp", entity_style, x=30, y=570, w=240, h=100, parent="ctx_ws")

    # Knowledge Context
    d.add_vertex("ctx_kn", "<b>Knowledge Bounded Context</b> (Owned by Knowledge Service)",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#82b366;strokeWidth=1.5;fontStyle=1;fontSize=13;",
                 x=980, y=100, w=720, h=820)

    entity_k_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#82b366;fontSize=11;align=left;spacing=6;"
    
    d.add_vertex("ent_doc", "<b>Document</b><br/>+ document_id: UUID [PK]<br/>+ project_id: UUID [Soft Ref]<br/>+ title: String<br/>+ current_version_id: UUID [FK]<br/>+ lifecycle_status: String", entity_k_style, x=30, y=50, w=240, h=90, parent="ctx_kn")
    d.add_vertex("ent_version", "<b>DocumentVersion</b><br/>+ version_id: UUID [PK]<br/>+ document_id: UUID [FK]<br/>+ version_number: Integer<br/>+ lifecycle_state: Enum(Current, Superseded, Archived)<br/>+ checksum: String", entity_k_style, x=310, y=50, w=260, h=100, parent="ctx_kn")
    d.add_vertex("ent_passage", "<b>DocumentPassage</b><br/>+ passage_id: UUID [PK]<br/>+ version_id: UUID [FK]<br/>+ sequence_idx: Integer<br/>+ text_content: Text<br/>+ token_count: Integer", entity_k_style, x=30, y=180, w=240, h=90, parent="ctx_kn")
    d.add_vertex("ent_embed", "<b>VectorEmbedding</b><br/>+ embedding_id: UUID [PK]<br/>+ passage_id: UUID [FK]<br/>+ embedding: vector (configuration-defined dimensions)<br/>+ model_name: String", entity_k_style, x=310, y=180, w=240, h=80, parent="ctx_kn")
    
    d.add_vertex("ent_manifest", "<b>EvidenceManifest</b><br/>+ manifest_id: UUID [PK]<br/>+ run_id: UUID<br/>+ passages: Tuple[doc_id, ver_id, pass_id][]<br/>+ generated_at: Timestamp", entity_k_style, x=30, y=300, w=260, h=90, parent="ctx_kn")
    d.add_vertex("ent_citation", "<b>Citation</b><br/>+ citation_id: UUID [PK]<br/>+ run_id: UUID<br/>+ document_id / version_id / passage_id: UUID<br/>+ display_label: String ([SRC-x])", entity_k_style, x=320, y=300, w=260, h=90, parent="ctx_kn")
    d.add_vertex("ent_k_audit", "<b>KnowledgeAuditEvent</b><br/>+ audit_id: UUID [PK]<br/>+ run_id: UUID<br/>+ actor_context: JSONB<br/>+ provenance_details: JSONB<br/>+ timestamp: Timestamp", entity_k_style, x=30, y=430, w=260, h=100, parent="ctx_kn")

    # Cross-boundary relation (Soft Ref)
    cross_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=open;dashed=1;strokeColor=#e65100;strokeWidth=1.5;fontSize=11;labelBackgroundColor=#ffffff;"
    d.add_edge("ref_acl_doc", "ent_acl", "ent_doc", "Soft Reference: document_id", cross_style,
               exit_xy=(1, 0.5), entry_xy=(0, 0.5))

    d.save("logical-view/domain-model.drawio")

    mmd = """classDiagram
    namespace WorkspaceContext {
        class User {
            +UUID user_id
            +String email
            +String display_name
            +Timestamp created_at
        }
        class Session {
            +String session_token
            +UUID user_id
            +Timestamp expires_at
            +String csrf_token
        }
        class Project {
            +UUID project_id
            +String name
            +String key
            +UUID owner_id
        }
        class ProjectMember {
            +UUID project_id
            +UUID user_id
            +String role
        }
        class Task {
            +UUID task_id
            +UUID project_id
            +UUID sprint_id
            +String state
            +Integer version
        }
        class Sprint {
            +UUID sprint_id
            +UUID project_id
            +String name
            +String status
        }
        class BlockerEvent {
            +UUID blocker_id
            +UUID task_id
            +String reason
        }
        class DocumentAclPolicy {
            +UUID document_id
            +UUID project_id
            +Enum classification
            +UUID[] explicit_grants
        }
    }

    namespace KnowledgeContext {
        class Document {
            +UUID document_id
            +UUID project_id
            +String title
            +UUID current_version_id
        }
        class DocumentVersion {
            +UUID version_id
            +UUID document_id
            +Integer version_number
            +Enum lifecycle_state
        }
        class DocumentPassage {
            +UUID passage_id
            +UUID version_id
            +Integer sequence_idx
            +Text text_content
        }
        class VectorEmbedding {
            +UUID embedding_id
            +UUID passage_id
            +vector embedding
        }
        class EvidenceManifest {
            +UUID manifest_id
            +UUID run_id
            +Tuple[] passages
        }
        class Citation {
            +UUID citation_id
            +UUID run_id
            +String display_label
        }
    }

    User "1" --> "*" Session
    Project "1" --> "*" ProjectMember
    Project "1" --> "*" Task
    Sprint "1" --> "*" Task
    Task "1" --> "*" BlockerEvent

    Document "1" --> "*" DocumentVersion
    DocumentVersion "1" --> "*" DocumentPassage
    DocumentPassage "1" --> "1" VectorEmbedding
    EvidenceManifest "1" --> "*" Citation

    DocumentAclPolicy ..> Document : "Soft Reference (document_id)"
"""
    save_mmd("logical-view/domain-model.mmd", mmd)

# ==============================================================================
# 5. PROCESS VIEW - AI Q&A FLOW
# ==============================================================================
def build_ai_qa_flow():
    d = DrawioDiagram("DGM-FLOW-01", "ai-qa-flow", width=2200, height=1400)
    d.add_title("title", "DGM-FLOW-01 v1.0 | Process View: AI Q&A Runtime Flow & Guarded Mutex Handoff",
                "Sources: SAD-03 §3.1, §3.2 (Flow 4, Flow 5), ADR-0006, ADR-0013, ADR-0015; 4 Checkpoints, Whole-Draft Withholding",
                x=60, y=20, w=1800, h=60)

    step_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    check_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;"
    dec_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;fontStyle=1;"
    term_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;"

    # Pipeline Steps
    d.add_vertex("f_start", "1. User submits question via Web UI<br/>(Opaque Session Cookie + Project ID)", step_style, x=100, y=100, w=260, h=60)
    d.add_vertex("f_gw_auth", "2. Workspace Gateway validates session<br/>&amp; resolves authorized Project/Doc Scope", step_style, x=100, y=200, w=260, h=60)
    
    # Checkpoint 1
    d.add_vertex("f_cp1", "<b>Checkpoint 1: Retrieval Pre-filtering</b><br/>Knowledge executes SQL: injects authorized<br/><code>project_id</code> &amp; <code>doc_id</code>; filters <code>Current</code> versions", check_style, x=100, y=300, w=260, h=80)
    d.add_vertex("f_has_ev", "Any eligible<br/>evidence found?", dec_style, x=140, y=420, w=180, h=80)
    
    # Branch No -> Insufficient
    d.add_vertex("f_insufficient", "<b>Return Insufficient Evidence</b><br/>Zero external LLM calls; no hints<br/>about hidden/restricted sources (SC-07)", term_style, x=420, y=420, w=240, h=80)

    # Branch Yes -> Package & Mutex
    d.add_vertex("f_pkg", "3. Package Evidence Manifest with stable<br/><code>[SRC-x]</code> tags + query live task state", step_style, x=100, y=550, w=260, h=60)
    
    # Checkpoint 2
    d.add_vertex("f_cp2", "<b>Checkpoint 2: Provider Handoff Guard</b><br/>Acquire ADR-0006 Mutex; re-verify session &amp;<br/>access; persist run manifest; hold mutex", check_style, x=100, y=650, w=260, h=80)
    
    # Generation (Wait Outside Mutex)
    d.add_vertex("f_gen", "4. Model Generation (Wait OUTSIDE Mutex)<br/>Relay to External LLM; buffer complete response;<br/><b>Streaming to client strictly prohibited!</b>", step_style, x=100, y=770, w=260, h=70)
    
    # Validation & Checkpoint 3
    d.add_vertex("f_val_claims", "5. Validate exact server citations <code>[SRC-x]</code><br/>Invented citation invalidates entire draft", step_style, x=100, y=880, w=260, h=60)
    
    d.add_vertex("f_cp3", "<b>Checkpoint 3: Whole-Evidence Re-check</b><br/>Re-acquire Mutex; re-verify ENTIRE evidence set<br/>(including uncited context) against current ACL", check_style, x=100, y=980, w=260, h=80)
    d.add_vertex("f_is_safe", "Any source revoked<br/>or modified?", dec_style, x=140, y=1100, w=180, h=80)

    # Branch Revoked -> Withhold
    d.add_vertex("f_withhold", "<b>Withhold Entire Draft Answer</b><br/>Generic <code>answer_withheld</code> response;<br/>no partial content or citations revealed (SC-06)", term_style, x=420, y=1100, w=240, h=80)

    # Branch Safe -> Deliver
    d.add_vertex("f_deliver", "6. Deliver buffered synthesized answer with<br/>clickable citations to user under Mutex lock", step_style, x=100, y=1230, w=260, h=60)

    # Checkpoint 4 (Citation Click)
    d.add_vertex("f_click", "7. User clicks citation locator<br/><code>[doc_id, version_id, passage_id]</code>", step_style, x=500, y=1230, w=240, h=60)
    d.add_vertex("f_cp4", "<b>Checkpoint 4: Citation Passage Resolution</b><br/>Workspace re-evaluates current read grant;<br/>Knowledge returns exact immutable passage (404 on deny)", check_style, x=800, y=1230, w=280, h=80)

    # Outage Fallback Branch
    d.add_vertex("f_outage", "<b>AI Outage / Timeout (FR-69)</b><br/>Return explicit failure; keyword search<br/>&amp; scrum board remain 100% operational", term_style, x=420, y=770, w=240, h=70)

    # Edges
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_s_auth", "f_start", "f_gw_auth", "", e_style)
    d.add_edge("e_a_cp1", "f_gw_auth", "f_cp1", "", e_style)
    d.add_edge("e_cp1_ev", "f_cp1", "f_has_ev", "", e_style)
    d.add_edge("e_ev_no", "f_has_ev", "f_insufficient", "No", e_style)
    d.add_edge("e_ev_yes", "f_has_ev", "f_pkg", "Yes", e_style)
    d.add_edge("e_pkg_cp2", "f_pkg", "f_cp2", "", e_style)
    d.add_edge("e_cp2_gen", "f_cp2", "f_gen", "Release Mutex", e_style)
    d.add_edge("e_gen_out", "f_gen", "f_outage", "Timeout / Error", e_style)
    d.add_edge("e_gen_val", "f_gen", "f_val_claims", "Buffered Response", e_style)
    d.add_edge("e_val_cp3", "f_val_claims", "f_cp3", "", e_style)
    d.add_edge("e_cp3_safe", "f_cp3", "f_is_safe", "", e_style)
    d.add_edge("e_safe_yes", "f_is_safe", "f_withhold", "Revoked", e_style)
    d.add_edge("e_safe_no", "f_is_safe", "f_deliver", "All Safe", e_style)
    d.add_edge("e_del_click", "f_deliver", "f_click", "", e_style)
    d.add_edge("e_click_cp4", "f_click", "f_cp4", "", e_style)

    d.save("process-view/ai-qa-flow.drawio")

    mmd = """flowchart TD
    Start["User submits question via Web UI"] --> GW["Gateway checks session & resolves authorized scope"]
    GW --> CP1["Checkpoint 1: Pre-filtered exact semantic retrieval (Current-only)"]
    CP1 --> CheckEv{"Eligible evidence found?"}
    
    CheckEv -->|No| Insufficient["Return Insufficient Evidence (Zero LLM call)"]
    CheckEv -->|Yes| Package["Package Evidence Manifest & live task observations"]
    
    Package --> CP2["Checkpoint 2: Acquire ADR-0006 Mutex & hold through handoff"]
    CP2 --> Gen["Wait outside Mutex: LLM Generation (Buffer full answer)"]
    Gen -->|Timeout/Failure| Outage["Return explicit AI failure (FR-69)<br/>Keyword search remains operational"]
    
    Gen --> Val["Validate citations cite only [SRC-x] locators"]
    Val --> CP3["Checkpoint 3: Re-acquire Mutex & verify ENTIRE evidence set"]
    CP3 --> CheckSafe{"Any source revoked?"}
    
    CheckSafe -->|Yes| Withhold["Withhold entire draft answer (SC-06)"]
    CheckSafe -->|No| Deliver["Deliver answer with clickable citations under Mutex"]
    
    Deliver --> Click["User clicks citation locator"]
    Click --> CP4["Checkpoint 4: Re-evaluate read grant; return exact immutable passage"]

    classDef cp fill:#f8cecc,stroke:#b85450,stroke-width:2px;
    class CP1,CP2,CP3,CP4 cp;
"""
    save_mmd("process-view/ai-qa-flow.mmd", mmd)

# ==============================================================================
# 6. PROCESS VIEW - BOARD FLOW
# ==============================================================================
def build_board_flow():
    d = DrawioDiagram("DGM-FLOW-02", "board-flow", width=2200, height=1300)
    d.add_title("title", "DGM-FLOW-02 v1.0 | Process View: Scrum Board Mutations & Optimistic Concurrency",
                "Sources: SAD-03 §3.2 (Flow 1), PRD-01 (FR-07..FR-09, SC-01); Optimistic Lock, Blocker Events, Transaction Isolation",
                x=60, y=20, w=1800, h=60)

    step_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    dec_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;fontStyle=1;"
    term_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;"

    d.add_vertex("b_action", "1. User drags task card or updates blocker<br/>(Sends mutation request with expected_version)", step_style, x=150, y=100, w=280, h=60)
    d.add_vertex("b_auth", "2. Workspace validates session &amp; Scrum capability<br/>(Membership alone does not authorize mutations)", step_style, x=150, y=200, w=280, h=60)
    
    d.add_vertex("b_check_ver", "Does expected_version<br/>match current DB version?", dec_style, x=180, y=300, w=220, h=80)
    
    # Conflict branch
    d.add_vertex("b_409", "<b>409 Conflict Response</b><br/>Reject stale write; prompt user to refresh<br/>board representation without overwriting", term_style, x=500, y=300, w=260, h=80)

    # Success branch
    d.add_vertex("b_tx", "3. Begin Workspace DB Transaction:<br/>• Update task status (To Do / In Progress / Done)<br/>• Advance entity version number (version + 1)", step_style, x=150, y=430, w=280, h=70)
    d.add_vertex("b_blocker", "4. If blocker added/cleared:<br/>• Insert append-only BlockerEvent record<br/>• Update active blocker pointer", step_style, x=150, y=540, w=280, h=70)
    d.add_vertex("b_audit", "5. Persist durable WorkspaceAuditEvent in same TX<br/>(Commit Transaction atomically)", step_style, x=150, y=650, w=280, h=60)
    d.add_vertex("b_resp", "6. Return 200 OK with updated Task representation<br/>UI renders new board state optimistically confirmed", step_style, x=150, y=750, w=280, h=60)

    # Edges
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_b1", "b_action", "b_auth", "", e_style)
    d.add_edge("e_b2", "b_auth", "b_check_ver", "", e_style)
    d.add_edge("e_b_conf", "b_check_ver", "b_409", "Mismatch", e_style)
    d.add_edge("e_b_match", "b_check_ver", "b_tx", "Match", e_style)
    d.add_edge("e_b3", "b_tx", "b_blocker", "", e_style)
    d.add_edge("e_b4", "b_blocker", "b_audit", "", e_style)
    d.add_edge("e_b5", "b_audit", "b_resp", "", e_style)

    d.save("process-view/board-flow.drawio")

    mmd = """flowchart TD
    Action["User moves card / updates blocker (with expected_version)"] --> Auth["Gateway checks session & Scrum capability"]
    Auth --> VerCheck{"expected_version == DB version?"}
    
    VerCheck -->|No| Conflict["Return 409 Conflict (Stale write rejected)"]
    VerCheck -->|Yes| TX["Begin DB Transaction:<br/>Update Task state & version + 1"]
    
    TX --> Blocker["If blocker changed: Insert BlockerEvent"]
    Blocker --> Audit["Persist WorkspaceAuditEvent in same TX & Commit"]
    Audit --> Success["Return 200 OK with updated Task state"]
"""
    save_mmd("process-view/board-flow.mmd", mmd)

# ==============================================================================
# 7. PROCESS VIEW - DOCS FLOW
# ==============================================================================
def build_docs_flow():
    d = DrawioDiagram("DGM-FLOW-03", "docs-flow", width=2200, height=1300)
    d.add_title("title", "DGM-FLOW-03 v1.0 | Process View: Knowledge Ingestion & Lifecycle State Machine",
                "Sources: SAD-03 §3.2 (Flow 2), ADR-0007..ADR-0011; Immediate Current, Version Replacement, Draft Exclusion",
                x=60, y=20, w=1800, h=60)

    step_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    k_step_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;fontStyle=1;"
    term_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;"

    # Creation Flow
    d.add_vertex("d_create_start", "1. Author submits Create Document<br/>(Markdown payload, Title, Classification)", step_style, x=150, y=100, w=280, h=60)
    d.add_vertex("d_create_ws", "2. Workspace registers document_id atomically:<br/>• Commits ACL policy (Restricted author grant)<br/>• Records idempotency receipt", step_style, x=150, y=200, w=280, h=70)
    d.add_vertex("d_create_kn", "3. Knowledge persists initial Current version:<br/>• Splits text into passages<br/>• Computes pgvector embeddings &amp; trgm index", k_step_style, x=150, y=310, w=280, h=70)
    d.add_vertex("d_create_ready", "4. Document available immediately as <b>Current</b><br/>(No unindexed Draft state in retrieval!)", term_style, x=150, y=420, w=280, h=60)

    # Revision Flow
    d.add_vertex("d_rev_start", "5. Author submits Revision for doc_id<br/>(New content, expected_version_id)", step_style, x=550, y=100, w=280, h=60)
    d.add_vertex("d_rev_guard", "6. Workspace acquires Lifecycle Guard:<br/>• Verifies author edit capability<br/>• Forwards write to Knowledge", step_style, x=550, y=200, w=280, h=70)
    d.add_vertex("d_rev_kn", "7. Knowledge atomic version transition:<br/>• Marks old version as <b>Superseded</b><br/>• Inserts new version as <b>Current</b><br/>• Updates passages &amp; search index", k_step_style, x=550, y=310, w=280, h=80)
    d.add_vertex("d_rev_done", "8. Ordinary retrieval queries use new Current;<br/>Historical queries explicitly labelled (SC-05)", term_style, x=550, y=430, w=280, h=60)

    # Archival & Deletion
    d.add_vertex("d_arch_start", "9. Lifecycle Manager Archives doc_id", step_style, x=950, y=100, w=260, h=60)
    d.add_vertex("d_arch_kn", "10. Transition status to <b>Archived</b><br/>• Excluded from default retrieval<br/>• Readable only via historical citation audit", k_step_style, x=950, y=200, w=260, h=70)
    d.add_vertex("d_del_start", "11. Deletion / Tombstone<br/>Protected boundary stops reads immediately;<br/>Tombstone prevents stale job revival", term_style, x=950, y=310, w=260, h=70)

    # Edges
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_d1", "d_create_start", "d_create_ws", "", e_style)
    d.add_edge("e_d2", "d_create_ws", "d_create_kn", "PUT /internal/documents/{id}", e_style)
    d.add_edge("e_d3", "d_create_kn", "d_create_ready", "", e_style)

    d.add_edge("e_d4", "d_rev_start", "d_rev_guard", "", e_style)
    d.add_edge("e_d5", "d_rev_guard", "d_rev_kn", "POST /internal/documents/{id}/versions", e_style)
    d.add_edge("e_d6", "d_rev_kn", "d_rev_done", "", e_style)

    d.add_edge("e_d7", "d_arch_start", "d_arch_kn", "", e_style)
    d.add_edge("e_d8", "d_arch_kn", "d_del_start", "Upon Deletion", e_style)

    d.save("process-view/docs-flow.drawio")

    mmd = """flowchart TD
    subgraph CreationFlow["Document Creation Flow"]
        C1["Author submits Markdown content"] --> C2["Workspace allocates ID & commits initial ACL"]
        C2 --> C3["Knowledge persists initial Current version & passages"]
        C3 --> C4["Immediately available as Current (No Draft bypass)"]
    end

    subgraph RevisionFlow["Atomic Revision Flow"]
        R1["Author submits Revision"] --> R2["Workspace acquires Lifecycle Guard"]
        R2 --> R3["Knowledge: Supersede previous version & insert new Current"]
        R3 --> R4["Default search queries new Current; History explicitly labelled"]
    end

    subgraph LifecycleFlow["Archival & Deletion"]
        L1["Manager requests Archival"] --> L2["State becomes Archived (Excluded from default search)"]
        L2 --> L3["Deletion: Tombstone recorded, fail-closed access"]
    end
"""
    save_mmd("process-view/docs-flow.mmd", mmd)

# ==============================================================================
# 8. PROCESS VIEW - PERMISSION READ FLOW
# ==============================================================================
def build_permission_read_flow():
    d = DrawioDiagram("DGM-FLOW-04", "permission-read-flow", width=2200, height=1300)
    d.add_title("title", "DGM-FLOW-04 v1.0 | Process View: Dual-Scope Permission Evaluation & Generic 404",
                "Sources: SAD-03 §3.1, UX-PERM-MATRIX-02 v0.4, ADR-0001, ADR-0007; Project AND Document Scope, Non-Disclosure Invariant",
                x=60, y=20, w=1800, h=60)

    step_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    dec_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;fontStyle=1;"
    term_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;"
    err_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;"

    d.add_vertex("p_req", "1. Incoming Request with Opaque Session Cookie<br/>Target: <code>/projects/{proj_id}/docs/{doc_id}</code>", step_style, x=150, y=100, w=300, h=60)
    d.add_vertex("p_sess", "Valid, non-expired<br/>session token?", dec_style, x=200, y=200, w=200, h=80)
    
    # 401
    d.add_vertex("p_401", "<b>401 Unauthorized</b><br/>Session expired or missing", err_style, x=520, y=200, w=200, h=80)

    # Project Scope Check
    d.add_vertex("p_proj", "Requester is active member<br/>of target Project?", dec_style, x=200, y=320, w=200, h=80)
    
    # Generic 404
    d.add_vertex("p_404", "<b>Generic 404 Not Found</b><br/><code>{ 'code': 'not_found', 'message': 'Resource unavailable' }</code><br/>Identical response for denied and non-existent targets (SC-06)", err_style, x=520, y=320, w=320, h=80)

    # Doc Classification Check
    d.add_vertex("p_class", "Document Classification<br/>in DocumentAclPolicy?", dec_style, x=190, y=450, w=220, h=90)

    # Project Shared Branch
    d.add_vertex("p_shared_grant", "<b>Project-Shared Document</b><br/>Access granted to all project members", step_style, x=100, y=600, w=220, h=60)

    # Restricted Branch
    d.add_vertex("p_restr_check", "User holds active explicit<br/>DocumentGrant record?", dec_style, x=380, y=600, w=220, h=80)

    d.add_vertex("p_grant_ok", "<b>Explicit Grant Valid</b><br/>Access granted to restricted document", step_style, x=380, y=740, w=220, h=60)

    # Deliver content
    d.add_vertex("p_deliver", "Fetch and return exact Document content / version<br/>(Knowledge enforces lifecycle filter Current / History)", term_style, x=240, y=860, w=300, h=60)

    # Edges
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_p1", "p_req", "p_sess", "", e_style)
    d.add_edge("e_p_s_no", "p_sess", "p_401", "No", e_style)
    d.add_edge("e_p_s_yes", "p_sess", "p_proj", "Yes", e_style)
    d.add_edge("e_p_pr_no", "p_proj", "p_404", "No", e_style)
    d.add_edge("e_p_pr_yes", "p_proj", "p_class", "Yes", e_style)
    d.add_edge("e_p_cl_sh", "p_class", "p_shared_grant", "Project-Shared", e_style)
    d.add_edge("e_p_cl_res", "p_class", "p_restr_check", "Restricted", e_style)
    d.add_edge("e_p_res_no", "p_restr_check", "p_404", "No Grant", e_style)
    d.add_edge("e_p_res_yes", "p_restr_check", "p_grant_ok", "Grant Active", e_style)
    d.add_edge("e_p_d1", "p_shared_grant", "p_deliver", "", e_style)
    d.add_edge("e_p_d2", "p_grant_ok", "p_deliver", "", e_style)

    d.save("process-view/permission-read-flow.drawio")

    mmd = """flowchart TD
    Req["Request for /projects/{pId}/docs/{dId}"] --> SessCheck{"Valid Session Token?"}
    SessCheck -->|No| R401["401 Unauthorized"]
    SessCheck -->|Yes| ProjCheck{"Active Project Member?"}
    
    ProjCheck -->|No| R404["Generic 404 (Resource unavailable)"]
    ProjCheck -->|Yes| ClassCheck{"Document Classification?"}
    
    ClassCheck -->|Project-Shared| GrantShared["Access Granted"]
    ClassCheck -->|Restricted| GrantCheck{"Explicit Document Grant exists?"}
    
    GrantCheck -->|No| R404
    GrantCheck -->|Yes| GrantRestricted["Access Granted"]
    
    GrantShared --> Deliver["Return Document Content"]
    GrantRestricted --> Deliver

    classDef denied fill:#f8cecc,stroke:#b85450,stroke-width:1.5px;
    class R401,R404 denied;
"""
    save_mmd("process-view/permission-read-flow.mmd", mmd)

# ==============================================================================
# 9. PROCESS VIEW - PERMISSION AI CHECKPOINTS
# ==============================================================================
def build_permission_ai_checkpoints():
    d = DrawioDiagram("DGM-FLOW-05", "permission-ai-checkpoints", width=2200, height=1300)
    d.add_title("title", "DGM-FLOW-05 v1.0 | Process View: Four AI Permission Checkpoints & Security Gates",
                "Sources: SAD-03 §3.1, §3.2 (Flow 4), ADR-0006; Exact Gate Definitions, Failure Behavior, Fallback Limits",
                x=60, y=20, w=1800, h=60)

    gate_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=1.5;fontSize=12;fontStyle=1;"
    desc_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b0bec5;fontSize=11;align=left;spacing=6;"

    # Gate 1
    d.add_vertex("cp1_box", "Checkpoint 1: Retrieval Scope Pre-filtering<br/>(Knowledge Service / SQL Query Boundary)", gate_style, x=150, y=100, w=380, h=60)
    d.add_vertex("cp1_desc", "• <b>When:</b> During keyword (PostgreSQL English FTS) and vector (pgvector) candidate search.<br/>• <b>Enforcement:</b> SQL query injects <code>project_id IN (...)</code> AND <code>document_id IN (...)</code>.<br/>• <b>Lifecycle:</b> Strictly excludes Non-Current (Superseded, Archived) and Draft.<br/>• <b>Failure / Empty:</b> Returns Insufficient Evidence (Zero LLM call).", desc_style, x=150, y=170, w=380, h=100)

    # Gate 2
    d.add_vertex("cp2_box", "Checkpoint 2: Provider Handoff Guard<br/>(Workspace Service / External Provider Boundary)", gate_style, x=600, y=100, w=380, h=60)
    d.add_vertex("cp2_desc", "• <b>When:</b> Immediately prior to submitting payload to External AI Provider.<br/>• <b>Enforcement:</b> Workspace acquires ADR-0006 Mutex; re-verifies session &amp; ACL.<br/>• <b>Evidence Stamp:</b> Binds run_id to stable Evidence Manifest <code>[SRC-x]</code>.<br/>• <b>Failure:</b> If revoked prior to send, aborts handoff; fails closed.", desc_style, x=600, y=170, w=380, h=100)

    # Gate 3
    d.add_vertex("cp3_box", "Checkpoint 3: Whole-Evidence Delivery Re-check<br/>(Workspace Service / Client Delivery Boundary)", gate_style, x=1050, y=100, w=380, h=60)
    d.add_vertex("cp3_desc", "• <b>When:</b> After receiving buffered LLM response, prior to client response.<br/>• <b>Enforcement:</b> Re-acquires Mutex; re-checks <b>EVERY</b> evidence item (including uncited context).<br/>• <b>Revocation Action:</b> <b>WITHHOLD ENTIRE DRAFT</b> (FR-29). No partial delivery!<br/>• <b>Invariant:</b> Uncited context influenced model generation, so it must be valid.", desc_style, x=1050, y=170, w=380, h=100)

    # Gate 4
    d.add_vertex("cp4_box", "Checkpoint 4: Citation Passage Inspection<br/>(Knowledge Service / Passage Read Boundary)", gate_style, x=1500, y=100, w=380, h=60)
    d.add_vertex("cp4_desc", "• <b>When:</b> User clicks citation tag <code>[doc_id, version_id, passage_id]</code>.<br/>• <b>Enforcement:</b> Workspace re-evaluates current read grant (returns generic 404 on deny).<br/>• <b>Resolution:</b> Knowledge returns exact immutable text passage; labels version state.<br/>• <b>Unavailability:</b> Returns 200 Unavailable if document deleted, without substitution.", desc_style, x=1500, y=170, w=380, h=100)

    # Pipeline connector
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_cp1_2", "cp1_box", "cp2_box", "Evidence Manifest", e_style)
    d.add_edge("e_cp2_3", "cp2_box", "cp3_box", "Buffered Generation", e_style)
    d.add_edge("e_cp3_4", "cp3_box", "cp4_box", "Citations Delivered", e_style)

    d.save("process-view/permission-ai-checkpoints.drawio")

    mmd = """flowchart LR
    CP1["<b>Checkpoint 1: Pre-filtering</b><br/>SQL Query filters by authorized IDs<br/>Current versions only"]
    CP2["<b>Checkpoint 2: Handoff Guard</b><br/>ADR-0006 Mutex holds through send<br/>Persist complete immutable manifest before guard; then exact validation through send"]
    CP3["<b>Checkpoint 3: Whole-Evidence Re-check</b><br/>Re-verify ALL retrieved sources<br/>Withhold entire draft if revoked"]
    CP4["<b>Checkpoint 4: Citation Inspection</b><br/>Re-evaluate read grant<br/>Generic 404 on deny"]

    CP1 -->|"Evidence Manifest"| CP2
    CP2 -->|"Buffered Generation"| CP3
    CP3 -->|"Delivered Answer"| CP4

    classDef cp fill:#f8cecc,stroke:#b85450,stroke-width:1.5px;
    class CP1,CP2,CP3,CP4 cp;
"""
    save_mmd("process-view/permission-ai-checkpoints.mmd", mmd)

# ==============================================================================
# 10. DEVELOPMENT VIEW - PACKAGE LAYERING
# ==============================================================================
def build_development_view():
    d = DrawioDiagram("DGM-DEV-01", "package-layering", width=2200, height=1300)
    d.add_title("title", "DGM-DEV-01 v1.0 | Development View: Monorepo Structure & Layering Invariants",
                "Sources: SAD-03 §4, AGENTS.md; Module Layering, Zero Cross-DB Writes, Dependency-Free Harness",
                x=60, y=20, w=1800, h=60)

    pkg_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;align=left;spacing=8;"
    contract_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;align=left;spacing=8;"
    test_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;align=left;spacing=8;"

    d.add_vertex("pkg_web", "<b>apps/web/</b><br/>• User-facing React + Vite candidate (unselected) frontend<br/>• UI components, forms, client routing<br/>• Displays citations &amp; failure banners", pkg_style, x=150, y=100, w=320, h=90)
    
    d.add_vertex("pkg_contracts", "<b>contracts/</b> (Shared Interfaces)<br/>• <code>openapi/workspace.openapi.json</code> (OpenAPI 3.1.1)<br/>• <code>openapi/knowledge.openapi.json</code> (OpenAPI 3.1.1)<br/>• <code>data-model.json</code> (Logical Data Schemas)", contract_style, x=550, y=100, w=360, h=90)

    d.add_vertex("pkg_ws", "<b>services/workspace/</b> (Node.js 24+)<br/>• <code>src/auth/</code>: Session &amp; CSRF management<br/>• <code>src/scrum/</code>: Backlog, Sprint, Task, Blocker<br/>• <code>src/policy/</code>: Authoritative ACL Registry<br/>• <code>src/relay/</code>: ADR-0006 Provider Relay Mutex", pkg_style, x=150, y=240, w=340, h=120)

    d.add_vertex("pkg_kn", "<b>services/knowledge/</b> (Node.js 24+)<br/>• <code>src/documents/</code>: Versions, passages, lifecycle<br/>• <code>src/retrieval/</code>: Independent English FTS and pgvector exact<br/>• <code>src/synthesis/</code>: Evidence check &amp; citation engine<br/>• <code>src/audit/</code>: Provenance &amp; knowledge audit", pkg_style, x=550, y=240, w=340, h=120)

    d.add_vertex("pkg_infra", "<b>infra/postgres/</b> (PostgreSQL 17.10 + pgvector)<br/>• <code>init/</code>: Separate database initialization<br/>• <code>migrations/</code>: Isolated DDL per service<br/>• Runbook &amp; test harness", test_style, x=950, y=240, w=320, h=120)

    d.add_vertex("pkg_specs", "<b>specs/</b> (Bounded Implementation Slices)<br/>• SP-01 to SP-13: Explicit scopes &amp; allowed paths<br/>• Trace to FR/BR/AC; planned unit/contract tests", contract_style, x=150, y=410, w=340, h=90)

    d.add_vertex("pkg_eval", "<b>eval/</b> (Evaluation Fixtures)<br/>• 25 synthetic reference questions<br/>• Claim-support rubric &amp; pilot test cases", test_style, x=550, y=410, w=340, h=90)

    d.add_vertex("pkg_harness", "<b>scripts/ &amp; tests/</b> (Context Harness)<br/>• <code>npm run context:lint</code>: Syntax check<br/>• <code>npm run context:check</code>: Contract shape check<br/>• <code>npm run context:test</code>: Harness unit tests", test_style, x=950, y=410, w=320, h=90)

    # Invariants Note
    inv_style = "shape=note;whiteSpace=wrap;html=1;size=14;verticalAlign=top;align=left;spacing=8;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;"
    inv_text = ("<b>Layering Invariants (SAD-03 §4.2):</b><br/>"
                "1. <b>Domain Independence:</b> Business domain logic has ZERO dependencies on UI or provider SDKs.<br/>"
                "2. <b>Zero Shared DB Writes:</b> No shared library executes database writes. DB access is private to each service.<br/>"
                "3. <b>One-Way Dependency Flow:</b> UI → Gateway contracts → Service contracts → Domain.")
    d.add_vertex("inv_note", inv_text, inv_style, x=150, y=540, w=740, h=100)

    # Edges
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;"
    d.add_edge("e_w_c", "pkg_web", "pkg_contracts", "Depends on", e_style)
    d.add_edge("e_ws_c", "pkg_ws", "pkg_contracts", "Implements", e_style)
    d.add_edge("e_kn_c", "pkg_kn", "pkg_contracts", "Implements", e_style)
    d.add_edge("e_ws_db", "pkg_ws", "pkg_infra", "Owns workspace_db", e_style)
    d.add_edge("e_kn_db", "pkg_kn", "pkg_infra", "Owns knowledge_db", e_style)

    d.save("development-view/package-layering.drawio")

    mmd = """flowchart TD
    subgraph Frontend["Apps"]
        Web["apps/web (React + Vite candidate (unselected) UI)"]
    end

    subgraph Contracts["Contracts Layer"]
        OpenAPI["contracts/openapi (OpenAPI 3.1.1)"]
        DataModel["contracts/data-model.json"]
    end

    subgraph Services["Services Layer (Node.js 24+)"]
        Workspace["services/workspace (Auth, Scrum, Policy, Relay)"]
        Knowledge["services/knowledge (Docs, Retrieval, Synthesis, Audit)"]
    end

    subgraph Storage["Infrastructure Layer"]
        Postgres["infra/postgres (PostgreSQL 17 + pgvector)"]
    end

    subgraph Harness["Governance & Evaluation"]
        Specs["specs/ (SP-01 to SP-13)"]
        Eval["eval/ (25 Reference Questions)"]
        Scripts["scripts/ & tests/ (Context Harness)"]
    end

    Web --> OpenAPI
    Workspace --> OpenAPI
    Knowledge --> OpenAPI
    Workspace --> Postgres
    Knowledge --> Postgres
    Specs --> Workspace
    Specs --> Knowledge
    Eval --> Knowledge
"""
    save_mmd("development-view/package-layering.mmd", mmd)

# ==============================================================================
# 11. PHYSICAL VIEW - DEPLOYMENT TOPOLOGY
# ==============================================================================
def build_deployment_topology():
    d = DrawioDiagram("DGM-PHYS-01", "deployment-topology", width=2200, height=1300)
    d.add_title("title", "DGM-PHYS-01 v1.0 | Physical View: Deployment Topology & Network Trust Boundaries",
                "Sources: SAD-03 §5; Single Developer Workstation, Isolated Databases, Local Ports, 4 Trust Boundaries",
                x=60, y=20, w=1800, h=60)

    # Host Node Container
    d.add_vertex("host_node", "<b>Host Environment: Developer Workstation (Single Node)</b><br/>Node.js 24+ LTS, Linux/macOS/Windows, candidate 4 CPU cores / 8 GB RAM",
                 "swimlane;startSize=30;fillColor=#f8f9fa;strokeColor=#4a5568;strokeWidth=1.5;fontStyle=1;fontSize=13;",
                 x=150, y=100, w=1300, h=780)

    proc_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;align=center;"
    db_style = "shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;"
    ext_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;"

    # Client Browser
    d.add_vertex("node_browser", "<b>Web Browser (Client)</b><br/>https://localhost:8000<br/>Same-Origin Presentation", proc_style, x=50, y=60, w=260, h=80, parent="host_node")
    
    # Workspace Process
    d.add_vertex("node_ws", "<b>Workspace Service Process</b><br/>Port 8000 (HTTP/HTTPS Gateway)<br/>Gateway, Scrum Domain, Auth Policy, Relay", proc_style, x=450, y=60, w=320, h=90, parent="host_node")

    # Knowledge Process
    d.add_vertex("node_kn", "<b>Knowledge Service Process</b><br/>Port 8001 (Internal Loopback Only)<br/>Document Store, Independent keyword / semantic search, Citations", proc_style, x=900, y=60, w=320, h=90, parent="host_node")

    # PostgreSQL Instance
    d.add_vertex("node_pg", "<b>PostgreSQL 17.10 Instance (Port 5432)</b><br/>pgvector 0.8.2, dedicated UNIX socket / TCP loopback",
                 "swimlane;startSize=26;fillColor=#e8f5e9;strokeColor=#82b366;fontStyle=1;fontSize=12;",
                 x=450, y=250, w=770, h=220, parent="host_node")

    d.add_vertex("db_ws", "<b>workspace_db (DB)</b><br/>Owner: workspace_user<br/>Sessions, members, Scrum, ACLs", db_style, x=40, y=50, w=320, h=120, parent="node_pg")
    d.add_vertex("db_kn", "<b>knowledge_db (DB)</b><br/>Owner: knowledge_user<br/>Docs, passages, embeddings, audit", db_style, x=410, y=50, w=320, h=120, parent="node_pg")

    # External Provider Node
    d.add_vertex("node_ext", "<b>External AI Provider</b><br/>Cloud Model API (HTTPS outbound) or<br/>Local Inference (Ollama/LM Studio on loopback)", ext_style, x=450, y=560, w=340, h=80, parent="host_node")

    # Edges with TB labels
    edge_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;fontSize=11;labelBackgroundColor=#ffffff;"
    
    d.add_edge("e_tb1", "node_browser", "node_ws", "TB1: HTTPS / Same-Origin / Port 8000", edge_style)
    d.add_edge("e_tb2", "node_ws", "node_kn", "TB2: Loopback Port 8001 (Key + Session)", edge_style)
    d.add_edge("e_tb3_ws", "node_ws", "db_ws", "TB3: Port 5432 (workspace_user)", edge_style)
    d.add_edge("e_tb3_kn", "node_kn", "db_kn", "TB3: Port 5432 (knowledge_user)", edge_style)
    d.add_edge("e_tb4", "node_ws", "node_ext", "TB4: Guarded Outbound HTTPS", edge_style)

    d.save("physical-view/deployment-topology.drawio")

    mmd = """flowchart TD
    subgraph Host["Developer Workstation (Single Node)"]
        Browser["Web Browser (https://localhost:8000)"]
        WS["Workspace Process (Port 8000)"]
        KN["Knowledge Process (Loopback Port 8001)"]
        
        subgraph Postgres["PostgreSQL 17.10 (Port 5432)"]
            WS_DB[("workspace_db<br/>(workspace_user)")]
            KN_DB[("knowledge_db<br/>(knowledge_user)")]
        end

        ExtAI["External AI Provider (Outbound HTTPS / Ollama)"]
    end

    Browser -->|"TB1: HTTPS Same-Origin (Opaque Session)"| WS
    WS -->|"TB2: Loopback HTTP (Service Key + Actor)"| KN
    WS -->|"TB3: TCP/Socket (workspace_user)"| WS_DB
    KN -->|"TB3: TCP/Socket (knowledge_user)"| KN_DB
    WS -->|"TB4: Guarded Outbound HTTPS"| ExtAI
"""
    save_mmd("physical-view/deployment-topology.mmd", mmd)

# ==============================================================================
# 12. SCENARIOS VIEW - CORE SCENARIOS MAPPING
# ==============================================================================
def build_scenarios_mapping():
    d = DrawioDiagram("DGM-SCEN-01", "core-scenarios-mapping", width=2200, height=1300)
    d.add_title("title", "DGM-SCEN-01 v1.0 | +1 Scenarios View: Core Architectural Scenarios (SC-01..SC-08) Cross-View Mapping",
                "Sources: SAD-03 §6, PRD-01 §3; Kruchten 4+1 Synthesis, Cross-View Validation, Trace Matrix",
                x=60, y=20, w=1800, h=60)

    hub_style = "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;fontSize=14;fontStyle=1;"
    view_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;"
    sc_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b0bec5;fontSize=11;align=left;spacing=6;"

    # Center +1 Hub
    d.add_vertex("hub_plus1", "<b>+1 View</b><br/>Scenarios Hub<br/>(SC-01 to SC-08)", hub_style, x=650, y=300, w=160, h=100)

    # 4 Surrounding Views
    d.add_vertex("v_logical", "<b>Logical View</b><br/>Service &amp; Domain Boundaries<br/>(DGM-ARCH-01, DGM-SITE-01)", view_style, x=630, y=120, w=200, h=70)
    d.add_vertex("v_process", "<b>Process View</b><br/>Concurrency &amp; Mutex Flows<br/>(DGM-FLOW-01..05)", view_style, x=950, y=315, w=200, h=70)
    d.add_vertex("v_dev", "<b>Development View</b><br/>Module Layering &amp; Packages<br/>(DGM-DEV-01)", view_style, x=310, y=315, w=200, h=70)
    d.add_vertex("v_phys", "<b>Physical View</b><br/>Deployment &amp; Trust Boundaries<br/>(DGM-PHYS-01)", view_style, x=630, y=510, w=200, h=70)

    # Hub connects to 4 views
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;"
    d.add_edge("e_h_l", "hub_plus1", "v_logical", "", e_style)
    d.add_edge("e_h_p", "hub_plus1", "v_process", "", e_style)
    d.add_edge("e_h_d", "hub_plus1", "v_dev", "", e_style)
    d.add_edge("e_h_ph", "hub_plus1", "v_phys", "", e_style)

    # 8 Scenarios Cards (Left & Right columns)
    d.add_vertex("sc01", "<b>SC-01: Task-linked doc access</b><br/>• Logical: Task references Document<br/>• Process: Exact passage read (Flow 5)<br/>• FRs: FR-16, FR-17, FR-46, FR-59", sc_style, x=50, y=100, w=220, h=80)
    d.add_vertex("sc02", "<b>SC-02: Cited decision rationale</b><br/>• Logical: Independent keyword / semantic search + citations<br/>• Process: Flow 3 → Flow 4 → Flow 5<br/>• FRs: FR-21..FR-24, FR-53", sc_style, x=50, y=200, w=220, h=80)
    d.add_vertex("sc03", "<b>SC-03: Operational state query</b><br/>• Logical: Workspace Task/Blocker state<br/>• Process: Live status context injection<br/>• FRs: FR-25, FR-26, FR-44", sc_style, x=50, y=420, w=220, h=80)
    d.add_vertex("sc04", "<b>SC-04: Historical blocker resolution</b><br/>• Logical: BlockerEvent append-only history<br/>• Process: Distinguish plan from outcome<br/>• FRs: FR-18, FR-24, FR-63", sc_style, x=50, y=520, w=220, h=80)

    d.add_vertex("sc05", "<b>SC-05: Document version replacement</b><br/>• Logical: Current → Superseded state<br/>• Process: Flow 2 atomic replacement<br/>• FRs: FR-11, FR-12, FR-19, FR-47", sc_style, x=1200, y=100, w=240, h=80)
    d.add_vertex("sc06", "<b>SC-06: Revocation &amp; non-disclosure</b><br/>• Logical: Authoritative ACL + Generic 404<br/>• Process: ADR-0006 mutex; withhold draft<br/>• FRs: FR-03, FR-14, FR-29, FR-55", sc_style, x=1200, y=200, w=240, h=80)
    d.add_vertex("sc07", "<b>SC-07: Insufficient evidence</b><br/>• Logical: Evidence vs claim support<br/>• Process: Short-circuit empty retrieval<br/>• FRs: FR-23 (No invented rationale)", sc_style, x=1200, y=420, w=240, h=80)
    d.add_vertex("sc08", "<b>SC-08: AI failure &amp; work continuity</b><br/>• Logical: Read-only AI, independent search<br/>• Process: Explicit failure (FR-69); keyword ok<br/>• FRs: FR-33, FR-34, FR-69", sc_style, x=1200, y=520, w=240, h=80)

    d.save("scenarios-view/core-scenarios-mapping.drawio")

    mmd = """flowchart TD
    subgraph Views["Kruchten 4+1 View Model"]
        Logical["Logical View (Services & Sitemap)"]
        Process["Process View (Concurrency & Mutex)"]
        Dev["Development View (Monorepo & Invariants)"]
        Physical["Physical View (Deployment Topology)"]
        Scenarios["+1 Scenarios View (SC-01..SC-08)"]:::hub
    end

    Scenarios --- Logical
    Scenarios --- Process
    Scenarios --- Dev
    Scenarios --- Physical

    subgraph CoreScenarios["8 Architectural Driver Scenarios"]
        SC01["SC-01: Task-linked doc access"]
        SC02["SC-02: Cited decision rationale"]
        SC03["SC-03: Operational state query"]
        SC04["SC-04: Historical blocker resolution"]
        SC05["SC-05: Document version replacement"]
        SC06["SC-06: Revocation & non-disclosure"]
        SC07["SC-07: Insufficient evidence"]
        SC08["SC-08: AI failure & continuity"]
    end

    SC01 -.-> Scenarios
    SC02 -.-> Scenarios
    SC03 -.-> Scenarios
    SC04 -.-> Scenarios
    SC05 -.-> Scenarios
    SC06 -.-> Scenarios
    SC07 -.-> Scenarios
    SC08 -.-> Scenarios

    classDef hub fill:#f8cecc,stroke:#b85450,stroke-width:2px;
"""
    save_mmd("scenarios-view/core-scenarios-mapping.mmd", mmd)

# ==============================================================================
# 13. SCENARIOS VIEW - CORE USER JOURNEYS
# ==============================================================================
def build_user_journeys():
    d = DrawioDiagram("DGM-JOURNEY-01", "core-user-journeys", width=2200, height=1300)
    d.add_title("title", "DGM-JOURNEY-01 v1.0 | +1 Scenarios View: Core Persona User Journeys",
                "Sources: UX-PERSONAS-01 v0.4, SAD-03 §6.1; End-to-End Persona Validation (Product Owner, Developer, Content Author)",
                x=60, y=20, w=1800, h=60)

    j_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;"
    step_style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#b0bec5;fontSize=11;align=left;spacing=6;"

    # Journey 1: Product Owner
    d.add_vertex("j1_head", "<b>Journey 1: Product Owner</b><br/>Sprint Planning &amp; Requirements Alignment", j_style, x=100, y=100, w=340, h=60)
    d.add_vertex("j1_s1", "1. Signs in via session mechanism (UC-01)", step_style, x=100, y=180, w=340, h=50)
    d.add_vertex("j1_s2", "2. Creates tasks in Backlog &amp; links architectural specs (UC-03, SC-01)", step_style, x=100, y=250, w=340, h=60)
    d.add_vertex("j1_s3", "3. Plans &amp; starts Sprint with committed capacity (UC-05)", step_style, x=100, y=330, w=340, h=50)
    d.add_vertex("j1_s4", "4. Queries live Sprint blocker state via AI Q&amp;A (UC-10, SC-03)", step_style, x=100, y=400, w=340, h=60)

    # Journey 2: Developer
    d.add_vertex("j2_head", "<b>Journey 2: Developer</b><br/>Task Execution &amp; Cited Decision Rationale", j_style, x=500, y=100, w=340, h=60)
    d.add_vertex("j2_s1", "1. Opens Sprint Board; filters 'My Tasks' (UC-04)", step_style, x=500, y=180, w=340, h=50)
    d.add_vertex("j2_s2", "2. Moves task to In Progress; logs blocker when blocked (UC-04, SC-04)", step_style, x=500, y=250, w=340, h=60)
    d.add_vertex("j2_s3", "3. Asks AI why specific ADR was chosen; inspects citation (UC-09, SC-02)", step_style, x=500, y=330, w=340, h=60)
    d.add_vertex("j2_s4", "4. Continues work seamlessly via keyword search if AI offline (UC-12, SC-08)", step_style, x=500, y=400, w=340, h=60)

    # Journey 3: Content Author / Security Lead
    d.add_vertex("j3_head", "<b>Journey 3: Content Author / Sec Lead</b><br/>Restricted Docs &amp; Access Revocation", j_style, x=900, y=100, w=360, h=60)
    d.add_vertex("j3_s1", "1. Creates restricted security specification (UC-06, ADR-0007)", step_style, x=900, y=180, w=360, h=50)
    d.add_vertex("j3_s2", "2. Grants explicit read grant to developer (UC-06)", step_style, x=900, y=250, w=360, h=50)
    d.add_vertex("j3_s3", "3. Revokes grant; verifies member's AI answer is withheld (UC-06, SC-06)", step_style, x=900, y=320, w=360, h=60)
    d.add_vertex("j3_s4", "4. Inspects tamper-evident audit log &amp; provenance (UC-13)", step_style, x=900, y=400, w=360, h=50)

    d.save("scenarios-view/core-user-journeys.drawio")

    mmd = """journey
    title 3 Core End-to-End Persona User Journeys
    section Product Owner
      Sign in: 5: Product Owner
      Create Backlog Tasks: 4: Product Owner
      Start Sprint: 5: Product Owner
      Query Blockers with AI: 4: Product Owner
    section Developer
      Take Task on Board: 5: Developer
      Log Blocker Event: 4: Developer
      Ask AI Decision Rationale: 5: Developer
      Inspect Exact Citation: 5: Developer
      Fallback during AI Outage: 4: Developer
    section Content Author
      Create Restricted Document: 5: Content Author
      Grant Read Access: 4: Content Author
      Revoke Access: 5: Content Author
      Verify Non-Disclosure: 5: Content Author
      Inspect Provenance Audit: 5: Content Author
"""
    save_mmd("scenarios-view/core-user-journeys.mmd", mmd)

# ==============================================================================
# 14. SDLC - PROCESS FLOW & QUALITY GATES
# ==============================================================================
def build_sdlc_process_flow():
    d = DrawioDiagram("DGM-SDLC-01", "sdlc-process-flow", width=2200, height=1300)
    d.add_title("title", "DGM-SDLC-01 v1.0 | SDLC: 5-Month Capstone Plan, Iteration Lifecycle & Quality Gates",
                "Sources: docs/planning/five-month-plan.md, AGENTS.md, SDLC-Prompt-Checklist; 9 Stages, Automated Verification Gates",
                x=60, y=20, w=1800, h=60)

    phase_style = "swimlane;startSize=28;fillColor=#f8f9fa;strokeColor=#4a5568;strokeWidth=1.5;fontStyle=1;fontSize=12;align=center;"
    stage_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;fontStyle=1;"
    gate_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;"

    # Month 1: Requirements & Architecture
    d.add_vertex("p1", "Month 1: Requirements &amp; Architecture", phase_style, x=100, y=100, w=280, h=520)
    d.add_vertex("s1", "Stage 1: BRD v1.0<br/>Business goals &amp; boundary", stage_style, x=20, y=40, w=240, h=60, parent="p1")
    d.add_vertex("s2", "Stage 2: PRD-01 &amp; UC-02<br/>60 Must FRs, 13 Use Cases", stage_style, x=20, y=120, w=240, h=60, parent="p1")
    d.add_vertex("s3", "Stage 3: SAD-03 4+1 Views<br/>ADR-0001..0017 decisions", stage_style, x=20, y=200, w=240, h=60, parent="p1")
    d.add_vertex("g1", "Gate 1: Context Lint &amp; Check<br/><code>npm run context:check</code>", gate_style, x=20, y=300, w=240, h=60, parent="p1")

    # Month 2: Contracts & Storage Foundation
    d.add_vertex("p2", "Month 2: Contracts &amp; Data", phase_style, x=420, y=100, w=280, h=520)
    d.add_vertex("s4", "Stage 4: Data Design<br/>PostgreSQL 17, pgvector schema", stage_style, x=20, y=40, w=240, h=60, parent="p2")
    d.add_vertex("s5", "Stage 5: API &amp; Contracts<br/>OpenAPI 3.1.1 schemas", stage_style, x=20, y=120, w=240, h=60, parent="p2")
    d.add_vertex("s6", "Stage 6: UX &amp; Flows<br/>Sitemap &amp; 5 UX flowcharts", stage_style, x=20, y=200, w=240, h=60, parent="p2")
    d.add_vertex("g2", "Gate 2: DB Migrations Test<br/><code>npm run db:test</code>", gate_style, x=20, y=300, w=240, h=60, parent="p2")

    # Month 3: Core Implementation
    d.add_vertex("p3", "Month 3: Core Services", phase_style, x=740, y=100, w=280, h=520)
    d.add_vertex("s7a", "Stage 7a: Specs SP-01..05<br/>Workspace Auth &amp; Scrum", stage_style, x=20, y=40, w=240, h=60, parent="p3")
    d.add_vertex("s7b", "Stage 7b: Specs SP-06..08<br/>Knowledge Docs &amp; Lifecycle", stage_style, x=20, y=120, w=240, h=60, parent="p3")
    d.add_vertex("g3", "Gate 3: Service Contract Tests<br/>Isolated DB &amp; Permissions", gate_style, x=20, y=300, w=240, h=60, parent="p3")

    # Month 4: Guarded AI Integration
    d.add_vertex("p4", "Month 4: AI &amp; Retrieval", phase_style, x=1060, y=100, w=280, h=520)
    d.add_vertex("s7c", "Stage 7c: Specs SP-09..11<br/>Independent keyword / semantic search &amp; Mutex relay", stage_style, x=20, y=40, w=240, h=60, parent="p4")
    d.add_vertex("s7d", "Stage 7d: Specs SP-12..13<br/>AI Fallback &amp; Audit inspect", stage_style, x=20, y=120, w=240, h=60, parent="p4")
    d.add_vertex("g4", "Gate 4: ADR-0006 Mutex Test<br/>Revocation &amp; Withholding", gate_style, x=20, y=300, w=240, h=60, parent="p4")

    # Month 5: Evaluation & Release
    d.add_vertex("p5", "Month 5: Evaluation &amp; Release", phase_style, x=1380, y=100, w=280, h=520)
    d.add_vertex("s8", "Stage 8: Evaluation Pilot<br/>25 Reference questions scored", stage_style, x=20, y=40, w=240, h=60, parent="p5")
    d.add_vertex("s9", "Stage 9: Governance Review<br/>Consistency &amp; Artifact audit", stage_style, x=20, y=120, w=240, h=60, parent="p5")
    d.add_vertex("g5", "Gate 5: Final Release Freeze<br/>Zero fabricated evidence", gate_style, x=20, y=300, w=240, h=60, parent="p5")

    # Pipeline connector between months
    e_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=7;strokeColor=#4a5568;strokeWidth=1.5;"
    d.add_edge("e_p1_2", "g1", "s4", "", e_style)
    d.add_edge("e_p2_3", "g2", "s7a", "", e_style)
    d.add_edge("e_p3_4", "g3", "s7c", "", e_style)
    d.add_edge("e_p4_5", "g4", "s8", "", e_style)

    d.save("sdlc/sdlc-process-flow.drawio")

    mmd = """flowchart LR
    subgraph M1["Month 1: Architecture"]
        BRD["Stage 1: BRD v1.0"] --> PRD["Stage 2: PRD & Use Cases"]
        PRD --> SAD["Stage 3: SAD 4+1 & ADRs"]
        SAD --> G1["Gate 1: context:check"]:::gate
    end

    subgraph M2["Month 2: Contracts & Data"]
        Data["Stage 4: PostgreSQL & pgvector"] --> API["Stage 5: OpenAPI 3.1.1"]
        API --> UX["Stage 6: Sitemap & Flows"]
        UX --> G2["Gate 2: db:test"]:::gate
    end

    subgraph M3["Month 3: Core Services"]
        SP_WS["Stage 7a: Workspace Scrum (SP-01..05)"] --> SP_KN["Stage 7b: Knowledge Docs (SP-06..08)"]
        SP_KN --> G3["Gate 3: Contract Shape"]:::gate
    end

    subgraph M4["Month 4: Guarded AI"]
        SP_AI["Stage 7c: Guarded Relay (SP-09..11)"] --> SP_FALL["Stage 7d: AI Fallback (SP-12..13)"]
        SP_FALL --> G4["Gate 4: ADR-0006 Mutex"]:::gate
    end

    subgraph M5["Month 5: Evaluation & Release"]
        Eval["Stage 8: 25 Reference Cases"] --> Gov["Stage 9: Consistency Review"]
        Gov --> G5["Gate 5: Release Freeze"]:::gate
    end

    G1 --> Data
    G2 --> SP_WS
    G3 --> SP_AI
    G4 --> Eval

    classDef gate fill:#f8cecc,stroke:#b85450,stroke-width:1.5px;
"""
    save_mmd("sdlc/sdlc-process-flow.mmd", mmd)

# ==============================================================================
# 15. README & MANIFEST
# ==============================================================================
def build_readme_and_manifest():
    manifest_data = {
        "title": "Central Diagram Register - diagrams-1",
        "version": "1.2",
        "date": "17 October 2026",
        "status": "Alternative unverified; shared diagrams are canonical snapshots",
        "diagrams": [
            {"id": "DGM-UC-01", "name": "use-case-diagram", "category": "use-case", "path": "diagrams-1/use-case/use-case-diagram.drawio", "mmd": "diagrams-1/use-case/use-case-diagram.mmd"},
            {"id": "DGM-ARCH-01", "name": "service-composition", "category": "logical-view", "path": "diagrams-1/logical-view/service-composition.drawio", "mmd": "diagrams-1/logical-view/service-composition.mmd"},
            {"id": "DGM-SITE-01", "name": "application-sitemap", "category": "logical-view", "path": "diagrams-1/logical-view/application-sitemap.drawio", "mmd": "diagrams-1/logical-view/application-sitemap.mmd"},
            {"id": "DGM-DOMAIN-01", "name": "domain-model", "category": "logical-view", "path": "diagrams-1/logical-view/domain-model.drawio", "mmd": "diagrams-1/logical-view/domain-model.mmd"},
            {"id": "DGM-FLOW-01", "name": "ai-qa-flow", "category": "process-view", "path": "diagrams-1/process-view/ai-qa-flow.drawio", "mmd": "diagrams-1/process-view/ai-qa-flow.mmd"},
            {"id": "DGM-FLOW-02", "name": "board-flow", "category": "process-view", "path": "diagrams-1/process-view/board-flow.drawio", "mmd": "diagrams-1/process-view/board-flow.mmd"},
            {"id": "DGM-FLOW-03", "name": "docs-flow", "category": "process-view", "path": "diagrams-1/process-view/docs-flow.drawio", "mmd": "diagrams-1/process-view/docs-flow.mmd"},
            {"id": "DGM-FLOW-04", "name": "permission-read-flow", "category": "process-view", "path": "diagrams-1/process-view/permission-read-flow.drawio", "mmd": "diagrams-1/process-view/permission-read-flow.mmd"},
            {"id": "DGM-FLOW-05", "name": "permission-ai-checkpoints", "category": "process-view", "path": "diagrams-1/process-view/permission-ai-checkpoints.drawio", "mmd": "diagrams-1/process-view/permission-ai-checkpoints.mmd"},
            {"id": "DGM-DEV-01", "name": "package-layering", "category": "development-view", "path": "diagrams-1/development-view/package-layering.drawio", "mmd": "diagrams-1/development-view/package-layering.mmd"},
            {"id": "DGM-PHYS-01", "name": "deployment-topology", "category": "physical-view", "path": "diagrams-1/physical-view/deployment-topology.drawio", "mmd": "diagrams-1/physical-view/deployment-topology.mmd"},
            {"id": "DGM-SCEN-01", "name": "core-scenarios-mapping", "category": "scenarios-view", "path": "diagrams-1/scenarios-view/core-scenarios-mapping.drawio", "mmd": "diagrams-1/scenarios-view/core-scenarios-mapping.mmd"},
            {"id": "DGM-JOURNEY-01", "name": "core-user-journeys", "category": "scenarios-view", "path": "diagrams-1/scenarios-view/core-user-journeys.drawio", "mmd": "diagrams-1/scenarios-view/core-user-journeys.mmd"},
            {"id": "DGM-SDLC-01", "name": "sdlc-process-flow", "category": "sdlc", "path": "diagrams-1/sdlc/sdlc-process-flow.drawio", "mmd": "diagrams-1/sdlc/sdlc-process-flow.mmd"}
        ]
    }

    import json
    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)
    print("Saved manifest.json")

    readme_content = """# Central Diagram Index (diagrams-1)

**Artifact ID:** UML-08  
**Version/date:** 1.2 Draft · 17 October 2026  
**Status:** Historical alternative illustrations; not current implementation guidance. See [registered canonical drafts](../docs/sdlc/diagrams/README.md).  
**Coverage:** 13 Use Cases, Kruchten's 4+1 Architectural View Model, and 5-Month SDLC Process.

---

## 1. Kruchten's 4+1 Architectural View Model Mapping

This alternative set is intended to map to Philippe Kruchten's 4+1 Architectural View Model as detailed in [SAD-03 §2–§6](../docs/architecture.md):

| 4+1 View | Diagram ID | Sources | Purpose & Design Focus | Origin / Trace |
| :--- | :--- | :--- | :--- | :--- |
| **+1 Scenarios View** | DGM-UC-01 | [Draw.io](use-case/use-case-diagram.drawio) / [Mermaid](use-case/use-case-diagram.mmd) | 13 Use Cases, Primary Actor specialization, Supporting Systems, `<<include>>` audit | [UC-02 v0.3](../docs/sdlc/use-cases.md); BR-01..14 |
| **+1 Scenarios View** | DGM-SCEN-01 | [Draw.io](scenarios-view/core-scenarios-mapping.drawio) / [Mermaid](scenarios-view/core-scenarios-mapping.mmd) | SC-01 to SC-08 Cross-View Validation Matrix connecting Logical, Process, Dev, Physical | [SAD-03 §6.1](../docs/architecture.md); PRD §3 |
| **+1 Scenarios View** | DGM-JOURNEY-01 | [Draw.io](scenarios-view/core-user-journeys.drawio) / [Mermaid](scenarios-view/core-user-journeys.mmd) | 3 Core Persona User Journeys: Product Owner, Developer, Content Author | [UX-PERSONAS-01](../docs/ux/personas.md); SC-01..08 |
| **Logical View** | DGM-ARCH-01 | [Draw.io](logical-view/service-composition.drawio) / [Mermaid](logical-view/service-composition.mmd) | Minimal microservices boundary: Workspace & Knowledge services, isolated DBs, TB1-TB4 | [SAD-03 §2](../docs/architecture.md); ADR-0002, 0004 |
| **Logical View** | DGM-SITE-01 | [Draw.io](logical-view/application-sitemap.drawio) / [Mermaid](logical-view/application-sitemap.mmd) | Client screen structure, navigation hierarchy, Generic 404 security invariant | [UX-SITEMAP-03](../docs/ux/sitemap.md); SAD-03 §2.1 |
| **Logical View** | DGM-DOMAIN-01 | [Draw.io](logical-view/domain-model.drawio) / [Mermaid](logical-view/domain-model.mmd) | Domain entity model, bounded contexts, soft ID references (zero cross-DB FKs) | [contracts/data-model.json](../contracts/data-model.json) |
| **Process View** | DGM-FLOW-01 | [Draw.io](process-view/ai-qa-flow.drawio) / [Mermaid](process-view/ai-qa-flow.mmd) | AI Q&A runtime flow, 4 checkpoints, ADR-0006 mutex, whole-draft withholding, fallback | [SAD-03 §3.1, §3.2](../docs/architecture.md); ADR-0006 |
| **Process View** | DGM-FLOW-02 | [Draw.io](process-view/board-flow.drawio) / [Mermaid](process-view/board-flow.mmd) | Scrum board mutations, optimistic locking (409 Conflict), blocker events, transactions | [SAD-03 §3.2 Flow 1](../docs/architecture.md); PRD AC-09 |
| **Process View** | DGM-FLOW-03 | [Draw.io](process-view/docs-flow.drawio) / [Mermaid](process-view/docs-flow.mmd) | Knowledge ingestion, immediate Current version, atomic revision replacement, draft exclusion | [SAD-03 §3.2 Flow 2](../docs/architecture.md); ADR-0009 |
| **Process View** | DGM-FLOW-04 | [Draw.io](process-view/permission-read-flow.drawio) / [Mermaid](process-view/permission-read-flow.mmd) | Dual-scope permission evaluation (Project-shared vs Restricted), Generic 404 non-disclosure | [UX-PERM-MATRIX-02](../docs/ux/permission-matrix.md); ADR-0001 |
| **Process View** | DGM-FLOW-05 | [Draw.io](process-view/permission-ai-checkpoints.drawio) / [Mermaid](process-view/permission-ai-checkpoints.mmd) | 4 AI Security Checkpoints: Pre-filter, Provider Mutex, Delivery Re-check, Citation Inspection | [SAD-03 §3.1](../docs/architecture.md); ADR-0006 |
| **Development View** | DGM-DEV-01 | [Draw.io](development-view/package-layering.drawio) / [Mermaid](development-view/package-layering.mmd) | Monorepo layout (`apps/web`, `services/`, `contracts/`), domain independence, no shared DB writes | [SAD-03 §4](../docs/architecture.md); AGENTS.md |
| **Physical View** | DGM-PHYS-01 | [Draw.io](physical-view/deployment-topology.drawio) / [Mermaid](physical-view/deployment-topology.mmd) | Single developer workstation, ports 8000/8001/5432, 4 Trust Boundaries (TB1..TB4) | [SAD-03 §5](../docs/architecture.md); ADR-0003, 0004 |
| **SDLC View** | DGM-SDLC-01 | [Draw.io](sdlc/sdlc-process-flow.drawio) / [Mermaid](sdlc/sdlc-process-flow.mmd) | 5-Month Capstone Plan (Months 1-5), 9 Stages, 2-Week Scrum Loop, Automated CI Gates | [five-month-plan.md](../docs/planning/five-month-plan.md) |

---

## 2. Directory Layout

```
diagrams-1/
├── README.md                           # This index
├── manifest.json                       # Machine-readable diagram register
├── use-case/
│   ├── use-case-diagram.drawio         # DGM-UC-01 (Draw.io source)
│   └── use-case-diagram.mmd            # DGM-UC-01 (Mermaid source)
├── logical-view/
│   ├── service-composition.drawio      # DGM-ARCH-01
│   ├── service-composition.mmd
│   ├── application-sitemap.drawio      # DGM-SITE-01
│   ├── application-sitemap.mmd
│   ├── domain-model.drawio             # DGM-DOMAIN-01
│   └── domain-model.mmd
├── process-view/
│   ├── ai-qa-flow.drawio               # DGM-FLOW-01
│   ├── ai-qa-flow.mmd
│   ├── board-flow.drawio               # DGM-FLOW-02
│   ├── board-flow.mmd
│   ├── docs-flow.drawio                # DGM-FLOW-03
│   ├── docs-flow.mmd
│   ├── permission-read-flow.drawio     # DGM-FLOW-04
│   ├── permission-read-flow.mmd
│   ├── permission-ai-checkpoints.drawio# DGM-FLOW-05
│   └── permission-ai-checkpoints.mmd
├── development-view/
│   ├── package-layering.drawio         # DGM-DEV-01
│   └── package-layering.mmd
├── physical-view/
│   ├── deployment-topology.drawio      # DGM-PHYS-01
│   └── deployment-topology.mmd
├── scenarios-view/
│   ├── core-scenarios-mapping.drawio   # DGM-SCEN-01
│   ├── core-scenarios-mapping.mmd
│   ├── core-user-journeys.drawio       # DGM-JOURNEY-01
│   └── core-user-journeys.mmd
└── sdlc/
    ├── sdlc-process-flow.drawio        # DGM-SDLC-01
    └── sdlc-process-flow.mmd
```

---

## 3. Structural Validation & Compliance

Historical generation claims, requiring fresh validation after regeneration:
- Validated with `scripts/validate.py` from Draw.io Architecture Studio.
- Strict adherence to `<mxGeometry relative="1" as="geometry"/>` on all edges.
- Zero sibling node overlaps, valid IDs, clean orthogonal routes.
- Dual format (Draw.io + Mermaid) maintained for complete project traceability.
"""
    # Keep the curated review/status notes; initialize an index only if absent.
    if not os.path.exists(os.path.join(OUT_DIR, "README.md")):
        with open(os.path.join(OUT_DIR, "README.md"), "w", encoding="utf-8") as f:
            f.write(readme_content)
    print("README.md retained or initialized")


def refresh_canonical_snapshots():
    """Shared views are copies; only the registered set owns their semantics."""
    import json
    import shutil
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, "docs", "sdlc", "diagrams", "manifest.json"), encoding="utf-8") as source:
        manifest = json.load(source)
    groups = {"use-case": "use-case", "architecture": "logical-view", "sitemap": "logical-view", "flowchart": "process-view", "user-journey": "scenarios-view"}
    for artifact in manifest["artifacts"]:
        if "drawio" not in artifact or artifact["path"].split("/")[-2] not in groups:
            continue
        for key in ("path", "drawio"):
            parts = artifact[key].split("/")
            destination = os.path.join(OUT_DIR, groups[parts[-2]], parts[-1])
            os.makedirs(os.path.dirname(destination), exist_ok=True)
            shutil.copyfile(os.path.join(root, *parts), destination)

if __name__ == "__main__":
    print("Building diagrams in diagrams-1...")
    build_use_case()
    build_service_composition()
    build_application_sitemap()
    build_domain_model()
    build_ai_qa_flow()
    build_board_flow()
    build_docs_flow()
    build_permission_read_flow()
    build_permission_ai_checkpoints()
    build_development_view()
    build_deployment_topology()
    build_scenarios_mapping()
    build_user_journeys()
    build_sdlc_process_flow()
    build_readme_and_manifest()
    refresh_canonical_snapshots()
    print("All diagrams generated successfully!")
