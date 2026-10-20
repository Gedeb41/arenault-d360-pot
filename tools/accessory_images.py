"""SVG illustrations for the accessories of the catalogue, one per (kind, colour).

Used by export_products.py; writes images/accessories/<kind>-<colour>.svg.
"""
from pathlib import Path

# Same palette as COLORS in scripts/shop.js
COLORS = {
    "Black": "#323232", "Grey": "#9AA0A6", "White": "#F4F4F4", "Blue": "#314780", "Green": "#2E7D4F",
    "Pink": "#F2A7C3", "Purple": "#6A3FA0", "Red": "#C91524", "Yellow": "#F2C230",
}

TEAL = "#25999A"
NAVY = "#07396B"
INK = "#24292E"

# Product name keyword -> kind
KINDS = [
    ("thermostat", "thermostat"), ("home display", "display"), ("nebula", "wifi"),
    ("watch", "watch"), ("earbuds", "earbuds"), ("speaker", "speaker"), ("power bank", "powerbank"),
    ("charging dock", "dock"), ("vr headset", "vr"), ("ring", "ring"),
]


def kind_of(name):
    low = name.lower()
    return next((k for key, k in KINDS if key in low), None)


def _mix(hex_color, other, t):
    a = [int(hex_color[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(other[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))


def _palette(color):
    base = COLORS.get(color, "#9AA0A6")
    return {
        "c": base,
        "dark": _mix(base, "#000000", 0.28),
        "light": _mix(base, "#FFFFFF", 0.35),
        # Keep pale bodies visible on the light background
        "line": "#C9D1D8" if color == "White" else _mix(base, "#000000", 0.4),
    }


def _watch(p):
    return f"""
  <rect x="160" y="40" width="80" height="110" rx="18" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <rect x="160" y="250" width="80" height="110" rx="18" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <g fill="{p['dark']}" opacity=".35">
    <rect x="192" y="300" width="16" height="8" rx="4"/><rect x="192" y="322" width="16" height="8" rx="4"/>
  </g>
  <rect x="126" y="118" width="148" height="164" rx="40" fill="{INK}"/>
  <rect x="136" y="128" width="128" height="144" rx="32" fill="#0E1114"/>
  <rect x="276" y="168" width="12" height="34" rx="5" fill="{p['dark']}"/>
  <text x="200" y="196" text-anchor="middle" font-family="Poppins, sans-serif" font-size="40" font-weight="600" fill="#FFFFFF">10:09</text>
  <path d="M164 236 a36 36 0 0 1 72 0" fill="none" stroke="{TEAL}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="200" cy="236" r="5" fill="{TEAL}"/>"""


def _earbuds(p):
    return f"""
  <rect x="110" y="200" width="180" height="120" rx="56" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <path d="M112 232 h176" stroke="{p['dark']}" stroke-width="2" opacity=".5"/>
  <circle cx="200" cy="282" r="5" fill="{TEAL}"/>
  <g>
    <rect x="128" y="120" width="22" height="84" rx="11" fill="{p['c']}" stroke="{p['line']}" stroke-width="2" transform="rotate(-12 139 162)"/>
    <circle cx="150" cy="118" r="34" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
    <circle cx="160" cy="110" r="14" fill="{p['dark']}"/>
  </g>
  <g>
    <rect x="250" y="120" width="22" height="84" rx="11" fill="{p['c']}" stroke="{p['line']}" stroke-width="2" transform="rotate(12 261 162)"/>
    <circle cx="250" cy="118" r="34" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
    <circle cx="240" cy="110" r="14" fill="{p['dark']}"/>
  </g>"""


def _speaker(p):
    dots = "".join(
        f'<circle cx="{x}" cy="{y}" r="3.2"/>'
        for row, y in enumerate(range(108, 300, 16))
        for x in range(140 + (row % 2) * 8, 264, 16))
    return f"""
  <rect x="120" y="70" width="160" height="270" rx="70" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <g fill="{p['dark']}" opacity=".45">{dots}</g>
  <ellipse cx="200" cy="84" rx="52" ry="10" fill="{p['light']}" opacity=".7"/>
  <g fill="{INK}" opacity=".75">
    <rect x="166" y="306" width="16" height="6" rx="3"/><rect x="192" y="306" width="16" height="6" rx="3"/><rect x="218" y="306" width="16" height="6" rx="3"/>
  </g>"""


def _powerbank(p):
    return f"""
  <rect x="96" y="126" width="208" height="170" rx="26" fill="{p['dark']}"/>
  <rect x="96" y="112" width="208" height="170" rx="26" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <g fill="{TEAL}">
    <circle cx="232" cy="250" r="5"/><circle cx="248" cy="250" r="5"/><circle cx="264" cy="250" r="5"/>
  </g>
  <circle cx="280" cy="250" r="5" fill="{p['dark']}" opacity=".5"/>
  <text x="124" y="170" font-family="Poppins, sans-serif" font-size="26" font-weight="600" fill="{p['dark']}">20 000</text>
  <text x="124" y="196" font-family="Poppins, sans-serif" font-size="16" fill="{p['dark']}">mAh · 65 W</text>
  <rect x="124" y="244" width="40" height="12" rx="6" fill="{INK}"/>"""


def _dock(p):
    return f"""
  <ellipse cx="200" cy="318" rx="118" ry="26" fill="{p['dark']}"/>
  <ellipse cx="200" cy="308" rx="118" ry="26" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <path d="M176 300 L196 160 L226 160 L216 300 Z" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <g transform="rotate(8 230 180)">
    <rect x="186" y="56" width="104" height="206" rx="18" fill="{INK}"/>
    <rect x="194" y="66" width="88" height="186" rx="12" fill="#10151A"/>
    <path d="M222 168 l14 -26 v18 h12 l-14 26 v-18 z" fill="{TEAL}"/>
  </g>
  <ellipse cx="200" cy="300" rx="34" ry="6" fill="{TEAL}" opacity=".6"/>"""


def _vr(p):
    return f"""
  <path d="M84 196 C60 140 340 140 316 196" fill="none" stroke="{p['dark']}" stroke-width="16" stroke-linecap="round"/>
  <rect x="86" y="160" width="228" height="128" rx="52" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <rect x="104" y="176" width="192" height="88" rx="40" fill="{INK}"/>
  <path d="M120 200 q80 -22 160 0" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".18" stroke-linecap="round"/>
  <circle cx="140" cy="244" r="6" fill="{TEAL}"/><circle cx="260" cy="244" r="6" fill="{TEAL}"/>
  <path d="M176 288 q24 -26 48 0" fill="{p['dark']}"/>"""


def _ring(p):
    return f"""
  <ellipse cx="200" cy="214" rx="122" ry="112" fill="none" stroke="{p['dark']}" stroke-width="40"/>
  <ellipse cx="200" cy="204" rx="122" ry="112" fill="none" stroke="{p['c']}" stroke-width="40"/>
  <ellipse cx="200" cy="204" rx="122" ry="112" fill="none" stroke="{p['line']}" stroke-width="2"/>
  <path d="M110 140 a122 112 0 0 1 90 -48" fill="none" stroke="{p['light']}" stroke-width="10" stroke-linecap="round" opacity=".8"/>
  <g fill="{INK}" opacity=".8">
    <rect x="178" y="304" width="12" height="18" rx="4"/><rect x="210" y="304" width="12" height="18" rx="4"/>
  </g>
  <circle cx="200" cy="318" r="4" fill="{TEAL}"/>"""


def _thermostat(p):
    return f"""
  <rect x="98" y="88" width="204" height="224" rx="40" fill="#FFFFFF" stroke="#C9D1D8" stroke-width="2"/>
  <circle cx="200" cy="200" r="84" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <circle cx="200" cy="200" r="66" fill="{INK}"/>
  <path d="M152 236 a66 66 0 1 1 96 0" fill="none" stroke="{TEAL}" stroke-width="7" stroke-linecap="round" opacity=".9"/>
  <text x="200" y="214" text-anchor="middle" font-family="Poppins, sans-serif" font-size="40" font-weight="600" fill="#FFFFFF">21°</text>
  <text x="200" y="240" text-anchor="middle" font-family="Poppins, sans-serif" font-size="13" fill="#9AA0A6">ECO</text>"""


def _display(p):
    return f"""
  <path d="M116 318 L284 318 L262 262 L138 262 Z" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <g fill="{p['dark']}" opacity=".35">
    <circle cx="170" cy="292" r="3"/><circle cx="186" cy="292" r="3"/><circle cx="202" cy="292" r="3"/><circle cx="218" cy="292" r="3"/><circle cx="234" cy="292" r="3"/>
  </g>
  <rect x="78" y="82" width="244" height="180" rx="16" fill="{INK}"/>
  <rect x="88" y="92" width="224" height="160" rx="10" fill="#EAF6F6"/>
  <circle cx="134" cy="138" r="22" fill="{TEAL}"/>
  <text x="168" y="148" font-family="Poppins, sans-serif" font-size="30" font-weight="600" fill="{NAVY}">18°</text>
  <rect x="106" y="184" width="190" height="14" rx="7" fill="#C7E6E6"/>
  <rect x="106" y="210" width="120" height="14" rx="7" fill="#C7E6E6"/>"""


def _wifi(p):
    return f"""
  <rect x="134" y="70" width="132" height="250" rx="54" fill="{p['c']}" stroke="{p['line']}" stroke-width="2"/>
  <ellipse cx="200" cy="300" rx="62" ry="14" fill="{TEAL}" opacity=".85"/>
  <g fill="none" stroke="{NAVY}" stroke-width="8" stroke-linecap="round">
    <path d="M168 160 a46 46 0 0 1 64 0"/><path d="M180 176 a26 26 0 0 1 40 0"/>
  </g>
  <circle cx="200" cy="194" r="7" fill="{NAVY}"/>
  <text x="200" y="244" text-anchor="middle" font-family="Poppins, sans-serif" font-size="16" font-weight="600" fill="{p['dark']}">NEBULA</text>"""


DRAW = {
    "watch": _watch, "earbuds": _earbuds, "speaker": _speaker, "powerbank": _powerbank, "dock": _dock,
    "vr": _vr, "ring": _ring, "thermostat": _thermostat, "display": _display, "wifi": _wifi,
}


def render(kind, color):
    body = DRAW[kind](_palette(color))
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EFF3"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <ellipse cx="200" cy="352" rx="130" ry="12" fill="#000000" opacity=".08"/>{body}
</svg>
"""


def write(root, kind, color):
    """Write the SVG if needed and return its site-relative path."""
    rel = f"images/accessories/{kind}-{color.lower()}.svg"
    path = Path(root) / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(kind, color))
    return rel
