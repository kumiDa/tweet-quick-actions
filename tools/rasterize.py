"""Rasterise icon.svg to PNG. Stdlib only: no SVG library is installed and
network installs are blocked, so the icon's shapes are hard-coded here and
kept in step with icon.svg by the self-check at the bottom."""
import zlib, struct, sys, re, os

W = 24.0  # viewBox

# (kind, params, (r,g,b), alpha) painted in order, matching icon.svg
SHAPES = [
    ("rrect", (0, 0, 24, 24, 5.5),      (0x1d, 0x9b, 0xf0), 1.0),
    ("rrect", (4.5, 5.5, 15, 2.6, 1.3), (255, 255, 255),    1.0),
    ("rrect", (4.5, 10, 9, 2.6, 1.3),   (255, 255, 255),    0.6),
    ("circle", (6.6, 18.2, 2),          (255, 255, 255),    0.6),
    ("circle", (12, 18.2, 2),           (255, 255, 255),    0.6),
    ("circle", (17.7, 18.2, 2.8),       (255, 255, 255),    1.0),
]

def in_rrect(px, py, x, y, w, h, r):
    if px < x or py < y or px > x + w or py > y + h:
        return False
    r = min(r, w / 2, h / 2)
    cx = min(max(px, x + r), x + w - r)
    cy = min(max(py, y + r), y + h - r)
    dx, dy = px - cx, py - cy
    return dx * dx + dy * dy <= r * r

def in_circle(px, py, cx, cy, r):
    dx, dy = px - cx, py - cy
    return dx * dx + dy * dy <= r * r

def render(size, ss=4):
    scale = W / size
    step = scale / ss
    off = step / 2.0
    buf = [[0.0, 0.0, 0.0, 0.0] for _ in range(size * size)]
    nsub = ss * ss
    for kind, params, (sr, sg, sb), salpha in SHAPES:
        hit = in_rrect if kind == "rrect" else in_circle
        for py in range(size):
            base = py * scale
            row = py * size
            for px in range(size):
                bx = px * scale
                n = 0
                for sy in range(ss):
                    wy = base + sy * step + off
                    for sx in range(ss):
                        if hit(bx + sx * step + off, wy, *params):
                            n += 1
                if not n:
                    continue
                a = (n / nsub) * salpha
                d = buf[row + px]
                inv = 1.0 - a
                d[0] = sr * a + d[0] * inv
                d[1] = sg * a + d[1] * inv
                d[2] = sb * a + d[2] * inv
                d[3] = a + d[3] * inv
    out = bytearray()
    for py in range(size):
        out.append(0)  # filter: none
        row = py * size
        for px in range(size):
            r, g, b, a = buf[row + px]
            out += bytes((int(r + 0.5), int(g + 0.5), int(b + 0.5), int(a * 255 + 0.5)))
    return bytes(out)

def chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))

def write_png(path, size):
    raw = render(size)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    return len(png)

# self-check: the hard-coded shapes must still match icon.svg
def check(svg_path):
    s = open(svg_path).read()
    found = []
    for m in re.finditer(r'<rect(?![^>]*width="24")[^>]*x="([\d.]+)"[^>]*y="([\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*rx="([\d.]+)"', s):
        found.append(("rrect", tuple(float(v) for v in m.groups())))
    for m in re.finditer(r'<circle[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"[^>]*r="([\d.]+)"', s):
        found.append(("circle", tuple(float(v) for v in m.groups())))
    expect = [(k, p) for k, p, _, _ in SHAPES if not (k == "rrect" and p[2] == 24)]
    assert found == expect, f"icon.svg changed:\n svg={found}\n py ={expect}"
    print("self-check: shapes match icon.svg")

if __name__ == "__main__":
    d = sys.argv[1]
    check(os.path.join(d, "icon.svg"))
    for s in (128, 96, 48):
        n = write_png(os.path.join(d, f"icon-{s}.png"), s)
        print(f"icon-{s}.png  {n} bytes")
