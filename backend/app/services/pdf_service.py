"""
pdf_service.py

Landscape PDF generator for MHT-CET counselling preference lists.

Drop-in replacement for the old docxtpl + python-docx + LibreOffice pipeline.
Same public entry point (`fill_template`) and same call signature/return type
(a filesystem path to the generated PDF string) so nothing else in the
codebase needs to change.

Layout, top to bottom:
    1. Colour-themed header band (title strip, every page)
    2. Student Details table
    3. Disclaimer block
    4. Preference List table (paginates automatically, header row repeats)

Dependencies: reportlab only. docxtpl / python-docx / LibreOffice / the
F.docx & Table.docx templates are no longer required for this flow.
"""

import os
import tempfile
from typing import List, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.schemas import PreferenceListItem


# ─────────────────────────────────────────────
# ✅ COLOUR THEME
# ─────────────────────────────────────────────

PRIMARY_COLOR = colors.HexColor("#123A6B")   # deep blue - header band
ACCENT_COLOR = colors.HexColor("#F2A900")    # gold - accent line
LIGHT_BG = colors.HexColor("#EAF0FA")        # light blue - label cells
ROW_ALT_BG = colors.HexColor("#F5F8FC")      # zebra striping
GRID_COLOR = colors.HexColor("#C7D3E3")
TEXT_DARK = colors.HexColor("#1A1A1A")
FOOTER_GREY = colors.HexColor("#666666")
WHITE = colors.white

PAGE_SIZE = landscape(A4)
MARGIN = 12 * mm
HEADER_BAND_HEIGHT = 20 * mm


# ─────────────────────────────────────────────
# ✅ STYLES
# ─────────────────────────────────────────────

_base_styles = getSampleStyleSheet()

SECTION_HEADING_STYLE = ParagraphStyle(
    "SectionHeading",
    parent=_base_styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12.5,
    textColor=PRIMARY_COLOR,
    spaceBefore=0,
    spaceAfter=4,
)

DISCLAIMER_HEADING_STYLE = ParagraphStyle(
    "DisclaimerHeading",
    parent=SECTION_HEADING_STYLE,
    textColor=colors.HexColor("#8A5A00"),
)

DISCLAIMER_BODY_STYLE = ParagraphStyle(
    "DisclaimerBody",
    parent=_base_styles["Normal"],
    fontName="Helvetica",
    fontSize=8.5,
    leading=12,
    textColor=TEXT_DARK,
    alignment=TA_LEFT,
)

CELL_STYLE = ParagraphStyle(
    "Cell", parent=_base_styles["Normal"], fontName="Helvetica",
    fontSize=8, leading=10, textColor=TEXT_DARK,
)

CELL_LABEL_STYLE = ParagraphStyle(
    "CellLabel", parent=CELL_STYLE, fontName="Helvetica-Bold", textColor=PRIMARY_COLOR,
)

HEADER_CELL_STYLE = ParagraphStyle(
    "HeaderCell", parent=_base_styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8.5, leading=10, textColor=WHITE, alignment=TA_CENTER,
)


# ─────────────────────────────────────────────
# ✅ DISCLAIMER COPY
# ─────────────────────────────────────────────

DISCLAIMER_TEXT = (
    "This document is a personalised preference list generated solely to assist the "
    "candidate during MHT-CET CAP counselling. It is <b>NOT an allotment letter</b> and does "
    "not guarantee admission to any listed college or branch. Final seat allotment is "
    "decided exclusively by the Competent Authority / Directorate of Technical Education "
    "(DTE), Maharashtra, based on merit, category, seat matrix, and CAP round rules in "
    "force at the time. This platform only helps prepare and organise the preference "
    "order and plays no role in, and holds no responsibility for, the actual allotment "
    "outcome. Please cross-verify every detail on the official CAP / DTE portal before "
    "making any admission decision."
)


# ─────────────────────────────────────────────
# ✅ STUDENT DETAILS TABLE
# ─────────────────────────────────────────────

def _safe(value) -> str:
    if value is None:
        return "-"
    text = str(value).strip()
    return text if text else "-"


def _build_student_details_table(
    student_name: str,
    counselling_id: str,
    percentile: float,
    category: str,
    rank: str,
    mobile: str,
    preferred_cities: List[str],
    preferred_branches: List[str],
) -> Table:
    cities_str = ", ".join([c for c in preferred_cities if c]) or "-"
    branches_str = ", ".join([b for b in preferred_branches if b]) or "-"

    def label(text):
        return Paragraph(text, CELL_LABEL_STYLE)

    def value(text):
        return Paragraph(_safe(text), CELL_STYLE)

    data = [
        [label("Student Name"), value(student_name), label("Counselling ID"), value(counselling_id)],
        [label("Percentile"), value(f"{percentile:.4f}" if percentile is not None else "-"),
         label("Category"), value(category)],
        [label("Rank"), value(rank), label("Mobile"), value(mobile)],
        [label("Preferred Cities"), Paragraph(cities_str, CELL_STYLE),
         label("Preferred Branches"), Paragraph(branches_str, CELL_STYLE)],
    ]

    col_widths = [38 * mm, 92 * mm, 38 * mm, 92 * mm]
    table = Table(data, colWidths=col_widths, hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, GRID_COLOR),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
    ]))
    return table


# ─────────────────────────────────────────────
# ✅ PREFERENCE LIST TABLE
# ─────────────────────────────────────────────

def _build_preference_table(preference_list: List[PreferenceListItem]) -> Table:
    header = [
        Paragraph(t, HEADER_CELL_STYLE)
        for t in ["Sr.No", "College Code", "College Name", "City",
                  "Category", "Branch Code", "Branch Name", "Cutoff %"]
    ]
    data = [header]

    for idx, item in enumerate(preference_list, start=1):
        cutoff = getattr(item, "cutoff_percentile", None)
        cutoff_str = f"{cutoff:.4f}" if cutoff is not None else "-"
        data.append([
            Paragraph(str(idx), CELL_STYLE),
            Paragraph(_safe(item.college_code), CELL_STYLE),
            Paragraph(_safe(item.college_name), CELL_STYLE),
            Paragraph(_safe(item.city), CELL_STYLE),
            Paragraph(_safe(item.category), CELL_STYLE),
            Paragraph(_safe(item.branch_code), CELL_STYLE),
            Paragraph(_safe(item.branch_name), CELL_STYLE),
            Paragraph(cutoff_str, CELL_STYLE),
        ])

    col_widths = [13 * mm, 25 * mm, 68 * mm, 30 * mm, 20 * mm, 25 * mm, 65 * mm, 21 * mm]
    table = Table(data, colWidths=col_widths, repeatRows=1, hAlign="CENTER")

    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, ACCENT_COLOR),
        ("GRID", (0, 0), (-1, -1), 0.4, GRID_COLOR),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    for row_idx in range(1, len(data)):
        if row_idx % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, row_idx), (-1, row_idx), ROW_ALT_BG))

    table.setStyle(TableStyle(style_cmds))
    return table


# ─────────────────────────────────────────────
# ✅ HEADER / FOOTER (drawn on every page)
# ─────────────────────────────────────────────

def _draw_header_footer(canvas, doc):
    canvas.saveState()
    width, height = PAGE_SIZE

    # Top colour band
    canvas.setFillColor(PRIMARY_COLOR)
    canvas.rect(0, height - HEADER_BAND_HEIGHT, width, HEADER_BAND_HEIGHT, fill=1, stroke=0)
    canvas.setFillColor(ACCENT_COLOR)
    canvas.rect(0, height - HEADER_BAND_HEIGHT - 1.2 * mm, width, 1.2 * mm, fill=1, stroke=0)

    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawCentredString(width / 2, height - 12 * mm, "MHT-CET CAP Preference List")
    canvas.setFont("Helvetica", 9)
    canvas.drawCentredString(width / 2, height - 17 * mm, "Generated for counselling reference purposes only")

    # Footer
    canvas.setStrokeColor(GRID_COLOR)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 11 * mm, width - MARGIN, 11 * mm)

    canvas.setFillColor(FOOTER_GREY)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 8 * mm, "Auto-generated document \u2014 not an official allotment letter")
    canvas.drawRightString(width - MARGIN, 8 * mm, f"Page {doc.page}")

    canvas.restoreState()


# ─────────────────────────────────────────────
# ✅ CORE BUILD
# ─────────────────────────────────────────────

def _build_pdf(
    student_name: str,
    counselling_id: str,
    percentile: float,
    category: str,
    rank: str,
    mobile: str,
    preferred_cities: List[str],
    preferred_branches: List[str],
    preference_list: List[PreferenceListItem],
    output_path: str,
) -> str:
    doc = SimpleDocTemplate(
        output_path,
        pagesize=PAGE_SIZE,
        topMargin=HEADER_BAND_HEIGHT + 6 * mm,
        bottomMargin=14 * mm,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        title="MHT-CET CAP Preference List",
    )

    story = []

    story.append(Paragraph("Student Details", SECTION_HEADING_STYLE))
    story.append(Spacer(1, 2 * mm))
    story.append(_build_student_details_table(
        student_name, counselling_id, percentile, category, rank, mobile,
        preferred_cities, preferred_branches,
    ))
    story.append(Spacer(1, 5 * mm))

    story.append(Paragraph("Disclaimer", DISCLAIMER_HEADING_STYLE))
    story.append(Spacer(1, 1.5 * mm))
    story.append(Paragraph(DISCLAIMER_TEXT, DISCLAIMER_BODY_STYLE))
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph("Preference List", SECTION_HEADING_STYLE))
    story.append(Spacer(1, 2 * mm))

    if preference_list:
        story.append(_build_preference_table(preference_list))
    else:
        story.append(Paragraph("No preferences have been added yet.", CELL_STYLE))

    doc.build(story, onFirstPage=_draw_header_footer, onLaterPages=_draw_header_footer)
    return output_path


# ─────────────────────────────────────────────
# ✅ FINAL MAIN FUNCTION (same signature as before)
# ─────────────────────────────────────────────

def fill_template(
    student_name: str,
    counselling_id: str,
    percentile: float,
    category: str,
    rank: str,
    mobile: str,
    preferred_cities: List[str],
    preferred_branches: List[str],
    preference_list: List[PreferenceListItem],
) -> str:
    """
    Generates the landscape MHT-CET preference-list PDF and returns the
    filesystem path to it. Signature and return type are unchanged from the
    old docx+LibreOffice implementation, so every caller keeps working as-is.
    """
    tmp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(tmp_dir, "final.pdf")

    _build_pdf(
        student_name,
        counselling_id,
        percentile,
        category,
        rank,
        mobile,
        preferred_cities,
        preferred_branches,
        preference_list,
        pdf_path,
    )

    return pdf_path