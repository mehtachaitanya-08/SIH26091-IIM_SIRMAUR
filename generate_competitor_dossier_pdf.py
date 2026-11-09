import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(
                15 * mm, 
                285 * mm, 
                "Competitive Landscape Dossier: Rural Micro-Enterprise & Advisory Platforms"
            )
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(15 * mm, 282 * mm, 195 * mm, 282 * mm)
            
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(195 * mm, 12 * mm, page_text)
        self.drawString(15 * mm, 12 * mm, "CONFIDENTIAL & PROPRIETARY — SMART INDIA HACKATHON RESEARCH")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(15 * mm, 16 * mm, 195 * mm, 16 * mm)
        
        self.restoreState()

def build_pdf():
    md_file = r"c:\Users\LENOVO\Desktop\IPL 2 Project Research\Competitor_Landscape_Dossier.md"
    pdf_file = r"c:\Users\LENOVO\Desktop\IPL 2 Project Research\Competitor_Landscape_Dossier.pdf"

    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()

    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    c_primary = colors.HexColor("#1E3A8A")     # Deep Navy
    c_secondary = colors.HexColor("#2563EB")   # Royal Blue
    c_dark = colors.HexColor("#0F172A")        # Dark Slate
    c_body = colors.HexColor("#334155")        # Slate Grey
    c_bg_light = colors.HexColor("#F8FAFC")    # Off-white

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=c_primary,
        spaceAfter=5
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_primary,
        spaceBefore=13,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=c_secondary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=c_dark,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_body,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_body,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.2,
        textColor=colors.HexColor("#0F172A")
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=8.8,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.5,
        textColor=c_body
    )

    story = []
    lines = content.splitlines()
    i = 0
    in_code = False
    code_lines = []

    def parse_inline(text):
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
        text = re.sub(r"\*(.*?)\*", r"<i>\1</i>", text)
        text = re.sub(r"`(.*?)`", r"<font name='Courier' color='#1E40AF'><b>\1</b></font>", text)
        return text

    while i < len(lines):
        line = lines[i]
        raw = line.rstrip()

        # Handle Code Block / Architecture Diagram
        if raw.startswith("```"):
            if in_code:
                in_code = False
                code_text = "\n".join(code_lines)
                table_box = Table(
                    [[Preformatted(code_text, code_style)]],
                    colWidths=[182 * mm]
                )
                table_box.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
                    ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
                    ('LINEBEFORE', (0,0), (0,-1), 3.0, c_secondary),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('LEFTPADDING', (0,0), (-1,-1), 6),
                    ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(table_box)
                story.append(Spacer(1, 5))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(raw)
            i += 1
            continue

        if not raw.strip():
            i += 1
            continue

        if raw.startswith("# Comprehensive Landscape Dossier:"):
            title_text = parse_inline(raw.replace("# ", ""))
            story.append(Paragraph(title_text, title_style))
            i += 1
            continue

        if raw.startswith("**Project:**") or raw.startswith("**Theme:**") or raw.startswith("**Date:**"):
            meta_buf = []
            while i < len(lines) and (lines[i].startswith("**Project:**") or lines[i].startswith("**Theme:**") or lines[i].startswith("**Date:**")):
                meta_buf.append(parse_inline(lines[i].strip()))
                i += 1
            story.append(Paragraph("<br/>".join(meta_buf), subtitle_style))
            story.append(Spacer(1, 4))
            continue

        if raw.startswith("---"):
            t_line = Table([[""]], colWidths=[182 * mm])
            t_line.setStyle(TableStyle([
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                ('TOPPADDING', (0,0), (-1,-1), 1)
            ]))
            story.append(t_line)
            story.append(Spacer(1, 4))
            i += 1
            continue

        if raw.startswith("## "):
            h_text = parse_inline(raw[3:].strip())
            story.append(Paragraph(h_text, h1_style))
            i += 1
            continue
        elif raw.startswith("### "):
            h_text = parse_inline(raw[4:].strip())
            story.append(Paragraph(h_text, h2_style))
            i += 1
            continue
        elif raw.startswith("#### "):
            h_text = parse_inline(raw[5:].strip())
            story.append(Paragraph(h_text, h3_style))
            i += 1
            continue

        # Tables
        if "|" in raw and (raw.strip().startswith("|") or raw.strip().endswith("|")):
            table_raw = []
            while i < len(lines) and "|" in lines[i] and (lines[i].strip().startswith("|") or lines[i].strip().endswith("|")):
                table_raw.append(lines[i].strip())
                i += 1
            
            table_data = []
            is_header = True
            for r in table_raw:
                if re.match(r"^\|?[\s\-:|]+\|?$", r):
                    is_header = False
                    continue
                cells = [c.strip() for c in r.strip("|").split("|")]
                row_cells = []
                for cell in cells:
                    p_style = th_style if is_header else td_style
                    row_cells.append(Paragraph(parse_inline(cell), p_style))
                table_data.append(row_cells)

            if table_data:
                num_cols = len(table_data[0])
                avail_width = 182.0
                
                if num_cols == 7:
                    # Whitespace table
                    col_widths = [26 * mm, 24 * mm, 26 * mm, 26 * mm, 26 * mm, 24 * mm, 30 * mm]
                elif num_cols == 5:
                    col_widths = [25 * mm, 35 * mm, 38 * mm, 40 * mm, 44 * mm]
                elif num_cols == 4:
                    col_widths = [40 * mm, 45 * mm, 45 * mm, 52 * mm]
                elif num_cols == 3:
                    col_widths = [45 * mm, 60 * mm, 77 * mm]
                else:
                    w = (avail_width / num_cols) * mm
                    col_widths = [w] * num_cols

                t = Table(table_data, colWidths=col_widths, repeatRows=1)
                t_style = [
                    ('BACKGROUND', (0,0), (-1,0), c_primary),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('TOPPADDING', (0,0), (-1,-1), 2.5),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                    ('LEFTPADDING', (0,0), (-1,-1), 2.5),
                    ('RIGHTPADDING', (0,0), (-1,-1), 2.5),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
                ]
                for r_idx in range(1, len(table_data)):
                    if r_idx % 2 == 0:
                        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor("#F1F5F9")))
                    else:
                        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.white))
                t.setStyle(TableStyle(t_style))
                story.append(t)
                story.append(Spacer(1, 5))
            continue

        if raw.strip().startswith("* ") or raw.strip().startswith("- "):
            bullet_text = parse_inline(raw.strip()[2:])
            story.append(Paragraph(f"&bull; {bullet_text}", bullet_style))
            i += 1
            continue

        p_text = parse_inline(raw)
        story.append(Paragraph(p_text, body_style))
        i += 1

    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF build successful! Output:", pdf_file, "Size:", os.path.getsize(pdf_file), "bytes")

if __name__ == "__main__":
    build_pdf()

