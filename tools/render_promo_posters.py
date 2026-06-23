from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
OUTPUT = ROOT / "output" / "promo"

SCALE = 2
WIDTH = 720
HEIGHT = 1280
W = WIDTH * SCALE
H = HEIGHT * SCALE

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")


THEMES = {
    "default": {
        "background": ASSETS / "home_bg.png",
        "board": "#dfe6f4",
        "cell": "#fdfefe",
        "grid": "#cbd5e6",
        "target": "#ff4d4f",
        "horizontal": "#2f80ed",
        "vertical": "#27ae60",
        "fixed": "#4f5665",
        "exit": "#ffb020",
        "text": "#202633",
        "muted": "#667085",
        "light_text": False,
    },
    "classic": {
        "background": ASSETS / "theme_classic_bg.jpg",
        "board": "#f2d39f",
        "cell": "#fffaf0",
        "grid": "#deb878",
        "target": "#ff6b4a",
        "horizontal": "#41a8e8",
        "vertical": "#6ac36a",
        "fixed": "#8b7357",
        "exit": "#f5a623",
        "text": "#34291d",
        "muted": "#6f604f",
        "light_text": False,
    },
    "neon": {
        "background": ASSETS / "theme_neon_bg.jpg",
        "board": "#111c3d",
        "cell": "#182850",
        "grid": "#49bfff",
        "target": "#ff4f9a",
        "horizontal": "#12c8ff",
        "vertical": "#2ee58f",
        "fixed": "#5e6f99",
        "exit": "#ffe066",
        "text": "#f6fbff",
        "muted": "#b6c8e8",
        "light_text": True,
    },
}


POSTERS = [
    {
        "filename": "promo-01-slide-to-clear.jpg",
        "theme": "default",
        "level": 3,
        "skin": "cat_orange",
        "title": ["横竖滑动", "给它让路"],
        "subtitle": "蓝色左右滑 · 绿色上下滑",
        "badge": "第 3 关 · 下方出口 · 最优 5 步",
        "footer": "让目标伙伴真正移出棋盘，才算过关",
        "kind": "directions",
    },
    {
        "filename": "promo-02-four-way-exits.jpg",
        "theme": "classic",
        "level": 56,
        "skin": "dog_tan",
        "title": ["四向出口", "每局换思路"],
        "subtitle": "观察出口方向，再安排移动顺序",
        "badge": "第 56 关 · 左侧出口 · 最优 29 步",
        "footer": "出口可能在上、下、左、右",
        "kind": "exits",
    },
    {
        "filename": "promo-03-180-levels.jpg",
        "theme": "neon",
        "level": 180,
        "skin": "rabbit_white",
        "title": ["180 关", "渐进烧脑"],
        "subtitle": "从一步上手，到三十步最优解",
        "badge": "第 180 关 · 上方出口 · 最优 30 步",
        "footer": "固定障碍加入后，每一步都要提前想",
        "kind": "progress",
    },
]


def px(value: float) -> int:
    return int(round(value * SCALE))


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), px(size))


def fit_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def add_shadowed_panel(
    base: Image.Image,
    box: tuple[int, int, int, int],
    radius: int,
    fill: tuple[int, int, int, int],
    outline: tuple[int, int, int, int] | None = None,
    outline_width: int = 0,
    shadow: tuple[int, int, int, int] = (0, 0, 0, 65),
    blur: int = 18,
    offset: tuple[int, int] = (0, 10),
) -> None:
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    sx, sy = offset
    draw.rounded_rectangle((x0 + sx, y0 + sy, x1 + sx, y1 + sy), radius=radius, fill=shadow)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=outline_width)


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    center_x: int,
    y: int,
    text_font: ImageFont.FreeTypeFont,
    fill: str | tuple[int, int, int, int],
    stroke_width: int = 0,
    stroke_fill: str | tuple[int, int, int, int] | None = None,
) -> tuple[int, int, int, int]:
    box = draw.textbbox((0, 0), text, font=text_font, stroke_width=stroke_width)
    width = box[2] - box[0]
    x = center_x - width // 2
    draw.text(
        (x, y),
        text,
        font=text_font,
        fill=fill,
        stroke_width=stroke_width,
        stroke_fill=stroke_fill,
    )
    return draw.textbbox((x, y), text, font=text_font, stroke_width=stroke_width)


def paste_contain(base: Image.Image, source_path: Path, box: tuple[int, int, int, int], opacity: int = 255) -> None:
    source = Image.open(source_path).convert("RGBA")
    x0, y0, x1, y1 = box
    target_w = max(1, x1 - x0)
    target_h = max(1, y1 - y0)
    source.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
    if opacity < 255:
        alpha = source.getchannel("A").point(lambda value: value * opacity // 255)
        source.putalpha(alpha)
    x = x0 + (target_w - source.width) // 2
    y = y0 + (target_h - source.height) // 2
    base.alpha_composite(source, (x, y))


def alpha_color(hex_color: str, alpha: int) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def draw_board(level: dict, theme: dict, skin: str, board_size: int) -> Image.Image:
    margin = px(67)
    canvas_size = board_size + margin * 2
    board = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(board)
    bx = margin
    by = margin
    cell = board_size / level["width"]

    # Board shadow and frame follow the production game's rounded, layered treatment.
    shadow = Image.new("RGBA", board.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (bx - px(12), by - px(4), bx + board_size + px(12), by + board_size + px(20)),
        radius=px(18),
        fill=(0, 0, 0, 72),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(px(12)))
    board.alpha_composite(shadow)
    draw.rounded_rectangle(
        (bx - px(10), by - px(10), bx + board_size + px(10), by + board_size + px(10)),
        radius=px(18),
        fill=theme["board"],
        outline=(255, 255, 255, 220),
        width=px(3),
    )

    gap = px(4)
    for gy in range(level["height"]):
        for gx in range(level["width"]):
            x0 = round(bx + gx * cell + gap)
            y0 = round(by + gy * cell + gap)
            x1 = round(bx + (gx + 1) * cell - gap)
            y1 = round(by + (gy + 1) * cell - gap)
            draw.rounded_rectangle(
                (x0, y0, x1, y1),
                radius=max(px(5), int(cell * 0.10)),
                fill=theme["cell"],
                outline=alpha_color(theme["grid"], 165),
                width=px(1),
            )

    for block in level["blocks"]:
        x0 = round(bx + block["x"] * cell + px(6))
        y0 = round(by + block["y"] * cell + px(6))
        x1 = round(bx + (block["x"] + block["w"]) * cell - px(6))
        y1 = round(by + (block["y"] + block["h"]) * cell - px(6))
        is_target = block["type"] == "target"
        if is_target:
            fill = theme["target"]
        elif block["type"] == "fixed" or block["moveDir"] == "none":
            fill = theme["fixed"]
        elif block["moveDir"] == "vertical":
            fill = theme["vertical"]
        else:
            fill = theme["horizontal"]

        radius = max(px(9), int(cell * (0.20 if is_target else 0.13)))
        draw.rounded_rectangle((x0 + px(1), y0 + px(7), x1 + px(1), y1 + px(7)), radius=radius, fill=(0, 0, 0, 48))
        draw.rounded_rectangle(
            (x0, y0, x1, y1),
            radius=radius,
            fill=fill,
            outline=(255, 255, 255, 205),
            width=px(3 if is_target else 2),
        )

        if is_target:
            facing = block.get("facing", level["exit"].get("direction", "down"))
            character_path = ASSETS / "characters" / f"{skin}_idle_{facing}.png"
            side = int(min(x1 - x0, y1 - y0) * 0.94)
            paste_contain(
                board,
                character_path,
                (
                    (x0 + x1 - side) // 2,
                    (y0 + y1 - side) // 2,
                    (x0 + x1 + side) // 2,
                    (y0 + y1 + side) // 2,
                ),
            )
            continue

        highlight_h = max(px(7), int((y1 - y0) * 0.18))
        draw.rounded_rectangle(
            (x0 + px(8), y0 + px(8), x1 - px(8), y0 + px(8) + highlight_h),
            radius=px(6),
            fill=(255, 255, 255, 48),
        )
        if block["type"] == "fixed" or block["moveDir"] == "none":
            x_font = font(max(16, int(cell / SCALE * 0.34)), True)
            draw_centered_text(draw, "×", (x0 + x1) // 2, (y0 + y1) // 2 - px(20), x_font, "#ffffff", px(1), (0, 0, 0, 60))
        else:
            arrow_path = ASSETS / "ui" / (
                "move_arrow_vertical.png" if block["moveDir"] == "vertical" else "move_arrow_horizontal.png"
            )
            icon_side = int(min(x1 - x0, y1 - y0) * 0.60)
            paste_contain(
                board,
                arrow_path,
                (
                    (x0 + x1 - icon_side) // 2,
                    (y0 + y1 - icon_side) // 2,
                    (x0 + x1 + icon_side) // 2,
                    (y0 + y1 + icon_side) // 2,
                ),
            )

    exit_data = level["exit"]
    side = exit_data["side"]
    horizontal_exit = side in ("top", "bottom")
    exit_w = exit_data.get("w", 2 if horizontal_exit else 1)
    exit_h = exit_data.get("h", 1 if horizontal_exit else 2)
    span_x = bx + exit_data["x"] * cell
    span_y = by + exit_data["y"] * cell
    span_w = exit_w * cell
    span_h = exit_h * cell
    exit_color = theme["exit"]
    dark = "#5b3900" if not theme["light_text"] else "#111827"
    glow = Image.new("RGBA", board.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)

    if horizontal_exit:
        slot_w = max(px(104), int(span_w + px(18)))
        slot_h = px(34)
        slot_x = int(span_x + span_w / 2 - slot_w / 2)
        slot_y = by - slot_h - px(18) if side == "top" else by + board_size + px(18)
        gd.rounded_rectangle(
            (slot_x - px(12), slot_y - px(10), slot_x + slot_w + px(12), slot_y + slot_h + px(10)),
            radius=px(18),
            fill=alpha_color(exit_color, 125),
        )
        glow = glow.filter(ImageFilter.GaussianBlur(px(14)))
        board.alpha_composite(glow)
        draw = ImageDraw.Draw(board)
        draw.rounded_rectangle(
            (slot_x, slot_y, slot_x + slot_w, slot_y + slot_h),
            radius=px(14),
            fill=exit_color,
            outline="white",
            width=px(3),
        )
        arrow = "↑" if side == "top" else "↓"
        draw_centered_text(draw, f"{arrow} 出口", slot_x + slot_w // 2, slot_y + px(3), font(17, True), dark)
        edge_y = by + px(3) if side == "top" else by + board_size - px(8)
        draw.rounded_rectangle(
            (int(span_x + px(5)), edge_y, int(span_x + span_w - px(5)), edge_y + px(8)),
            radius=px(4),
            fill="white",
            outline=exit_color,
            width=px(2),
        )
    else:
        slot_w = px(58)
        slot_h = max(px(90), int(span_h + px(18)))
        slot_x = bx - slot_w - px(18) if side == "left" else bx + board_size + px(18)
        slot_y = int(span_y + span_h / 2 - slot_h / 2)
        gd.rounded_rectangle(
            (slot_x - px(10), slot_y - px(12), slot_x + slot_w + px(10), slot_y + slot_h + px(12)),
            radius=px(18),
            fill=alpha_color(exit_color, 125),
        )
        glow = glow.filter(ImageFilter.GaussianBlur(px(14)))
        board.alpha_composite(glow)
        draw = ImageDraw.Draw(board)
        draw.rounded_rectangle(
            (slot_x, slot_y, slot_x + slot_w, slot_y + slot_h),
            radius=px(14),
            fill=exit_color,
            outline="white",
            width=px(3),
        )
        arrow = "←" if side == "left" else "→"
        draw_centered_text(draw, arrow, slot_x + slot_w // 2, slot_y + slot_h // 2 - px(33), font(26, True), dark)
        draw_centered_text(draw, "出口", slot_x + slot_w // 2, slot_y + slot_h // 2 + px(5), font(15, True), dark)
        edge_x = bx + px(3) if side == "left" else bx + board_size - px(8)
        draw.rounded_rectangle(
            (edge_x, int(span_y + px(5)), edge_x + px(8), int(span_y + span_h - px(5))),
            radius=px(4),
            fill="white",
            outline=exit_color,
            width=px(2),
        )
    return board


def draw_top(base: Image.Image, spec: dict, theme: dict) -> None:
    draw = ImageDraw.Draw(base)
    light = theme["light_text"]
    main = "#ffffff" if light else theme["text"]
    muted = theme["muted"]
    title_stroke = (5, 10, 28, 130) if light else (255, 255, 255, 210)

    icon_box = (px(36), px(36), px(92), px(92))
    paste_contain(base, ASSETS / "logo_mark.png", icon_box)
    draw.text((px(104), px(44)), "滑块逃脱", font=font(18, True), fill=main)
    draw.text((px(104), px(70)), "真实关卡 · 真实贴图", font=font(12), fill=muted)

    draw_centered_text(draw, spec["title"][0], W // 2, px(112), font(48, True), main, px(2), title_stroke)
    accent = theme["exit"] if spec["theme"] != "default" else "#ff5a47"
    draw_centered_text(draw, spec["title"][1], W // 2, px(170), font(64, True), accent, px(2), title_stroke)
    draw_centered_text(draw, spec["subtitle"], W // 2, px(255), font(19, True), main, px(1), title_stroke)


def draw_bottom(base: Image.Image, spec: dict, theme: dict) -> None:
    light = theme["light_text"]
    panel_fill = (10, 20, 48, 220) if light else (255, 255, 255, 226)
    panel_outline = (96, 184, 255, 130) if light else (255, 255, 255, 220)
    text = "#ffffff" if light else theme["text"]
    muted = theme["muted"]
    panel = (px(32), px(1034), px(688), px(1244))
    add_shadowed_panel(base, panel, px(24), panel_fill, panel_outline, px(2), blur=px(12), offset=(0, px(6)))
    draw = ImageDraw.Draw(base)

    if spec["kind"] == "directions":
        card_y0 = px(1062)
        card_y1 = px(1140)
        cards = [
            (px(56), px(340), theme["horizontal"], ASSETS / "ui" / "move_arrow_horizontal.png", "左右滑"),
            (px(380), px(664), theme["vertical"], ASSETS / "ui" / "move_arrow_vertical.png", "上下滑"),
        ]
        for x0, x1, color, icon, label in cards:
            draw.rounded_rectangle((x0, card_y0, x1, card_y1), radius=px(17), fill=alpha_color(color, 235), outline=(255, 255, 255, 210), width=px(2))
            paste_contain(base, icon, (x0 + px(18), card_y0 + px(16), x0 + px(86), card_y1 - px(16)))
            draw.text((x0 + px(102), card_y0 + px(19)), label, font=font(24, True), fill="white")
    elif spec["kind"] == "exits":
        arrows = [("↑", "上"), ("↓", "下"), ("←", "左"), ("→", "右")]
        start_x = px(54)
        for index, (arrow, label) in enumerate(arrows):
            x0 = start_x + index * px(158)
            x1 = x0 + px(136)
            draw.rounded_rectangle(
                (x0, px(1062), x1, px(1140)),
                radius=px(17),
                fill=alpha_color(theme["exit"], 238),
                outline=(255, 255, 255, 220),
                width=px(2),
            )
            draw_centered_text(draw, arrow, (x0 + x1) // 2, px(1062), font(29, True), "#5b3900")
            draw_centered_text(draw, label, (x0 + x1) // 2, px(1110), font(14, True), "#5b3900")
    else:
        left = (px(56), px(1062), px(330), px(1142))
        right = (px(390), px(1062), px(664), px(1142))
        draw.rounded_rectangle(left, radius=px(18), fill=(38, 54, 94, 245), outline=(79, 195, 255, 220), width=px(2))
        draw.rounded_rectangle(right, radius=px(18), fill=(74, 35, 105, 245), outline=(255, 79, 154, 220), width=px(2))
        draw_centered_text(draw, "第 1 关", (left[0] + left[2]) // 2, px(1072), font(17, True), "#9bdcff")
        draw_centered_text(draw, "最优 1 步", (left[0] + left[2]) // 2, px(1103), font(22, True), "#ffffff")
        draw_centered_text(draw, "第 180 关", (right[0] + right[2]) // 2, px(1072), font(17, True), "#ff95c7")
        draw_centered_text(draw, "最优 30 步", (right[0] + right[2]) // 2, px(1103), font(22, True), "#ffffff")
        draw.line((px(330), px(1102), px(390), px(1102)), fill=(255, 224, 102, 220), width=px(5))
        draw.polygon([(px(390), px(1102)), (px(374), px(1092)), (px(374), px(1112))], fill=(255, 224, 102, 240))

    draw_centered_text(draw, spec["footer"], W // 2, px(1171), font(17, True), text)
    draw_centered_text(draw, "拖动滑块，给目标伙伴让出通往出口的路", W // 2, px(1205), font(13), muted)


def save_under_limit(image: Image.Image, path: Path, max_bytes: int = 200_000) -> tuple[int, int]:
    quality = 88
    while quality >= 48:
        image.convert("RGB").save(
            path,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
            subsampling=2,
        )
        size = path.stat().st_size
        if size <= max_bytes:
            return quality, size
        quality -= 3
    return quality, path.stat().st_size


def render_poster(spec: dict, levels: list[dict]) -> tuple[Path, int, int]:
    theme = THEMES[spec["theme"]]
    background = fit_cover(Image.open(theme["background"]), (W, H)).convert("RGBA")

    # Preserve the original theme art while reserving a clean reading zone.
    overlay = Image.new("RGBA", background.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    if theme["light_text"]:
        od.rectangle((0, 0, W, H), fill=(3, 8, 28, 55))
        od.rectangle((0, 0, W, px(330)), fill=(3, 8, 28, 112))
    else:
        od.rectangle((0, 0, W, H), fill=(255, 255, 255, 28))
        od.rectangle((0, 0, W, px(330)), fill=(255, 255, 255, 142))
    overlay = overlay.filter(ImageFilter.GaussianBlur(px(5)))
    background.alpha_composite(overlay)

    draw_top(background, spec, theme)

    level = levels[spec["level"] - 1]
    board = draw_board(level, theme, spec["skin"], px(530))
    board_x = (W - board.width) // 2
    board_y = px(318)
    background.alpha_composite(board, (board_x, board_y))

    draw = ImageDraw.Draw(background)
    badge_fill = (9, 19, 48, 225) if theme["light_text"] else (255, 255, 255, 232)
    badge_text = "#ffffff" if theme["light_text"] else theme["text"]
    badge_box = (px(114), px(974), px(606), px(1024))
    draw.rounded_rectangle(
        badge_box,
        radius=px(24),
        fill=badge_fill,
        outline=alpha_color(theme["exit"], 230),
        width=px(2),
    )
    draw_centered_text(draw, spec["badge"], W // 2, px(984), font(15, True), badge_text)

    draw_bottom(background, spec, theme)

    final = background.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT / spec["filename"]
    quality, size = save_under_limit(final, output_path)
    return output_path, quality, size


def main() -> None:
    with (ROOT / "assets" / "data" / "levels.json").open("r", encoding="utf-8") as handle:
        levels = json.load(handle)

    results = [render_poster(spec, levels) for spec in POSTERS]
    for path, quality, size in results:
        print(f"{path}\t720x1280\tquality={quality}\t{size} bytes")


if __name__ == "__main__":
    main()
