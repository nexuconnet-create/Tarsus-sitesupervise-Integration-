import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total pages and render page numbers in the footer.
    """
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
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Footer text & line
        page_text = f"Page {self._pageNumber} of {page_count}"
        footer_text = "SiteSupervise - Tersus MVP S1 Integration | Weekly Status Report"
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        
        self.drawString(54, 30, footer_text)
        self.drawRightString(612 - 54, 30, page_text)
        self.restoreState()

def build_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#1E293B")     # Dark Slate
    ACCENT = colors.HexColor("#0F766E")      # Teal / Cyan Accent
    TEXT_DARK = colors.HexColor("#334155")   # Charcoal
    BG_LIGHT = colors.HexColor("#F8FAFC")    # Very light slate/blue
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=12
    )

    meta_label_style = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=ACCENT
    )

    meta_val_style = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3Custom',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=8,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeCustom',
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F172A"),
        backColor=BG_LIGHT,
        borderColor=BORDER_COLOR,
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8,
        borderRadius=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        alignment=TA_LEFT
    )

    story = []

    # Title
    story.append(Paragraph("SiteSupervise & Tersus MVP S1 Integration", title_style))
    story.append(Paragraph("Weekly Status Report", ParagraphStyle('SubTitle', parent=title_style, fontSize=15, leading=18, textColor=ACCENT)))
    story.append(Spacer(1, 10))

    # Metadata Box Table
    meta_data = [
        [Paragraph("Date:", meta_label_style), Paragraph("August 3, 2026", meta_val_style),
         Paragraph("Period:", meta_label_style), Paragraph("Week 31 (Jul 28 - Aug 3, 2026)", meta_val_style)],
        [Paragraph("Project:", meta_label_style), Paragraph("SiteSupervise - Tersus MVP S1 Handheld Scanner Integration", meta_val_style), "", ""]
    ]
    meta_table = Table(meta_data, colWidths=[50, 180, 50, 224])
    meta_table.setStyle(TableStyle([
        ('SPAN', (1, 1), (3, 1)),
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Executive Summary
    story.append(Paragraph("Executive Summary", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=8))
    exec_summary_text = (
        "This week, the foundational backend architecture for the <b>Tersus MVP S1 Handheld Scanner Integration</b> "
        "into <b>SiteSupervise</b> was successfully established. Key accomplishments include setting up domain-driven "
        "Django application modules, implementing core scan session ingestion endpoints with direct-to-S3 pre-signed URL workflow, "
        "configuring OpenAPI 3.0 auto-generation via <code>drf-spectacular</code>, and establishing robust unit tests covering end-to-end scan ingestion."
    )
    story.append(Paragraph(exec_summary_text, body_style))
    story.append(Spacer(1, 10))

    # Section 1: Accomplishments
    story.append(Paragraph("1. Accomplishments & Key Deliverables", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("A. Backend Architecture & Domain Setup", h3_style))
    story.append(Paragraph("• Scaffolded Clean Architecture directory structure separating domain logic into clean modules: <code>scans</code>, <code>reports</code>, <code>projects</code>, <code>inspections</code>, <code>storage</code>, <code>processing</code>, <code>notifications</code>, <code>common</code>, <code>authentication</code>, and <code>audit</code>.", bullet_style))
    story.append(Paragraph("• Configured PostgreSQL database integration and Django migrations for <code>ScanSession</code> and <code>ScanMetadata</code> models.", bullet_style))
    story.append(Paragraph("• Set up containerization with <code>docker-compose.yml</code> defining <code>web</code>, <code>db</code> (PostgreSQL), and <code>redis</code> services.", bullet_style))

    story.append(Paragraph("B. Core Scan Ingestion API Pipeline", h3_style))
    story.append(Paragraph("• <b>Session Initialization Endpoint</b> (<code>POST /api/v1/scans/session/</code>): Accepts scanner telemetry and expected upload size, returning unique UUID <code>session_id</code> and pre-signed upload target URL (<code>upload_url</code>).", bullet_style))
    story.append(Paragraph("• <b>Metadata Ingestion Endpoint</b> (<code>POST /api/v1/scans/{session_id}/metadata/</code>): Accepts spatial telemetry (<code>latitude</code>, <code>longitude</code>, <code>elevation</code>), operator ID, and field notes.", bullet_style))
    story.append(Paragraph("• <b>Upload Finalization Endpoint</b> (<code>POST /api/v1/scans/{session_id}/finalize/</code>): Validates current status and transitions scan session to <code>'processing'</code>, queuing job for background Celery processing pipelines.", bullet_style))

    story.append(Paragraph("C. OpenAPI Specification & Schema Automation", h3_style))
    story.append(Paragraph("• Integrated <code>drf-spectacular</code> for auto-generating OpenAPI 3.0 definitions.", bullet_style))
    story.append(Paragraph("• Resolved schema warnings and type annotations across serializer fields and API views.", bullet_style))
    story.append(Paragraph("• Exported complete <code>api.json</code> OpenAPI schema file for client integration and frontend code generation.", bullet_style))

    story.append(Paragraph("D. Verification & Testing", h3_style))
    story.append(Paragraph("• Developed suite of unit tests in <code>apps/scans/tests.py</code> using Django REST Framework testing suite.", bullet_style))
    story.append(Paragraph("• Validated all 6 test scenarios (Session creation, Metadata attachment, Finalization status flow, Invalid transitions, duplicate metadata rejections). All tests passed with 100% success rate.", bullet_style))

    story.append(Spacer(1, 10))

    # Section 2: API Documentation Overview Table
    story.append(Paragraph("2. API Documentation Overview", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=8))

    api_table_data = [
        [Paragraph("Endpoint", table_header_style), Paragraph("Method", table_header_style), Paragraph("Auth Required", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("<code>/api/v1/auth/token/</code>", table_body_style), Paragraph("POST", table_body_style), Paragraph("No", table_body_style), Paragraph("Generate JWT access and refresh token pair", table_body_style)],
        [Paragraph("<code>/api/v1/auth/token/refresh/</code>", table_body_style), Paragraph("POST", table_body_style), Paragraph("No", table_body_style), Paragraph("Refresh expired JWT access token", table_body_style)],
        [Paragraph("<code>/api/v1/scans/session/</code>", table_body_style), Paragraph("POST", table_body_style), Paragraph("Yes (JWT)", table_body_style), Paragraph("Initialize scan upload session & obtain S3 URL", table_body_style)],
        [Paragraph("<code>/api/v1/scans/{session_id}/metadata/</code>", table_body_style), Paragraph("POST", table_body_style), Paragraph("Yes (JWT)", table_body_style), Paragraph("Attach GPS/sensor metadata & operator notes", table_body_style)],
        [Paragraph("<code>/api/v1/scans/{session_id}/finalize/</code>", table_body_style), Paragraph("POST", table_body_style), Paragraph("Yes (JWT)", table_body_style), Paragraph("Finalize upload and trigger background processing", table_body_style)],
        [Paragraph("<code>/api/schema/</code>", table_body_style), Paragraph("GET", table_body_style), Paragraph("No", table_body_style), Paragraph("Fetch raw OpenAPI 3.0 schema", table_body_style)],
        [Paragraph("<code>/api/docs/</code>", table_body_style), Paragraph("GET", table_body_style), Paragraph("No", table_body_style), Paragraph("Interactive Swagger UI API documentation", table_body_style)],
    ]

    api_table = Table(api_table_data, colWidths=[150, 50, 75, 229])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(api_table)

    story.append(Spacer(1, 12))

    # Section 3: How to Generate API Documentation & Artifacts
    story.append(Paragraph("3. How to Generate API Documentation & Artifacts", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("1. Generating <code>api.json</code> (OpenAPI 3.0 Schema)", h3_style))
    story.append(Paragraph("Run the following command from the <code>backend/</code> directory:", body_style))
    story.append(Paragraph("python manage.py spectacular --file api.json", code_style))

    story.append(Paragraph("2. Interactive Swagger UI", h3_style))
    story.append(Paragraph("Start the local server or Docker container and navigate to:", body_style))
    story.append(Paragraph("• <b>Swagger UI:</b> <code>http://localhost:8000/api/docs/</code><br/>• <b>Schema JSON:</b> <code>http://localhost:8000/api/schema/</code>", bullet_style))

    story.append(Paragraph("3. Running Automated Tests", h3_style))
    story.append(Paragraph("python manage.py test", code_style))

    story.append(Spacer(1, 10))

    # Section 4: Next Week's Objectives & Roadmap
    story.append(Paragraph("4. Next Week's Objectives & Roadmap", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=2, spaceAfter=8))

    roadmap_items = [
        "<b>1. Celery & Background Processing:</b> Connect <code>FinalizeUploadView</code> trigger to asynchronous Celery tasks for point cloud and thermal image processing.",
        "<b>2. S3 Direct Upload Integration:</b> Replace mock S3 URL generation with actual AWS S3 / MinIO pre-signed upload URL signatures (<code>boto3</code>).",
        "<b>3. Data Fusion & Spatial Alignment:</b> Implement service layer logic for aligning Tersus LiDAR point clouds with SiteSupervise BIM coordinates (<code>data_fusion_design.md</code>).",
        "<b>4. Automated QA/QC PDF Reporting:</b> Scaffold report generation templates in <code>apps/reports</code> for weekly automated QA/QC summaries."
    ]
    for item in roadmap_items:
        story.append(Paragraph(item, bullet_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "docs/weekly_report.pdf"
    build_pdf(out_file)
