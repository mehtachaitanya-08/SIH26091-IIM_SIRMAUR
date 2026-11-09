import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget

def generate_dpr_pdf():
    pdf_path = r"c:\Users\LENOVO\Desktop\IPL 2 Project Research\Sample_BankReady_1Page_DPR.pdf"
    
    # 1-Page A4 tightly bounded layout
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=8 * mm,
        bottomMargin=8 * mm
    )

    styles = getSampleStyleSheet()

    # Palette
    c_primary = colors.HexColor("#1E3A8A")     # Navy Blue
    c_secondary = colors.HexColor("#0D9488")   # Teal
    c_dark = colors.HexColor("#0F172A")        # Dark Slate
    c_light = colors.HexColor("#F8FAFC")       # Light Slate
    c_accent = colors.HexColor("#B45309")      # Amber Brown

    # Typography styles
    hdr_title = ParagraphStyle(
        'HdrTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=colors.white,
        alignment=1  # Centered
    )
    hdr_sub = ParagraphStyle(
        'HdrSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#E2E8F0"),
        alignment=1
    )

    sec_hdr = ParagraphStyle(
        'SecHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    field_lbl = ParagraphStyle(
        'FieldLbl',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=c_dark
    )
    field_val = ParagraphStyle(
        'FieldVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#334155")
    )

    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        leading=8,
        textColor=c_primary
    )
    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8,
        textColor=c_dark
    )
    td_num = ParagraphStyle(
        'TDNum',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        leading=8,
        textColor=c_dark,
        alignment=2  # Right-aligned
    )

    story = []

    # 1. Government Header Banner Table
    banner_content = [
        Paragraph("PRADHAN MANTRI EMPLOYMENT GENERATION PROGRAMME (PMEGP) - MICRO-PROJECT PROFILE", hdr_title),
        Paragraph("DETAILED PROJECT APPRAISAL REPORT (DPR) FOR BANK CREDIT & CAPITAL SUBSIDY SANCTION", hdr_sub),
        Paragraph("Generated via: Bharat Udyam AI | Institutional Partner: Lead District Bank / SRLM | Ref: RAJ-JPR-2026-9041", hdr_sub)
    ]
    banner_table = Table([[b] for b in banner_content], colWidths=[190 * mm])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 1.5 * mm))

    # 2. Section 1: Applicant Profile & QR Verification Code
    # Native QR Code Widget
    qr_w = QrCodeWidget("https://bharatudyam.gov.in/verify/RAJ-JPR-2026-9041?sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    qr_w.barWidth = 35 * mm
    qr_w.barHeight = 35 * mm
    qr_w.qrVersion = 3
    qr_d = Drawing(35 * mm, 35 * mm)
    qr_d.add(qr_w)

    app_info_text = [
        [
            Paragraph("<b>Applicant Name / आवेदक:</b>", field_lbl),
            Paragraph("Rameshwar Lal (Age: 34 Yrs)", field_val),
            Paragraph("<b>Target Scheme:</b>", field_lbl),
            Paragraph("PMEGP (Rural Special - OBC)", field_val),
        ],
        [
            Paragraph("<b>Social Category / वर्ग:</b>", field_lbl),
            Paragraph("OBC (Non-Creamy Layer) - Rural", field_val),
            Paragraph("<b>NIC / Activity Code:</b>", field_lbl),
            Paragraph("10402 (Edible Vegetable Oil)", field_val),
        ],
        [
            Paragraph("<b>Gram Panchayat / Block:</b>", field_lbl),
            Paragraph("Morija, Block Chomu, Jaipur (Raj)", field_val),
            Paragraph("<b>Project Classification:</b>", field_lbl),
            Paragraph("Agro-Processing (Mfg / Tiny Unit)", field_val),
        ],
        [
            Paragraph("<b>Aadhaar / UAP Linked ID:</b>", field_lbl),
            Paragraph("XXXX-XXXX-4921 / UAP-RJ-08-0192", field_val),
            Paragraph("<b>Preferred Lead Bank:</b>", field_lbl),
            Paragraph("Baroda Raj. Kshetriya Gramin Bank", field_val),
        ],
        [
            Paragraph("<b>Proposed Enterprise:</b>", field_lbl),
            Paragraph("Cold-Press Mustard Oil Expeller Unit", field_val),
            Paragraph("<b>Lead Branch:</b>", field_lbl),
            Paragraph("Chomu Mandi Branch (IFSC: BARB0BRGBXX)", field_val),
        ],
    ]
    app_info_table = Table(app_info_text, colWidths=[38 * mm, 46 * mm, 30 * mm, 36 * mm])
    app_info_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))

    qr_side_table = Table([
        [app_info_table, qr_d]
    ], colWidths=[150 * mm, 40 * mm])
    qr_side_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0,0), (-1,-1), c_light),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(qr_side_table)
    story.append(Spacer(1, 1.5 * mm))

    # 3. Section 2 & 3: Side-by-Side Tables (Project Cost & Means of Finance)
    # Left: Project Cost Breakdown
    cost_data = [
        [Paragraph("<b>1. COST OF PROJECT (लागत विवरण)</b>", sec_hdr), Paragraph("", sec_hdr)],
        [Paragraph("<b>Component / विवरण</b>", th_style), Paragraph("<b>Amount (INR)</b>", th_style)],
        [Paragraph("A. Plant & Machinery (6-Bolt Expeller + 10HP Motor)", td_style), Paragraph("₹ 1,15,000", td_num)],
        [Paragraph("B. Electrical Installation & Foundation Platform", td_style), Paragraph("₹   10,000", td_num)],
        [Paragraph("C. Pre-Operative Setup & Mandatory Licensing", td_style), Paragraph("₹    5,000", td_num)],
        [Paragraph("D. Working Capital Margin (45-Day Seed Stock)", td_style), Paragraph("₹   25,000", td_num)],
        [Paragraph("<b>TOTAL PROJECT OUTLAY (कुल परियोजना लागत)</b>", th_style), Paragraph("<b>₹ 1,55,000</b>", td_num)],
    ]
    t_cost = Table(cost_data, colWidths=[66 * mm, 26 * mm])
    t_cost.setStyle(TableStyle([
        ('SPAN', (0,0), (1,0)),
        ('BACKGROUND', (0,0), (1,0), c_primary),
        ('BACKGROUND', (0,1), (1,1), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0,6), (1,6), colors.HexColor("#FEF3C7")),
        ('GRID', (0,1), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))

    # Right: Means of Finance & Subsidy Structure
    finance_data = [
        [Paragraph("<b>2. MEANS OF FINANCE & SUBSIDY (वित्त पोषण)</b>", sec_hdr), Paragraph("", sec_hdr)],
        [Paragraph("<b>Source / मद</b>", th_style), Paragraph("<b>Amount (INR)</b>", th_style)],
        [Paragraph("A. Beneficiary Own Contribution (5% Margin Money)", td_style), Paragraph("₹   7,750", td_num)],
        [Paragraph("B. Govt Capital Subsidy / Margin Money (35%)*", td_style), Paragraph("₹  54,250", td_num)],
        [Paragraph("C. Bank Term Loan Component (60%)", td_style), Paragraph("₹  93,000", td_num)],
        [Paragraph("D. Loan Repayment Tenure: 60 Months (5 Years)", td_style), Paragraph("@ 9.5% p.a.", td_num)],
        [Paragraph("<b>ESTIMATED MONTHLY INSTALLMENT (EMI)</b>", th_style), Paragraph("<b>₹ 1,954 / mo</b>", td_num)],
    ]
    t_finance = Table(finance_data, colWidths=[68 * mm, 28 * mm])
    t_finance.setStyle(TableStyle([
        ('SPAN', (0,0), (1,0)),
        ('BACKGROUND', (0,0), (1,0), c_secondary),
        ('BACKGROUND', (0,1), (1,1), colors.HexColor("#E2E8F0")),
        ('BACKGROUND', (0,6), (1,6), colors.HexColor("#DCFCE7")),
        ('GRID', (0,1), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))

    two_col_table = Table([[t_cost, t_finance]], colWidths=[93 * mm, 97 * mm])
    two_col_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(two_col_table)
    story.append(Spacer(1, 1.5 * mm))

    # 4. Section 4: Operational Viability & Cash Flow Stress Testing Matrix
    viability_hdr = [Paragraph("<b>3. OPERATIONAL VIABILITY & CASH-FLOW STRESS-TEST MATRIX (मासिक नकदी प्रवाह एवं व्यवहार्यता)</b>", sec_hdr)]
    t_vhdr = Table([viability_hdr], colWidths=[190 * mm])
    t_vhdr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_vhdr)

    v_data = [
        [
            Paragraph("<b>Average Monthly Gross Revenue:</b>", field_lbl),
            Paragraph("₹ 32,000 (Crushing 40 qtl seed/mo)", field_val),
            Paragraph("<b>Average Annual DSCR:</b>", field_lbl),
            Paragraph("<b>4.42</b> (Benchmark Bankable > 1.50)", field_val)
        ],
        [
            Paragraph("<b>Average Monthly Operating Cost:</b>", field_lbl),
            Paragraph("₹ 21,500 (Raw seed, power, labor)", field_val),
            Paragraph("<b>Minimum Seasonal DSCR (Monsoon):</b>", field_lbl),
            Paragraph("<b>2.96</b> (Satisfies worst-case lean buffer)", field_val)
        ],
        [
            Paragraph("<b>Net Monthly Operating Surplus:</b>", field_lbl),
            Paragraph("<b>₹ 10,500</b> (Covers ₹1,954 EMI easily)", field_val),
            Paragraph("<b>Break-Even Point (BEP):</b>", field_lbl),
            Paragraph("<b>31.8% of Installed Capacity</b>", field_val)
        ],
        [
            Paragraph("<b>Lean-Month Lowest Surplus:</b>", field_lbl),
            Paragraph("₹  5,800 (During heavy monsoon dip)", field_val),
            Paragraph("<b>Applicant Retained Liquidity:</b>", field_lbl),
            Paragraph("₹ 22,250 (Surplus saved buffer post-margin)", field_val)
        ]
    ]
    t_vdata = Table(v_data, colWidths=[48 * mm, 48 * mm, 48 * mm, 46 * mm])
    t_vdata.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0,0), (-1,-1), c_light),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_vdata)
    story.append(Spacer(1, 1.5 * mm))

    # 5. Section 5: Hyper-Local Feasibility & Competitor Density Assessment
    market_hdr = [Paragraph("<b>4. HYPER-LOCAL MARKET FEASIBILITY & CLUSTER RISK ASSESSMENT (स्थानीय बाज़ार विश्लेषण)</b>", sec_hdr)]
    t_mhdr = Table([market_hdr], colWidths=[190 * mm])
    t_mhdr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_secondary),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_mhdr)

    m_data = [
        [
            Paragraph("<b>Local Raw Material Supply:</b>", field_lbl),
            Paragraph("Surplus oilseed belt; direct farmer procurement within 2.5 km radius. Chomu APMC mandi within 7 km.", field_val),
            Paragraph("<b>Saturation Risk:</b>", field_lbl),
            Paragraph("<font color='#0D9488'><b>LOW</b></font> (1 defunct unit within 3 km)", field_val),
        ],
        [
            Paragraph("<b>Target Customer Base:</b>", field_lbl),
            Paragraph("4 neighbouring villages (Morija, Rampura, Nangal, Kethun) comprising ~1,850 agrarian households.", field_val),
            Paragraph("<b>By-Product Realization:</b>", field_lbl),
            Paragraph("Mustard oil cake (Khal) sold locally to dairy units @ ₹28/kg.", field_val),
        ]
    ]
    t_mdata = Table(m_data, colWidths=[38 * mm, 78 * mm, 32 * mm, 42 * mm])
    t_mdata.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0,0), (-1,-1), c_light),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_mdata)
    story.append(Spacer(1, 1.5 * mm))

    # 6. Section 6: Statutory Certification, Endorsement & Signature Blocks
    cert_text = (
        "<b>Statutory Undertaking & Algorithmic Audit:</b> This Detailed Project Appraisal Report is generated using the audited "
        "deterministic rules engine of Bharat Udyam AI in compliance with Ministry of MSME PMEGP Guidelines 2024-25. Capital costs "
        "and subsidy percentages have been cross-verified against official KVIC circulars. No subjective or hallucinated parameters are incorporated. "
        "The applicant satisfies rural special category criteria for 35% margin money capital subsidy."
    )
    p_cert = Paragraph(cert_text, ParagraphStyle('Cert', parent=styles['Normal'], fontName='Helvetica', fontSize=5.8, leading=7.5, textColor=colors.HexColor("#475569")))
    t_cert = Table([[p_cert]], colWidths=[190 * mm])
    t_cert.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94A3B8")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_cert)
    story.append(Spacer(1, 2 * mm))

    sig_data = [
        [
            Paragraph("<b>Applicant Verification:</b><br/><br/><br/>_______________________________<br/>Signature / Thumb Impression<br/><b>Rameshwar Lal</b> (Applicant)", field_val),
            Paragraph("<b>Facilitation Partner (CSC / Bank Sakhi):</b><br/><br/><br/>_______________________________<br/>CSC VLE / Bank Sakhi Seal<br/>ID: CSC-RJ-JPR-8812", field_val),
            Paragraph("<b>Sanctioning Branch Acknowledgement:</b><br/><br/><br/>_______________________________<br/>Branch Manager Signature & Seal<br/><b>Baroda Rajasthan Kshetriya Gramin Bank</b>", field_val)
        ]
    ]
    t_sig = Table(sig_data, colWidths=[63 * mm, 64 * mm, 63 * mm])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sig)

    doc.build(story)
    print("1-Page DPR PDF successfully created at:", pdf_path, "Size:", os.path.getsize(pdf_path), "bytes")

if __name__ == "__main__":
    generate_dpr_pdf()

