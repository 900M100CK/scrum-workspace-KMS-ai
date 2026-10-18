#!/usr/bin/env python3
"""Build script for diagrams-1

Generates clean, native, structurally valid .drawio diagrams and companion .mmd files:
- Use Case: UC-01 to UC-13 with hierarchical actors and supporting systems
- 4+1 Architectural Model:
    * Logical View: Service Composition, Application Sitemap, Domain Model
    * Process View: AI Q&A Flow, Scrum Board Flow, Docs Lifecycle Flow, Permission Read Flow, Permission AI Checkpoints
    * Development View: Package & Module Layering
    * Physical View: Deployment Topology & Trust Boundaries
    * Scenarios (+1) View: Core Scenarios Mapping (SC-01 to SC-08), Core User Journeys
- SDLC: 5-Month Capstone SDLC Process & Quality Gates
"""

import os
import xml.etree.ElementTree as ET
from xml.dom import minidom

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "diagrams-1")

class DrawioDiagram:
    def __init__(self, diagram_id, name, width=2200, height=1400):
        self.diagram_id = diagram_id
        self.name = name
        self.width = width
        self.height = height
        self.cells = []
        self.cell_ids = set(["0", "1"])

    def add_title(self, title_id, title_text, meta_text, x=60, y=30, w=1800, h=70):
        val = f"<b>{title_text}</b><br/><span style='font-size:12px;color:#555;'>{meta_text}</span>"
        style = "text;html=1;whiteSpace=wrap;fontSize=18;fontStyle=0;align=left;verticalAlign=middle;"
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
        geo = ET.SubElement(cell, "mxGeometry", {
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

    def save(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self.to_xml())

print("DrawioDiagram builder ready.")
