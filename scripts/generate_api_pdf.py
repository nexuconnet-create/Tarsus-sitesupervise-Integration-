import os
import sys
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
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
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        footer_text = "SiteSupervise - Tersus MVP S1 Integration | OpenAPI Specification"
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        
        self.drawString(54, 30, footer_text)
        self.drawRightString(612 - 54, 30, page_text)
        self.restoreState()

def build_api_pdf(schema_filepath, output_filename):
    with open(schema_filepath, 'r', encoding='utf-8') as f:
        schema = json.load(f)

    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    PRIMARY = colors.HexColor("#1E293B")
    ACCENT = colors.HexColor("#0F766E")
    TEXT_DARK = colors.HexColor("#334155")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'CodeCustom',
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A"),
        backColor=BG_LIGHT,
        borderColor=BORDER_COLOR,
        borderWidth=0.5,
        borderPadding=5,
        spaceBefore=3,
        spaceAfter=6
    )

    story = []

    # Title & Metadata
    title_text = schema.get('info', {}).get('title', 'SiteSupervise Tersus API Specification')
    version_text = schema.get('info', {}).get('version', '1.0.0')
    description_text = schema.get('info', {}).get('description', '')

    story.append(Paragraph(title_text, title_style))
    story.append(Paragraph(f"<b>Version:</b> {version_text} | <b>OpenAPI Standard:</b> {schema.get('openapi', '3.0.3')}", ParagraphStyle('Sub', fontName='Helvetica', fontSize=10, textColor=ACCENT, spaceAfter=8)))
    if description_text:
        story.append(Paragraph(description_text, body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=4, spaceAfter=12))

    # Endpoints Section
    story.append(Paragraph("API Endpoints & Operation Specifications", title_style))
    story.append(Spacer(1, 6))

    paths = schema.get('paths', {})
    for path_url, methods in paths.items():
        for method_name, method_info in methods.items():
            op_id = method_info.get('operationId', '')
            summary = method_info.get('description', method_info.get('summary', ''))
            tags = ", ".join(method_info.get('tags', []))
            
            method_bg = colors.HexColor("#0284C7") if method_name.upper() == 'GET' else colors.HexColor("#0D9488")
            
            header_text = f"<b>{method_name.upper()}</b> {path_url}"
            story.append(Paragraph(header_text, h2_style))
            
            if summary:
                story.append(Paragraph(f"<b>Description:</b> {summary}", body_style))
            if op_id:
                story.append(Paragraph(f"<b>Operation ID:</b> <code>{op_id}</code>", body_style))
            
            # Responses
            responses = method_info.get('responses', {})
            resp_str = ", ".join([f"{code}" for code in responses.keys()])
            story.append(Paragraph(f"<b>Response Status Codes:</b> <code>{resp_str}</code>", body_style))
            
            story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=4, spaceAfter=8))

    # Schemas Section
    schemas = schema.get('components', {}).get('schemas', {})
    if schemas:
        story.append(Spacer(1, 10))
        story.append(Paragraph("Data Schemas & Models", title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceBefore=4, spaceAfter=10))

        for schema_name, schema_def in schemas.items():
            story.append(Paragraph(f"Schema: <code>{schema_name}</code>", h2_style))
            props = schema_def.get('properties', {})
            req = schema_def.get('required', [])
            
            if props:
                prop_rows = [
                    [Paragraph("Field", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
                     Paragraph("Type", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white)),
                     Paragraph("Required", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white))]
                ]
                for prop_key, prop_val in props.items():
                    p_type = prop_val.get('type', prop_val.get('$ref', 'object').split('/')[-1])
                    p_req = "Yes" if prop_key in req else "No"
                    prop_rows.append([
                        Paragraph(f"<code>{prop_key}</code>", body_style),
                        Paragraph(f"<code>{p_type}</code>", body_style),
                        Paragraph(p_req, body_style)
                    ])
                
                prop_table = Table(prop_rows, colWidths=[200, 150, 154])
                prop_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
                    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(prop_table)
                story.append(Spacer(1, 8))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated API PDF: {output_filename}")

if __name__ == "__main__":
    schema_path = sys.argv[1] if len(sys.argv) > 1 else "api.json"
    output_path = sys.argv[2] if len(sys.argv) > 2 else "docs/api_documentation.pdf"
    build_api_pdf(schema_path, output_path)
