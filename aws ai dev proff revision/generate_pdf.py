#!/usr/bin/env python3
"""Build AIP-C01-combined-revision.pdf from lessons 01–13.

Run: python3 "aws ai dev proff revision/generate_pdf.py"
Dependencies: fpdf2, markdown-it-py. Fonts: Arial, Courier New, Arial Unicode
from macOS /System/Library/Fonts/Supplemental.

Markdown is parsed into blocks before layout. Tables cannot consume headings,
and each list/checklist item is laid out independently. The numbered source
Markdown documents are never modified.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from fpdf.fonts import FontFace
from markdown_it import MarkdownIt
from markdown_it.tree import SyntaxTreeNode

SOURCE_DIR = Path(__file__).resolve().parent
OUTPUT = SOURCE_DIR / "AIP-C01-combined-revision.pdf"
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
PARSER = MarkdownIt("commonmark").enable("table")

NAVY = (18, 62, 110)
BLUE = (38, 92, 145)
INK = (32, 38, 44)
MUTED = (95, 105, 115)
PALE = (237, 243, 249)
BORDER = (193, 204, 216)
BODY_SIZE = 10
BODY_LINE = 5.25
PARAGRAPH_GAP = 2.5
LIST_GAP = 1.6
HEADING_GAP = 3
TABLE_SIZE = 8.8
TABLE_LINE = 4.5
TABLE_PADDING = 1.5


def inline_text(node: SyntaxTreeNode, styled: bool = False) -> str:
    """Extract inline content without losing block boundaries or code text."""
    if node.type in {"text", "code_inline"}:
        return node.content
    if node.type in {"softbreak", "hardbreak"}:
        return "\n"
    content = "".join(inline_text(child, styled) for child in node.children or [])
    if styled and node.type == "strong":
        return f"**{content}**"
    if styled and node.type == "em":
        return f"__{content}__"
    if node.type == "link":
        href = str(node.attrs.get("href", ""))
        if styled:
            return f"[{content}]({href})"
        return content if content == href else f"{content} ({href})"
    return content


def table_rows(node: SyntaxTreeNode, styled: bool = False) -> list[list[str]]:
    return [
        [inline_text(cell, styled) for cell in row.children or []]
        for section in node.children or []
        for row in section.children or []
        if row.type == "tr"
    ]


def is_checklist(node: SyntaxTreeNode) -> bool:
    return node.type == "bullet_list" and bool(node.children) and all(
        item.children
        and item.children[0].type == "paragraph"
        and re.match(r"^\[[ xX]\]\s+", inline_text(item.children[0]))
        for item in node.children
    )


@dataclass
class Lesson:
    title: str
    nodes: list[SyntaxTreeNode]


def load_lessons() -> list[Lesson]:
    paths = sorted(SOURCE_DIR.glob("[0-9][0-9]-*.md"))
    if [path.name[:2] for path in paths] != [f"{i:02d}" for i in range(1, 14)]:
        raise ValueError("Expected one Markdown document for each lesson 01–13")
    lessons = []
    for path in paths:
        root = SyntaxTreeNode(PARSER.parse(path.read_text(encoding="utf-8")))
        nodes = list(root.children or [])
        if not nodes or nodes[0].type != "heading" or nodes[0].tag != "h1":
            raise ValueError(f"Missing lesson title: {path.name}")
        lessons.append(Lesson(inline_text(nodes[0]), nodes[1:]))
    return lessons


class RevisionPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.chapter_title = ""
        self.set_margins(16, 25, 16)
        self.set_auto_page_break(True, margin=18)
        for style, filename in (
            ("", "Arial.ttf"),
            ("B", "Arial Bold.ttf"),
            ("I", "Arial Italic.ttf"),
            ("BI", "Arial Bold Italic.ttf"),
        ):
            self.add_font("Body", style, FONT_DIR / filename)
        self.add_font("Mono", "", FONT_DIR / "Courier New.ttf")
        self.add_font("Unicode", "", FONT_DIR / "Arial Unicode.ttf")
        self.set_fallback_fonts(["Unicode"], exact_match=False)
        self.alias_nb_pages()
        self.set_title("AIP-C01 Combined Revision Notes")
        self.set_subject("AWS Certified Generative AI Developer – Professional")

    def header(self):
        if not self.chapter_title:
            return
        # add_page() calls header() before any body/table continuation is drawn.
        # Restore the cursor: leaving it at y=9 would put content in the header.
        body_x, body_y = self.get_x(), self.get_y()
        self.set_font("Body", "", 8)
        self.set_text_color(*MUTED)
        self.set_xy(self.l_margin, 9)
        self.cell(40, 4, "AIP-C01 Revision")
        self.set_xy(self.l_margin + 43, 9)
        self.cell(self.epw - 43, 4, self.chapter_title, align="R")
        self.set_draw_color(*BORDER)
        self.set_line_width(0.2)
        self.line(self.l_margin, 16, self.w - self.r_margin, 16)
        self.set_xy(body_x, body_y)

    def footer(self):
        self.set_y(-12)
        self.set_font("Body", "", 8)
        self.set_text_color(*MUTED)
        self.cell(self.epw, 5, f"Page {self.page_no()} of {{nb}}", align="C")


class Renderer:
    def __init__(self):
        self.pdf = RevisionPDF()
        self.chapter_pages: dict[str, int] = {}

    def ensure(self, height: float):
        if self.pdf.get_y() + height > self.pdf.page_break_trigger:
            self.pdf.add_page()

    def text_height(self, text: str, width: float, size=BODY_SIZE, style="", line=BODY_LINE, styled=True):
        self.pdf.set_font("Body", style, size)
        lines = self.pdf.multi_cell(width, line, text, markdown=styled, dry_run=True, output="LINES")
        return max(1, len(lines)) * line

    def paragraph(self, text: str, size=BODY_SIZE, style="", color=INK, line=BODY_LINE, after=PARAGRAPH_GAP, styled=True):
        height = self.text_height(text, self.pdf.epw, size, style, line, styled)
        if height + after <= self.pdf.page_break_trigger - self.pdf.t_margin:
            self.ensure(height + after)
        self.pdf.set_x(self.pdf.l_margin)
        self.pdf.set_font("Body", style, size)
        self.pdf.set_text_color(*color)
        self.pdf.multi_cell(
            self.pdf.epw, line, text, markdown=styled,
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )
        self.pdf.ln(after)

    def list_item(self, text: str, marker: str, depth: int):
        left = self.pdf.l_margin + 5 * depth
        width = self.pdf.epw - 5 * depth - 7
        height = self.text_height(text, width) + LIST_GAP
        self.ensure(height)  # break before the marker, not after drawing it
        start_y = self.pdf.get_y()
        self.pdf.set_font("Body", "", BODY_SIZE)
        self.pdf.set_text_color(*INK)
        self.pdf.set_xy(left, start_y)
        self.pdf.cell(7, BODY_LINE, marker)
        self.pdf.set_xy(left + 7, start_y)
        self.pdf.multi_cell(
            width, BODY_LINE, text, markdown=True,
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )
        self.pdf.ln(LIST_GAP)

    def column_widths(self, count: int) -> list[float]:
        weights = {2: (36, 64), 3: (26, 38, 36), 4: (20, 28, 24, 28)}.get(count, (1,) * count)
        return [self.pdf.epw * weight / sum(weights) for weight in weights]

    def row_height(self, cells: list[str], header: bool) -> float:
        widths = self.column_widths(len(cells))
        return max(
            self.text_height(cell, width - 2 * TABLE_PADDING, TABLE_SIZE, "B" if header else "", TABLE_LINE)
            for cell, width in zip(cells, widths)
        ) + 2 * TABLE_PADDING

    def minimum_height(self, node: SyntaxTreeNode) -> float:
        if node.type == "table":
            rows = table_rows(node, styled=True)
            return self.row_height(rows[0], True) + (self.row_height(rows[1], False) if len(rows) > 1 else 0)
        if node.type == "paragraph":
            return min(self.text_height(inline_text(node, True), self.pdf.epw), 3 * BODY_LINE)
        if node.type in {"bullet_list", "ordered_list"} and node.children:
            first = node.children[0].children[0]
            return self.text_height(inline_text(first, True), self.pdf.epw - 7) + LIST_GAP
        if node.type in {"fence", "code_block"}:
            return min(len(node.content.splitlines()) * 4.6 + 6, 20)
        return 12

    def render_table(self, node: SyntaxTreeNode):
        rows = table_rows(node, styled=True)
        if not rows or len({len(row) for row in rows}) != 1:
            raise ValueError("Malformed Markdown table")
        self.ensure(self.minimum_height(node))
        self.pdf.set_font("Body", "", TABLE_SIZE)
        self.pdf.set_text_color(*INK)
        self.pdf.set_fill_color(255, 255, 255)
        self.pdf.set_draw_color(*BORDER)
        self.pdf.set_line_width(0.2)
        self.pdf.set_x(self.pdf.l_margin)
        with self.pdf.table(
            width=self.pdf.epw,
            col_widths=self.column_widths(len(rows[0])),
            line_height=TABLE_LINE,
            padding=TABLE_PADDING,
            text_align="LEFT",
            markdown=True,
            borders_layout="ALL",
            repeat_headings=1,
            headings_style=FontFace(family="Body", emphasis="B", size_pt=TABLE_SIZE, color=NAVY, fill_color=PALE),
        ) as table:
            for cells in rows:
                row = table.row()
                for cell in cells:
                    row.cell(cell)
        self.pdf.set_x(self.pdf.l_margin)
        self.pdf.ln(4)

    def render_code(self, node: SyntaxTreeNode):
        self.pdf.set_font("Mono", "", 8)
        wrapped = []
        for line in node.content.rstrip("\n").splitlines():
            wrapped.extend(self.pdf.multi_cell(self.pdf.epw - 6, 4.6, line or " ", dry_run=True, output="LINES"))
        height = len(wrapped) * 4.6 + 6
        self.ensure(min(height, self.pdf.page_break_trigger - self.pdf.t_margin))
        self.pdf.set_draw_color(*BORDER)
        self.pdf.set_fill_color(*PALE)
        self.pdf.set_text_color(*INK)
        y = self.pdf.get_y()
        self.pdf.rect(self.pdf.l_margin, y, self.pdf.epw, height, style="DF")
        self.pdf.set_xy(self.pdf.l_margin + 3, y + 3)
        self.pdf.multi_cell(
            self.pdf.epw - 6, 4.6, "\n".join(wrapped),
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )
        self.pdf.set_y(y + height + 4)

    def render_list(self, node: SyntaxTreeNode, depth=0):
        start = int(node.attrs.get("start", 1))
        for number, item in enumerate(node.children or [], start):
            first = True
            for child in item.children or []:
                if child.type == "paragraph":
                    text = inline_text(child, styled=True)
                    check = re.match(r"^\[([ xX])\]\s+", text)
                    if check:
                        marker = "☐" if check.group(1) == " " else "☑"
                        text = text[check.end():]
                    else:
                        marker = f"{number}." if node.type == "ordered_list" else "•"
                    self.list_item(text, marker if first else "", depth)
                    first = False
                elif child.type in {"bullet_list", "ordered_list"}:
                    self.render_list(child, depth + 1)
                else:
                    self.render_blocks([child])
        if depth == 0:
            self.pdf.ln(1)

    def render_blocks(self, nodes: list[SyntaxTreeNode]):
        for index, node in enumerate(nodes):
            following = nodes[index + 1] if index + 1 < len(nodes) else None
            if node.type == "heading":
                text = inline_text(node)
                size = 12.4 if node.tag == "h2" else 10.8
                height = self.text_height(text, self.pdf.epw, size, "B", 6.2, styled=False) + 2 * HEADING_GAP
                reserve = self.minimum_height(following) if following else 0
                if following and is_checklist(following):
                    reserve = sum(
                        self.text_height(re.sub(r"^\[[ xX]\]\s+", "", inline_text(item.children[0], True)), self.pdf.epw - 7) + LIST_GAP
                        for item in following.children
                    ) + 1
                    for trailing in nodes[index + 2:]:
                        if trailing.type != "paragraph" or not inline_text(trailing).startswith(("Source:", "Sources:")):
                            break
                        reserve += self.text_height(inline_text(trailing, True), self.pdf.epw) + PARAGRAPH_GAP
                self.ensure(height + reserve)
                if self.pdf.get_y() > self.pdf.t_margin + 1:
                    self.pdf.ln(HEADING_GAP)
                self.pdf.start_section(text, level=1 if node.tag == "h2" else 2)
                self.paragraph(text, size=size, style="B", color=BLUE if node.tag == "h2" else INK, line=6.2, after=HEADING_GAP, styled=False)
            elif node.type == "paragraph":
                self.paragraph(inline_text(node, styled=True))
            elif node.type in {"bullet_list", "ordered_list"}:
                self.render_list(node)
            elif node.type == "table":
                self.render_table(node)
            elif node.type in {"fence", "code_block"}:
                self.render_code(node)
            elif node.type == "blockquote":
                self.render_blocks(list(node.children or []))
            elif node.type == "hr":
                self.ensure(6)
                self.pdf.set_draw_color(*BORDER)
                self.pdf.line(self.pdf.l_margin, self.pdf.get_y(), self.pdf.w - self.pdf.r_margin, self.pdf.get_y())
                self.pdf.ln(6)
            else:
                raise ValueError(f"Unsupported Markdown block: {node.type}")

    def cover(self):
        self.pdf.add_page()
        self.pdf.set_fill_color(*NAVY)
        self.pdf.rect(0, 0, self.pdf.w, 94, style="F")
        self.pdf.set_xy(16, 30)
        self.paragraph("AWS Certified Generative AI\nDeveloper – Professional", size=23, style="B", color=(255, 255, 255), line=11, after=6, styled=False)
        self.paragraph("AIP-C01 · Combined Revision Notes", size=14, color=(222, 234, 247), line=8, styled=False)
        self.pdf.set_y(113)
        self.paragraph("All 13 lessons in one document", size=16, style="B", color=NAVY, line=8, after=6, styled=False)
        for text in (
            "Bedrock inference, economics, Knowledge Bases, agents, and guardrails",
            "Prompt management, evaluation, customization, and vector stores",
            "Integration, security, observability, SageMaker, and the recognition sweep",
            "Decision rules, troubleshooting patterns, and hands-on checklists",
        ):
            self.list_item(text, "•", 0)
        self.pdf.ln(9)
        self.paragraph("Use the decision rules for revision, then the troubleshooting tables. Work through the checklists to practice each changed path.", size=10, style="I", color=MUTED, after=0, styled=False)

    def contents(self, lessons: list[Lesson], page_numbers: dict[str, int]):
        self.pdf.add_page()
        self.paragraph("Contents", size=19, style="B", color=NAVY, line=9, after=9, styled=False)
        for lesson in lessons:
            y = self.pdf.get_y()
            self.pdf.set_font("Body", "", 10.5)
            self.pdf.set_text_color(*INK)
            self.pdf.set_x(self.pdf.l_margin)
            self.pdf.multi_cell(self.pdf.epw - 18, 7.4, lesson.title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            end_y = self.pdf.get_y()
            self.pdf.set_xy(self.pdf.w - self.pdf.r_margin - 18, y)
            self.pdf.cell(18, 7.4, str(page_numbers.get(lesson.title, "")), align="R")
            self.pdf.set_xy(self.pdf.l_margin, end_y)
            self.pdf.set_draw_color(*BORDER)
            self.pdf.line(self.pdf.l_margin, end_y + 1, self.pdf.w - self.pdf.r_margin, end_y + 1)
            self.pdf.ln(3.4)
        self.pdf.ln(8)
        self.paragraph("01–07: Bedrock hands-on topics. 08–12: supporting platforms. 13: recognition sweep.", size=10, style="I", color=MUTED, styled=False)

    def build(self, lessons: list[Lesson], page_numbers: dict[str, int]):
        self.cover()
        self.contents(lessons, page_numbers)
        for lesson in lessons:
            # The header is drawn inside add_page(), so set the title first.
            self.pdf.chapter_title = lesson.title
            self.pdf.add_page()
            self.chapter_pages[lesson.title] = self.pdf.page_no()
            self.pdf.start_section(lesson.title, level=0)
            self.paragraph(lesson.title, size=17, style="B", color=NAVY, line=8, after=8, styled=False)
            self.render_blocks(lesson.nodes)
        return self.pdf


def main():
    lessons = load_lessons()
    first = Renderer()
    first.build(lessons, {})
    final = Renderer()
    pdf = final.build(lessons, first.chapter_pages)
    if final.chapter_pages != first.chapter_pages:
        raise RuntimeError("Contents page numbers changed between layout passes")
    pdf.output(OUTPUT)
    print(f"Created {OUTPUT.name}: {pdf.page_no()} pages, {OUTPUT.stat().st_size:,} bytes")
    for title, page in final.chapter_pages.items():
        print(f"  page {page:2d}: {title}")


if __name__ == "__main__":
    main()
