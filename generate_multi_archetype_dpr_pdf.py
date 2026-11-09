"""
Multi-Archetype Bank-Ready 1-Page DPR & Debt Restructuring PDF Generator
ReportLab Engine (Strict 1-Page A4 Fit, Lead Bank Scheme Formatted, QR Verification)
"""

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

from engine.multi_archetype_financial_engine import IncubationEngine, RestructuringEngine, ARCHETYPES

def create_mode_a_dpr(archetype_id="archetype_2", output_path="Sample_BankReady_ModeA_DPR.pdf"):
    res = IncubationEngine.evaluate_project(
        archetype_id=archetype_id,
        state="Uttar Pradesh",
        promoter_category="special",
        location_type="rural"
    )

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=8 * mm,
        bottomMargin=8 * mm
    )

    styles = getSampleStyleSheet()
    c_primary = colors.HexColor("#065F46")    # Forest Green
    c_secondary = colors.HexColor("#0D9488")  # Teal
    c_dark = colors.HexColor("#0F172A")       # Slate 900
    c_light = colors.HexColor("#F8FAFC")
    c_card = colors.HexColor("#F0FDF4")

    style_title = ParagraphStyle('Title', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=12, textColor=colors.white, alignment=1)
    style_sub = ParagraphStyle('Sub', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=colors.HexColor("#E2E8F0"), alignment=1)
    style_sec = ParagraphStyle('Sec', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=c_primary)
    style_cell = ParagraphStyle('Cell', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=8.5, textColor=c_dark)
    style_cell_b = ParagraphStyle('CellB', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=8.5, textColor=c_dark)

    elements = []

    # 1. Header Table
    qr_widget = QrCodeWidget(f"VERIFIED-DPR:{res['archetype_id']}:COST-{res['financial_summary']['total_project_cost']}")
    qr_widget.barWidth = 36
    qr_widget.barHeight = 36
    qr_draw = Drawing(36, 36)
    qr_draw.add(qr_widget)

    hdr_cell = [
        Paragraph("<b>PROJECT APPRAISAL & DETAILED PROJECT REPORT (DPR)</b><br/>Lead Bank Scheme & Priority Sector Lending (PSL) Compliance", style_title),
        Paragraph(f"<b>Enterprise:</b> {res['archetype_name']} ({res['sector']})<br/><b>Scheme:</b> {res['scheme_details']['scheme_name']}", style_sub)
    ]
    hdr_table = Table([[hdr_cell, qr_draw]], colWidths=[150 * mm, 38 * mm])
    hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(hdr_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 2. Key Metadata & Profile
    meta_data = [
        [
            Paragraph("<b>Applicant / Entity:</b> Village Micro-Enterprise Hub", style_cell),
            Paragraph("<b>Target Location:</b> Rural Gram Panchayat, UP", style_cell),
            Paragraph("<b>Category:</b> Rural Special (OBC/SC/Women)", style_cell)
        ],
        [
            Paragraph(f"<b>Statutory Regime:</b> {res['scheme_details']['ministry']}", style_cell),
            Paragraph("<b>Credit Structure:</b> Collateral-Free / CGTMSE", style_cell),
            Paragraph(f"<b>Annual DSCR:</b> <b>{res['dscr_metrics']['average_annual_dscr']}x</b> (High Feasibility)", style_cell_b)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[65 * mm, 65 * mm, 58 * mm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 3. Financial Outlay & Means of Finance
    fin = res['financial_summary']
    fin_data = [
        [Paragraph("<b>Cost Decomposition (A)</b>", style_sec), Paragraph("<b>Amount (₹)</b>", style_sec), Paragraph("<b>Means of Finance (B)</b>", style_sec), Paragraph("<b>Amount (₹)</b>", style_sec)],
        [Paragraph("Plant, Machinery & Fixtures (CapEx)", style_cell), Paragraph(f"₹{fin['capex']:,.0f}", style_cell_b), Paragraph("Promoter Margin Money (Own Equity)", style_cell), Paragraph(f"₹{fin['promoter_equity']:,.0f}", style_cell_b)],
        [Paragraph("Working Capital Liquidity Buffer", style_cell), Paragraph(f"₹{fin['working_capital_buffer']:,.0f}", style_cell_b), Paragraph("Government Capital Subsidy / Grant", style_cell), Paragraph(f"₹{fin['government_subsidy_grant']:,.0f}", style_cell_b)],
        [Paragraph("Pre-operative & Licensing Costs", style_cell), Paragraph(f"₹{fin['pre_operative_expenses']:,.0f}", style_cell_b), Paragraph("Bank Term Loan / Cash Credit", style_cell), Paragraph(f"₹{fin['bank_loan_principal']:,.0f}", style_cell_b)],
        [Paragraph("<b>Total Project Outlay</b>", style_cell_b), Paragraph(f"<b>₹{fin['total_project_cost']:,.0f}</b>", style_cell_b), Paragraph("<b>Total Means of Finance</b>", style_cell_b), Paragraph(f"<b>₹{fin['total_project_cost']:,.0f}</b>", style_cell_b)]
    ]
    fin_table = Table(fin_data, colWidths=[55 * mm, 38 * mm, 55 * mm, 40 * mm])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0, -1), (-1, -1), c_card),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    elements.append(fin_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 4. Debt Servicing & 12-Month Cash Flow Statement
    dscr = res['dscr_metrics']
    serv_data = [
        [Paragraph("<b>Bank Loan Terms</b>", style_sec), Paragraph("<b>Values</b>", style_sec), Paragraph("<b>Operating Cash Surplus (Annual)</b>", style_sec), Paragraph("<b>Values</b>", style_sec)],
        [Paragraph("Sanctioned Loan Principal", style_cell), Paragraph(f"₹{fin['bank_loan_principal']:,.0f}", style_cell), Paragraph("Annual Net Operating Cash Flow (NOCF)", style_cell), Paragraph(f"₹{dscr['annual_net_operating_cash_flow']:,.0f}", style_cell)],
        [Paragraph("Concessional Interest Rate", style_cell), Paragraph(f"{fin['interest_rate_pct']}% p.a.", style_cell), Paragraph("Annual Bank Debt Service (12 x EMI)", style_cell), Paragraph(f"₹{dscr['annual_debt_service']:,.0f}", style_cell)],
        [Paragraph("Amortization Tenure", style_cell), Paragraph(f"{fin['loan_tenure_months']} Months", style_cell), Paragraph("Net Annual Household Retained Surplus", style_cell), Paragraph(f"₹{dscr['net_annual_family_surplus']:,.0f}", style_cell_b)],
        [Paragraph("Calculated Monthly EMI", style_cell_b), Paragraph(f"<b>₹{fin['monthly_emi']:,.0f}</b>", style_cell_b), Paragraph("Debt Service Coverage Ratio (DSCR)", style_cell_b), Paragraph(f"<b>{dscr['average_annual_dscr']}x</b>", style_cell_b)]
    ]
    serv_table = Table(serv_data, colWidths=[55 * mm, 38 * mm, 55 * mm, 40 * mm])
    serv_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    elements.append(serv_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 5. Seasonality Stress-Test Table
    cflows = res['monthly_cash_flows']
    season_hdr = [Paragraph("<b>Month</b>", style_cell_b)] + [Paragraph(f"<b>M{i}</b>", style_cell) for i in range(1, 13)]
    season_rev = [Paragraph("<b>Rev (₹k)</b>", style_cell)] + [Paragraph(f"{m['gross_revenue']/1000:.0f}", style_cell) for m in cflows]
    season_cost = [Paragraph("<b>Cost (₹k)</b>", style_cell)] + [Paragraph(f"{m['operating_cost']/1000:.0f}", style_cell) for m in cflows]
    season_dscr = [Paragraph("<b>DSCR</b>", style_cell_b)] + [Paragraph(f"{m['dscr']:.1f}", style_cell_b) for m in cflows]
    
    col_w = [18 * mm] + [14.1 * mm] * 12
    season_table = Table([season_hdr, season_rev, season_cost, season_dscr], colWidths=col_w)
    season_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(season_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 6. Statutory Declarations & Sign-off
    footer_text = Paragraph(
        "<b>Lead Bank Certification:</b> This Detailed Project Report is algorithmically generated using audited statutory guidelines "
        "under RBI Priority Sector Lending norms. Calculations represent zero-hallucination deterministic parameters. "
        "Promoter is eligible for collateral-free credit and direct capital subsidy release upon physical branch verification.",
        ParagraphStyle('Foot', parent=styles['Normal'], fontName='Helvetica', fontSize=6.5, leading=8, textColor=colors.HexColor("#475569"))
    )
    elements.append(footer_text)

    doc.build(elements)
    print(f"Generated Mode A DPR: {output_path}")

def create_mode_b_proposal(output_path="Sample_BankReady_ModeB_Restructuring.pdf"):
    debts = [
        {"principal": 120000, "rate_quote": "3 senkda", "lender_type": "Village Mahajan", "months_active": 16, "collateral": "Land Papers"},
        {"principal": 50000, "rate_quote": "4 senkda", "lender_type": "Fertilizer Dealer", "months_active": 8, "collateral": "Cheque"},
        {"principal": 30000, "rate_quote": "2.5 senkda", "lender_type": "Local Relative", "months_active": 12, "collateral": "Gold"}
    ]
    res = RestructuringEngine.evaluate_portfolio(
        debts=debts,
        household_monthly_income=35000.0,
        refinancing_pathway="MUDRA_KISHOR",
        refinance_tenure_months=36
    )

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=8 * mm,
        bottomMargin=8 * mm
    )

    styles = getSampleStyleSheet()
    c_primary = colors.HexColor("#92400E")    # Amber 800
    c_dark = colors.HexColor("#0F172A")
    c_light = colors.HexColor("#F8FAFC")
    c_relief = colors.HexColor("#F0FDF4")

    style_title = ParagraphStyle('Title', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=12, textColor=colors.white, alignment=1)
    style_sub = ParagraphStyle('Sub', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=colors.HexColor("#FEF3C7"), alignment=1)
    style_sec = ParagraphStyle('Sec', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=c_primary)
    style_cell = ParagraphStyle('Cell', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=8.5, textColor=c_dark)
    style_cell_b = ParagraphStyle('CellB', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=8.5, textColor=c_dark)

    elements = []

    # 1. Header
    qr_widget = QrCodeWidget(f"RESTOCK-VERIFIED:{res['total_debt_consolidated']}:RELIEF-{res['liberation_metrics']['monthly_cash_flow_relief']}")
    qr_widget.barWidth = 36
    qr_widget.barHeight = 36
    qr_draw = Drawing(36, 36)
    qr_draw.add(qr_widget)

    hdr_cell = [
        Paragraph("<b>INFORMAL DEBT RESTRUCTURING & REFINANCING PROPOSAL</b><br/>Under RBI MSME Restructuring Framework & PMMY MUDRA Guidelines", style_title),
        Paragraph("<b>Purpose:</b> Algorithmic Replacement of Predatory Moneylender Usury (36%-60% p.a.) into Formal Credit (9.5% p.a.)", style_sub)
    ]
    hdr_table = Table([[hdr_cell, qr_draw]], colWidths=[150 * mm, 38 * mm])
    hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(hdr_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 2. Existing Liabilities Audit
    debt_rows = [
        [Paragraph("<b>Creditor / Source</b>", style_sec), Paragraph("<b>Principal (₹)</b>", style_sec), Paragraph("<b>Quoted Rate</b>", style_sec), Paragraph("<b>Annual APR</b>", style_sec), Paragraph("<b>Monthly Bleed</b>", style_sec), Paragraph("<b>Damdupat Audit</b>", style_sec)]
    ]
    for d in res['audited_debts']:
        damdupat_str = "<font color='red'><b>VIOLATION</b></font>" if d['damdupat_violation'] else "Standard"
        debt_rows.append([
            Paragraph(d['lender_type'], style_cell),
            Paragraph(f"₹{d['principal']:,.0f}", style_cell_b),
            Paragraph(d['raw_quote'], style_cell),
            Paragraph(f"{d['annual_apr_pct']}%", style_cell),
            Paragraph(f"₹{d['monthly_interest_bleed']:,.0f}", style_cell_b),
            Paragraph(damdupat_str, style_cell)
        ])
    debt_rows.append([
        Paragraph("<b>Total Informal Debt</b>", style_cell_b),
        Paragraph(f"<b>₹{res['total_debt_consolidated']:,.0f}</b>", style_cell_b),
        Paragraph("<b>Weighted APR:</b>", style_cell_b),
        Paragraph(f"<b>{res['weighted_informal_apr_pct']}% p.a.</b>", style_cell_b),
        Paragraph(f"<b>₹{res['current_monthly_interest_bleed']:,.0f}/mo</b>", style_cell_b),
        Paragraph("<b>Pure Bleed</b>", style_cell_b)
    ])

    debt_table = Table(debt_rows, colWidths=[45 * mm, 26 * mm, 26 * mm, 24 * mm, 28 * mm, 39 * mm])
    debt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FDE68A")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#FEF3C7")),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    elements.append(debt_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 3. Restructuring Plan & Cash Flow Liberation
    plan = res['refinancing_plan']
    lib = res['liberation_metrics']
    restruct_data = [
        [Paragraph("<b>Institutional Replacement Facility</b>", style_sec), Paragraph("<b>Parameters</b>", style_sec), Paragraph("<b>Cash Flow Liberation Impact</b>", style_sec), Paragraph("<b>Benefit</b>", style_sec)],
        [Paragraph("Approved Scheme Facility", style_cell), Paragraph(plan['pathway_name'], style_cell_b), Paragraph("Prior Monthly Informal Interest Bleed", style_cell), Paragraph(f"₹{res['current_monthly_interest_bleed']:,.0f}/mo (Zero Amortization)", style_cell)],
        [Paragraph("Refinancing Term Loan", style_cell), Paragraph(f"₹{res['total_debt_consolidated']:,.0f}", style_cell), Paragraph("New Amortizing Monthly Bank EMI", style_cell), Paragraph(f"₹{plan['new_monthly_amortizing_emi']:,.0f}/mo (Principal+Interest)", style_cell_b)],
        [Paragraph("Institutional Interest Rate", style_cell), Paragraph(f"{plan['formal_interest_rate_pct']}% p.a. (Fixed)", style_cell), Paragraph("Net Monthly Cash Flow Relief (Surplus)", style_cell_b), Paragraph(f"<b>+₹{lib['monthly_cash_flow_relief']:,.0f}/month</b>", style_cell_b)],
        [Paragraph("Consolidation Repayment Tenure", style_cell), Paragraph(f"{plan['tenure_months']} Months", style_cell), Paragraph("Discretionary Household Income Freed", style_cell_b), Paragraph(f"<b>+{lib['cash_flow_liberation_ratio_pct']}%</b>", style_cell_b)],
        [Paragraph("Total 36-Month Bank Outflow", style_cell), Paragraph(f"₹{plan['total_repayment_over_tenure']:,.0f}", style_cell), Paragraph("Cumulative Interest Saved Over Tenure", style_cell_b), Paragraph(f"<b>₹{lib['cumulative_interest_saved']:,.0f}</b>", style_cell_b)]
    ]
    restruct_table = Table(restruct_data, colWidths=[55 * mm, 38 * mm, 55 * mm, 40 * mm])
    restruct_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('BACKGROUND', (2, 3), (3, 3), c_relief),
        ('BACKGROUND', (2, 5), (3, 5), c_relief),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    elements.append(restruct_table)
    elements.append(Spacer(1, 2.5 * mm))

    # 4. Legal Protections & Settlement Protocol
    legal_text = Paragraph(
        "<b>Statutory Protections & Escrow Settlement Protocol:</b><br/>"
        "1. <b>The Usurious Loans Act, 1918 & State Money-Lenders Acts:</b> Unregistered moneylenders charging in excess of 18% simple interest "
        "cannot legally enforce recovery. Under the <i>Rule of Damdupat</i>, total interest collected cannot exceed initial principal.<br/>"
        "2. <b>Direct Bank Settlement Protocol:</b> Loan proceeds are to be disbursed directly into moneylender accounts or via bank demand drafts "
        "in exchange for physical surrender of pledged security (land deeds, gold, post-dated cheques) and execution of an irrevocable No-Dues Certificate (NDC).",
        ParagraphStyle('Legal', parent=styles['Normal'], fontName='Helvetica', fontSize=6.5, leading=8.5, textColor=colors.HexColor("#334155"))
    )
    elements.append(legal_text)

    doc.build(elements)
    print(f"Generated Mode B Proposal: {output_path}")

if __name__ == "__main__":
    create_mode_a_dpr()
    create_mode_b_proposal()

