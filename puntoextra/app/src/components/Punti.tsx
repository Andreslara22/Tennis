/** Punti, la mascota de Punto Extra 🖍️ — SVG animado por CSS (ver index.css). */
export default function Punti({ pose = 'saluda', width = 96 }: { pose?: 'saluda' | 'celebra' | 'juntas'; width?: number }) {
  return (
    <svg viewBox="0 0 250 300" width={width} className={`punti punti-${pose}`} overflow="visible" aria-hidden="true">
      {pose === 'celebra' && (
        <>
          <path className="p-destello" d="M30 40 Q34 56 50 60 Q34 64 30 80 Q26 64 10 60 Q26 56 30 40 Z" fill="#FFC53D" />
          <path className="p-destello d2" d="M225 28 Q228 40 240 43 Q228 46 225 58 Q222 46 210 43 Q222 40 225 28 Z" fill="#FF9FB2" />
          <path className="p-destello d3" d="M236 130 Q238 139 247 141 Q238 143 236 152 Q234 143 225 141 Q234 139 236 130 Z" fill="#A79BF5" />
        </>
      )}
      <g className="p-flota">
        <path d="M74 84 v-14 q0 -40 46 -40 q46 0 46 40 v14 Z" fill="#FF9FB2" />
        <ellipse cx="98" cy="52" rx="14" ry="7" fill="#FFC4D0" transform="rotate(-12 98 52)" />
        <rect x="68" y="80" width="104" height="26" rx="11" fill="#A79BF5" />
        <line x1="79" y1="88" x2="161" y2="88" stroke="#8F80F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="79" y1="98" x2="161" y2="98" stroke="#8F80F0" strokeWidth="4" strokeLinecap="round" />
        <path d="M74 106 h92 v128 h-92 Z" fill="#FFD36B" />
        <path d="M74 106 h20 v128 h-20 Z" fill="#FFE59A" />
        <path d="M146 106 h20 v128 h-20 Z" fill="#F2B94B" />
        <path d="M74 232 Q85.5 224 97 232 Q108.5 240 120 232 Q131.5 224 143 232 Q154.5 240 166 232 L133 276 Q120 288 107 276 Z" fill="#F7E6C4" />
        <path d="M107 258 Q120 249 133 258 L126 271 Q120 277 114 271 Z" fill="#4A4160" />
        <g className="p-ojos">
          <circle cx="100.2" cy="146" r="11.2" fill="#221A4A" />
          <circle cx="139.8" cy="146" r="11.2" fill="#221A4A" />
          <circle cx="96.9" cy="142" r="4.3" fill="#fff" />
          <circle cx="136.5" cy="142" r="4.3" fill="#fff" />
        </g>
        <circle cx="84.4" cy="163" r="7.3" fill="#FFA3B5" opacity="0.7" />
        <circle cx="155.6" cy="163" r="7.3" fill="#FFA3B5" opacity="0.7" />
        {pose === 'celebra' ? (
          <path d="M108 165 Q120 181 132 165 Z" fill="#221A4A" />
        ) : (
          <path d="M112 168 Q120 175 128 168" stroke="#221A4A" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}
        {pose === 'celebra' ? (
          <>
            <path d="M74 170 Q48 148 44 118" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
            <circle cx="42" cy="110" r="13" fill="#FFD36B" />
            <path d="M166 170 Q192 148 196 118" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
            <circle cx="198" cy="110" r="13" fill="#FFD36B" />
          </>
        ) : pose === 'saluda' ? (
          <>
            <path d="M74 172 Q60 206 92 222" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
            <circle cx="103" cy="225" r="13" fill="#FFD36B" />
            <g className="p-brazo">
              <path d="M166 176 Q192 158 200 126" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
              <circle cx="202" cy="118" r="13" fill="#FFD36B" />
            </g>
          </>
        ) : (
          <>
            <path d="M74 172 Q60 206 92 222" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
            <path d="M166 172 Q180 206 148 222" fill="none" stroke="#F2B94B" strokeWidth="15" strokeLinecap="round" />
            <circle cx="103" cy="225" r="13" fill="#FFD36B" />
            <circle cx="137" cy="225" r="13" fill="#FFD36B" />
          </>
        )}
      </g>
    </svg>
  )
}
