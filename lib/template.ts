import fs from 'fs'
import path from 'path'

// A3 300DPI (print quality). For 600DPI set IMAGE_DPI=600 env var (requires Vercel Pro 1024MB).
export const DPI = process.env.IMAGE_DPI === '600' ? 600 : 300
export const W = DPI === 600 ? 7016 : 3508
export const H = DPI === 600 ? 9922 : 4961
const S = W / 3508  // scale factor

// Face oval center and size (at base 3508×4961)
export const FACE = { cx: 1754, cy: 740, rx: 215, ry: 228 }

// Needed @fontsource Korean subset files
const KOREAN_SUBSETS = [
  '106','107','109','111','113','114','115','116','117','118','119'
]

let _fontFacesCss: string | null = null

function loadFontFaces(): string {
  if (_fontFacesCss) return _fontFacesCss
  const dir = path.join(process.cwd(), 'node_modules', '@fontsource', 'noto-sans-kr', 'files')
  const parts: string[] = []
  const files = [
    'noto-sans-kr-latin-700-normal.woff2',
    ...KOREAN_SUBSETS.map(n => `noto-sans-kr-${n}-700-normal.woff2`),
  ]
  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(dir, f))
      const b64 = buf.toString('base64')
      parts.push(
        `@font-face { font-family: 'NotoKR'; font-weight: 700; ` +
        `src: url('data:font/woff2;base64,${b64}') format('woff2'); }`
      )
    } catch {
      // skip missing files
    }
  }
  _fontFacesCss = parts.join('\n')
  return _fontFacesCss
}

type Label = { ko: string; en: string; y: number; bx: number; by: number }

const LEFT_LABELS: Label[] = [
  { ko: '머리',   en: 'head',     y: 680,  bx: 1754, by: 490  },
  { ko: '이마',   en: 'forehead', y: 800,  bx: 1610, by: 680  },
  { ko: '눈썹',   en: 'eyebrow',  y: 895,  bx: 1590, by: 732  },
  { ko: '얼굴',   en: 'face',     y: 1005, bx: 1570, by: 760  },
  { ko: '목',     en: 'neck',     y: 1115, bx: 1679, by: 1055 },
  { ko: '가슴',   en: 'chest',    y: 1380, bx: 1500, by: 1400 },
  { ko: '팔',     en: 'arm',      y: 1695, bx: 1060, by: 1700 },
  { ko: '손',     en: 'hand',     y: 2525, bx: 955,  by: 2520 },
  { ko: '손가락', en: 'finger',   y: 2730, bx: 910,  by: 2680 },
  { ko: '다리',   en: 'leg',      y: 3000, bx: 1430, by: 2900 },
  { ko: '무릎',   en: 'knee',     y: 3540, bx: 1380, by: 3540 },
  { ko: '발',     en: 'foot',     y: 4555, bx: 1340, by: 4615 },
  { ko: '발가락', en: 'toe',      y: 4745, bx: 1250, by: 4800 },
]

const RIGHT_LABELS: Label[] = [
  { ko: '머리카락', en: 'hair',     y: 680,  bx: 1880, by: 490  },
  { ko: '눈',       en: 'eye',      y: 800,  bx: 1880, by: 700  },
  { ko: '귀',       en: 'ear',      y: 900,  bx: 1990, by: 750  },
  { ko: '코',       en: 'nose',     y: 1005, bx: 1800, by: 812  },
  { ko: '입',       en: 'mouth',    y: 1120, bx: 1778, by: 900  },
  { ko: '어깨',     en: 'shoulder', y: 1298, bx: 2208, by: 1160 },
  { ko: '배',       en: 'tummy',    y: 1695, bx: 1900, by: 1700 },
  { ko: '손목',     en: 'wrist',    y: 2435, bx: 2528, by: 2400 },
  { ko: '허벅지',   en: 'thigh',    y: 2935, bx: 2030, by: 2900 },
  { ko: '종아리',   en: 'calf',     y: 3800, bx: 2120, by: 3800 },
  { ko: '발목',     en: 'ankle',    y: 4390, bx: 2080, by: 4430 },
]

const LL = 840   // left label right edge
const RL = 2668  // right label left edge

function lbl(l: Label, side: 'L' | 'R'): string {
  const lx = side === 'L' ? LL : RL
  const anchor = side === 'L' ? 'end' : 'start'
  const lx2 = side === 'L' ? LL + 20 : RL - 20
  const ly = l.y - 36
  return `<line x1="${lx2}" y1="${ly}" x2="${l.bx}" y2="${l.by}" stroke="#BBAA99" stroke-width="8" stroke-dasharray="18 10"/>
<text x="${lx}" y="${l.y}" text-anchor="${anchor}" font-family="NotoKR,sans-serif" font-size="58" font-weight="700" fill="#4A2C0A">${l.ko}</text>
<text x="${lx}" y="${l.y + 66}" text-anchor="${anchor}" font-family="NotoKR,sans-serif" font-size="44" fill="#2563EB">${l.en}</text>`
}

export interface TemplateParams {
  topText?: string
  date?: string
  name?: string
  age?: string
}

export function buildSvg(params: TemplateParams): string {
  const fontFaces = loadFontFaces()
  const { topText, date, name, age } = params

  const hasTop = !!topText
  const titleY  = hasTop ? 220 : 310
  const subY    = hasTop ? 360 : 420
  const divY    = hasTop ? 460 : 480

  const footer = [name, date, age ? `만 ${age}세` : ''].filter(Boolean).join('  ·  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 3508 4961" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>
${fontFaces}
</style>
<clipPath id="faceClip">
  <ellipse cx="1754" cy="740" rx="${FACE.rx}" ry="${FACE.ry}"/>
</clipPath>
</defs>

<!-- BG -->
<rect width="3508" height="4961" fill="#FAF6EF"/>
<rect x="38" y="38" width="3432" height="4885" fill="none" stroke="#D9C4A8" stroke-width="9"/>
<rect x="52" y="52" width="3404" height="4857" fill="none" stroke="#D9C4A8" stroke-width="3"/>

<!-- TITLE -->
${hasTop ? `<text x="1754" y="200" text-anchor="middle" font-family="NotoKR,sans-serif" font-size="140" font-weight="700" fill="#4A2C0A">${topText}</text>` : ''}
<text x="1754" y="${titleY}" text-anchor="middle" font-family="NotoKR,sans-serif" font-size="105" font-weight="700" fill="#4A2C0A">나의 몸</text>
<text x="1754" y="${subY}" text-anchor="middle" font-family="NotoKR,sans-serif" font-size="78" fill="#2563EB" letter-spacing="10">MY BODY</text>
<line x1="600" y1="${divY}" x2="2908" y2="${divY}" stroke="#D9C4A8" stroke-width="5"/>

<!-- ═══ BODY FIGURE ═══ -->
<!-- Hair (behind head) -->
<ellipse cx="1754" cy="574" rx="260" ry="300" fill="#2E1A0C"/>
<ellipse cx="1510" cy="730" rx="56" ry="190" fill="#2E1A0C"/>
<ellipse cx="1998" cy="730" rx="56" ry="190" fill="#2E1A0C"/>
<!-- HEAD -->
<ellipse cx="1754" cy="740" rx="252" ry="262" fill="#FFD5A3"/>
<!-- EARS -->
<ellipse cx="1497" cy="740" rx="50" ry="72" fill="#FFC07A" stroke="#D4904A" stroke-width="7"/>
<ellipse cx="2011" cy="740" rx="50" ry="72" fill="#FFC07A" stroke="#D4904A" stroke-width="7"/>
<!-- FACE placeholder (will be replaced by child photo) -->
<ellipse cx="1754" cy="740" rx="${FACE.rx}" ry="${FACE.ry}" fill="#FFE5BA" opacity="0.6"/>
<!-- EYES -->
<ellipse cx="1652" cy="702" rx="50" ry="40" fill="white" stroke="#2C1408" stroke-width="7"/>
<ellipse cx="1856" cy="702" rx="50" ry="40" fill="white" stroke="#2C1408" stroke-width="7"/>
<circle cx="1660" cy="706" r="26" fill="#2C1408"/>
<circle cx="1864" cy="706" r="26" fill="#2C1408"/>
<circle cx="1670" cy="698" r="8" fill="white"/>
<circle cx="1874" cy="698" r="8" fill="white"/>
<!-- EYEBROWS -->
<path d="M1595,646 Q1648,620 1710,638" stroke="#2C1408" stroke-width="17" fill="none" stroke-linecap="round"/>
<path d="M1798,638 Q1860,620 1913,646" stroke="#2C1408" stroke-width="17" fill="none" stroke-linecap="round"/>
<!-- NOSE -->
<path d="M1754,758 L1724,840 Q1754,860 1784,840 Z" stroke="#C87840" stroke-width="12" fill="none" stroke-linecap="round"/>
<!-- MOUTH -->
<path d="M1680,896 Q1754,945 1828,896" stroke="#B04828" stroke-width="15" fill="none" stroke-linecap="round"/>
<circle cx="1676" cy="892" r="11" fill="#D87060"/>
<circle cx="1832" cy="892" r="11" fill="#D87060"/>

<!-- NECK -->
<rect x="1679" y="1002" width="150" height="128" fill="#FFD5A3" stroke="#D4904A" stroke-width="7" rx="6"/>
<line x1="1700" y1="1002" x2="1700" y2="1130" stroke="#D4904A" stroke-width="4" opacity="0.5"/>
<line x1="1808" y1="1002" x2="1808" y2="1130" stroke="#D4904A" stroke-width="4" opacity="0.5"/>

<!-- SHIRT TORSO (trapezoid) -->
<path d="M1300,1130 L1679,1130 L1679,1002 L1829,1002 L1829,1130 L2208,1130
         C2170,2100 2100,2120 2048,2120 L1460,2120 C1408,2120 1338,2100 1300,1130 Z"
      fill="#C6DDF2" stroke="#9BBAD8" stroke-width="10"/>
<!-- Collar V -->
<path d="M1679,1130 L1690,1200 L1754,1360 L1818,1200 L1829,1130" fill="#F0F8FF" stroke="#9BBAD8" stroke-width="8"/>
<!-- Shirt center seam -->
<line x1="1754" y1="1370" x2="1754" y2="2080" stroke="#9BBAD8" stroke-width="6" stroke-dasharray="22 14" opacity="0.7"/>

<!-- PANTS (hips + upper legs joined) -->
<path d="M1460,2120 L2048,2120 L2090,2380 L1420,2380 Z" fill="#5A7EA8" stroke="#426090" stroke-width="10"/>
<!-- Belt -->
<rect x="1420" y="2108" width="668" height="56" fill="#426090" stroke="#324878" stroke-width="7" rx="6"/>
<rect x="1730" y="2113" width="52" height="43" fill="#C8A040" stroke="#A07820" stroke-width="5" rx="4"/>

<!-- LEFT ARM skin -->
<path d="M1300,1170 Q1140,1500 988,2410" stroke="#FFD5A3" stroke-width="172" stroke-linecap="round" fill="none"/>
<!-- Left sleeve (shirt colored, shorter) -->
<path d="M1300,1170 Q1190,1400 1110,1760" stroke="#C6DDF2" stroke-width="176" stroke-linecap="round" fill="none"/>
<!-- LEFT HAND -->
<ellipse cx="955" cy="2530" rx="125" ry="95" fill="#FFD5A3" stroke="#D4904A" stroke-width="8"/>
<!-- Left fingers -->
<path d="M845,2480 L800,2358" stroke="#FFD5A3" stroke-width="58" stroke-linecap="round"/>
<path d="M882,2460 L848,2332" stroke="#FFD5A3" stroke-width="55" stroke-linecap="round"/>
<path d="M922,2448 L904,2318" stroke="#FFD5A3" stroke-width="55" stroke-linecap="round"/>
<path d="M960,2445 L960,2316" stroke="#FFD5A3" stroke-width="53" stroke-linecap="round"/>
<path d="M1060,2492 L1104,2415" stroke="#FFD5A3" stroke-width="53" stroke-linecap="round"/>

<!-- RIGHT ARM skin -->
<path d="M2208,1170 Q2368,1500 2520,2410" stroke="#FFD5A3" stroke-width="172" stroke-linecap="round" fill="none"/>
<!-- Right sleeve -->
<path d="M2208,1170 Q2318,1400 2398,1760" stroke="#C6DDF2" stroke-width="176" stroke-linecap="round" fill="none"/>
<!-- RIGHT HAND -->
<ellipse cx="2553" cy="2530" rx="125" ry="95" fill="#FFD5A3" stroke="#D4904A" stroke-width="8"/>
<!-- Right fingers -->
<path d="M2663,2480 L2708,2358" stroke="#FFD5A3" stroke-width="58" stroke-linecap="round"/>
<path d="M2626,2460 L2660,2332" stroke="#FFD5A3" stroke-width="55" stroke-linecap="round"/>
<path d="M2586,2448 L2604,2318" stroke="#FFD5A3" stroke-width="55" stroke-linecap="round"/>
<path d="M2548,2445 L2548,2316" stroke="#FFD5A3" stroke-width="53" stroke-linecap="round"/>
<path d="M2448,2492 L2404,2415" stroke="#FFD5A3" stroke-width="53" stroke-linecap="round"/>

<!-- LEFT LEG -->
<path d="M1420,2380 L1390,3540 L1358,4490 L1618,4490 L1630,3540 L1660,2380 Z" fill="#5A7EA8" stroke="#426090" stroke-width="10"/>
<!-- Left knee -->
<ellipse cx="1504" cy="3540" rx="78" ry="55" fill="#426090" opacity="0.45"/>

<!-- RIGHT LEG -->
<path d="M1848,2380 L1878,3540 L1890,4490 L2150,4490 L2118,3540 L2088,2380 Z" fill="#5A7EA8" stroke="#426090" stroke-width="10"/>
<!-- Right knee -->
<ellipse cx="2004" cy="3540" rx="78" ry="55" fill="#426090" opacity="0.45"/>

<!-- LEFT SHOE -->
<path d="M1358,4490 L1358,4660 Q1310,4760 1160,4760 Q1100,4760 1100,4700 L1110,4660 L1618,4660 L1618,4490 Z" fill="#3C2010" stroke="#2A1408" stroke-width="10"/>
<line x1="1110" y1="4660" x2="1360" y2="4660" stroke="#5A3020" stroke-width="7" opacity="0.7"/>

<!-- RIGHT SHOE -->
<path d="M1890,4490 L1890,4660 L2398,4660 L2408,4700 Q2408,4760 2348,4760 Q2198,4760 2150,4660 L2150,4490 Z" fill="#3C2010" stroke="#2A1408" stroke-width="10"/>
<line x1="2148" y1="4660" x2="2400" y2="4660" stroke="#5A3020" stroke-width="7" opacity="0.7"/>

<!-- ═══ LABELS ═══ -->
${LEFT_LABELS.map(l => lbl(l, 'L')).join('\n')}
${RIGHT_LABELS.map(l => lbl(l, 'R')).join('\n')}

<!-- ═══ FOOTER ═══ -->
<line x1="600" y1="4850" x2="2908" y2="4850" stroke="#D9C4A8" stroke-width="5"/>
${footer ? `<text x="2850" y="4920" text-anchor="end" font-family="NotoKR,sans-serif" font-size="58" fill="#7A5A3A">${footer}</text>` : ''}
</svg>`
}
