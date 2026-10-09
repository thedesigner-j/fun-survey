// Built-in illustration library. Every illustration is a 200×200 SVG drawn
// with a chunky ink outline; little parts animate via classes in styles.css.

const INK = '#27251f'
const RED = '#da291c'
const YELLOW = '#ffc72c'
const BUN = '#f2a63b'
const BLUSH = '#ff8fab'

const Face = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="-11" cy="0" r="4.5" fill={INK} stroke="none" />
    <circle cx="11" cy="0" r="4.5" fill={INK} stroke="none" />
    <circle cx="-9.5" cy="-1.5" r="1.4" fill="#fff" stroke="none" />
    <circle cx="12.5" cy="-1.5" r="1.4" fill="#fff" stroke="none" />
    <path d="M-7 9 Q0 16 7 9" fill="none" />
    <ellipse cx="-21" cy="9" rx="5.5" ry="3.2" fill={BLUSH} stroke="none" opacity=".85" />
    <ellipse cx="21" cy="9" rx="5.5" ry="3.2" fill={BLUSH} stroke="none" opacity=".85" />
  </g>
)

const Sparkle = ({ x, y, s = 1, fill = '#fff', delay = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      className="ill-twinkle"
      style={{ animationDelay: `${delay}s` }}
      d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z"
      fill={fill}
      strokeWidth="3"
    />
  </g>
)

function starPoints(cx, cy, outer, inner, n = 5) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / n) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const Svg = ({ children }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
)

const Rocket = () => (
  <Svg>
    <Sparkle x={38} y={50} delay={0} />
    <Sparkle x={165} y={70} s={0.7} delay={0.6} />
    <Sparkle x={150} y={165} s={0.6} delay={1.1} />
    <g className="ill-float">
      <path className="ill-flicker" d="M84 140 Q100 196 116 140Z" fill="#ff9f43" />
      <path className="ill-flicker" style={{ animationDelay: '.15s' }} d="M92 140 Q100 170 108 140Z" fill="#ffe066" />
      <path d="M74 108 L50 142 L78 136Z" fill={RED} />
      <path d="M126 108 L150 142 L122 136Z" fill={RED} />
      <path d="M100 28 C132 54 134 100 126 142 L74 142 C66 100 68 54 100 28Z" fill="#fff" />
      <path d="M100 28 C111 37 118 47 122 60 L78 60 C82 47 89 37 100 28Z" fill={RED} />
      <circle cx="100" cy="92" r="17" fill="#7cc6fe" />
      <path d="M92 86 Q96 80 102 81" fill="none" stroke="#fff" />
      <path d="M100 142 L100 120" />
    </g>
  </Svg>
)

const Coffee = () => (
  <Svg>
    <path className="ill-steam" d="M78 62 Q70 50 78 40 Q86 30 78 20" fill="none" />
    <path className="ill-steam" style={{ animationDelay: '.5s' }} d="M100 58 Q92 46 100 36 Q108 26 100 16" fill="none" />
    <path className="ill-steam" style={{ animationDelay: '1s' }} d="M122 62 Q114 50 122 40 Q130 30 122 20" fill="none" />
    <ellipse cx="100" cy="160" rx="64" ry="13" fill="#ffd6a5" />
    <path d="M142 96 C178 92 176 142 136 136" fill="none" strokeWidth="14" />
    <path d="M142 96 C178 92 176 142 136 136" fill="none" strokeWidth="5" stroke="#ff8fab" />
    <path d="M55 80 L145 80 L138 148 Q100 164 62 148Z" fill="#ff8fab" />
    <ellipse cx="100" cy="80" rx="45" ry="10" fill="#7b4b2a" />
    <Face x={100} y={114} />
  </Svg>
)

const Planet = () => (
  <Svg>
    <Sparkle x={30} y={40} delay={0.2} />
    <Sparkle x={170} y={150} s={0.8} delay={0.9} />
    <Sparkle x={40} y={165} s={0.6} delay={1.4} />
    <g className="ill-float-slow">
      <circle cx="166" cy="42" r="13" fill="#e9ecef" />
      <g transform="rotate(-18 100 100)">
        <ellipse cx="100" cy="100" rx="82" ry="21" fill="none" strokeWidth="14" />
        <ellipse cx="100" cy="100" rx="82" ry="21" fill="none" strokeWidth="6" stroke="#ffd166" />
      </g>
      <circle cx="100" cy="100" r="46" fill="#b388ff" />
      <path d="M62 78 Q100 70 136 80" fill="none" stroke="#9b6bff" strokeWidth="6" />
      <g transform="rotate(-18 100 100)">
        <path d="M18 100 A82 21 0 0 0 182 100" fill="none" strokeWidth="14" />
        <path d="M18 100 A82 21 0 0 0 182 100" fill="none" strokeWidth="6" stroke="#ffd166" />
      </g>
      <Face x={100} y={102} />
    </g>
  </Svg>
)

const Pizza = () => (
  <Svg>
    <g className="ill-wobble">
      <path d="M38 54 Q100 34 162 54 L100 178Z" fill="#ffd166" />
      <path d="M34 50 Q100 24 166 50 L160 64 Q100 42 40 64Z" fill="#e9a86b" />
      <circle cx="74" cy="78" r="10" fill="#ef476f" />
      <circle cx="128" cy="76" r="9" fill="#ef476f" />
      <circle cx="101" cy="142" r="7" fill="#ef476f" />
      <path d="M128 100 Q131 118 126 122 Q121 118 124 100" fill="#ffd166" />
      <Face x={100} y={102} s={0.85} />
    </g>
  </Svg>
)

const Ghost = () => (
  <Svg>
    <ellipse className="ill-shadow" cx="100" cy="186" rx="34" ry="6" fill={INK} stroke="none" opacity=".15" />
    <g className="ill-float">
      <path
        d="M55 168 L55 90 C55 38 145 38 145 90 L145 168 Q133 156 122 168 Q111 180 100 168 Q89 156 78 168 Q67 180 55 168Z"
        fill="#fff"
      />
      <path d="M55 112 Q40 118 44 132" fill="none" />
      <path d="M145 112 Q160 118 156 132" fill="none" />
      <Face x={100} y={98} s={1.15} />
    </g>
  </Svg>
)

const Bulb = () => (
  <Svg>
    <g className="ill-rays">
      <path d="M100 6 L100 18" />
      <path d="M38 34 L47 43" />
      <path d="M162 34 L153 43" />
      <path d="M18 86 L31 86" />
      <path d="M182 86 L169 86" />
    </g>
    <g className="ill-float-slow">
      <path
        d="M100 30 C64 30 48 60 60 88 C66 104 78 112 80 128 L120 128 C122 112 134 104 140 88 C152 60 136 30 100 30Z"
        fill="#ffe066"
      />
      <path d="M72 62 Q76 48 90 42" fill="none" stroke="#fff" strokeWidth="5" />
      <rect x="80" y="128" width="40" height="14" rx="4" fill="#ced4da" />
      <rect x="84" y="142" width="32" height="12" rx="4" fill="#adb5bd" />
      <path d="M92 154 Q100 164 108 154" fill={INK} />
      <Face x={100} y={84} />
    </g>
  </Svg>
)

const Cat = () => (
  <Svg>
    <g className="ill-wobble">
      <path d="M52 88 L48 36 L88 64Z" fill="#ffa94d" />
      <path d="M148 88 L152 36 L112 64Z" fill="#ffa94d" />
      <path d="M58 76 L56 50 L76 64Z" fill="#ffc9de" strokeWidth="3" />
      <path d="M142 76 L144 50 L124 64Z" fill="#ffc9de" strokeWidth="3" />
      <ellipse cx="100" cy="112" rx="60" ry="52" fill="#ffa94d" />
      <path d="M86 66 L90 82 M100 62 L100 80 M114 66 L110 82" stroke="#e8590c" strokeWidth="5" />
      <Face x={100} y={112} />
      <path d="M96 116 L104 116 L100 121Z" fill={INK} strokeWidth="2" />
      <path d="M36 112 L64 116 M38 128 L64 124" strokeWidth="3" />
      <path d="M164 112 L136 116 M162 128 L136 124" strokeWidth="3" />
    </g>
  </Svg>
)

const Trophy = () => (
  <Svg>
    <Sparkle x={34} y={40} delay={0} />
    <Sparkle x={168} y={52} s={0.8} delay={0.7} />
    <Sparkle x={160} y={150} s={0.6} delay={1.3} />
    <g className="ill-float-slow">
      <path d="M68 52 Q38 52 44 76 Q50 94 72 92" fill="none" strokeWidth="12" />
      <path d="M68 52 Q38 52 44 76 Q50 94 72 92" fill="none" strokeWidth="4" stroke="#ffd166" />
      <path d="M132 52 Q162 52 156 76 Q150 94 128 92" fill="none" strokeWidth="12" />
      <path d="M132 52 Q162 52 156 76 Q150 94 128 92" fill="none" strokeWidth="4" stroke="#ffd166" />
      <path d="M64 38 L136 38 L132 86 Q128 116 100 120 Q72 116 68 86Z" fill="#ffd166" />
      <rect x="91" y="119" width="18" height="20" fill="#f4a261" />
      <rect x="70" y="138" width="60" height="16" rx="4" fill="#f4a261" />
      <rect x="62" y="154" width="76" height="16" rx="5" fill="#8d5524" />
      <polygon className="ill-spin" points={starPoints(100, 76, 20, 9)} fill="#fff" strokeWidth="3" />
    </g>
  </Svg>
)

const Heart = () => (
  <Svg>
    <Sparkle x={36} y={44} delay={0.1} />
    <Sparkle x={166} y={46} s={0.8} delay={0.8} />
    <Sparkle x={170} y={150} s={0.6} delay={1.4} />
    <g className="ill-beat">
      <path
        d="M100 166 C40 126 28 96 38 70 C48 44 86 38 100 68 C114 38 152 44 162 70 C172 96 160 126 100 166Z"
        fill={RED}
      />
      <path d="M54 72 Q58 58 72 56" fill="none" stroke="#fff" strokeWidth="5" />
      <Face x={100} y={102} />
    </g>
  </Svg>
)

const Music = () => (
  <Svg>
    <g className="ill-bop">
      <path d="M80 48 L152 32 L152 50 L80 66Z" fill={INK} />
      <path d="M82 56 L82 140" strokeWidth="8" />
      <path d="M150 42 L150 124" strokeWidth="8" />
      <ellipse cx="66" cy="142" rx="21" ry="16" transform="rotate(-20 66 142)" fill="#4dabf7" />
      <ellipse cx="134" cy="126" rx="21" ry="16" transform="rotate(-20 134 126)" fill="#4dabf7" />
      <Face x={66} y={142} s={0.48} />
      <Face x={134} y={126} s={0.48} />
    </g>
    <path className="ill-twinkle" d="M30 70 Q36 60 30 50" fill="none" />
    <path className="ill-twinkle" style={{ animationDelay: '.6s' }} d="M176 92 Q182 82 176 72" fill="none" />
  </Svg>
)

const Chat = () => (
  <Svg>
    <g className="ill-float">
      <path d="M48 100 L38 134 L82 104Z" fill="#7cc6fe" />
      <rect x="24" y="36" width="114" height="72" rx="26" fill="#7cc6fe" />
      <circle className="ill-dot" cx="56" cy="72" r="6" fill={INK} stroke="none" />
      <circle className="ill-dot" style={{ animationDelay: '.15s' }} cx="81" cy="72" r="6" fill={INK} stroke="none" />
      <circle className="ill-dot" style={{ animationDelay: '.3s' }} cx="106" cy="72" r="6" fill={INK} stroke="none" />
    </g>
    <g className="ill-float-slow">
      <path d="M148 150 L166 180 L128 156Z" fill="#ffd166" />
      <rect x="74" y="100" width="104" height="62" rx="24" fill="#ffd166" />
      <Face x={126} y={128} s={0.75} />
    </g>
  </Svg>
)

const Cactus = () => (
  <Svg>
    <g className="ill-wobble">
      <path d="M84 112 L62 112 Q46 112 46 96 L46 78 Q46 68 56 68 Q66 68 66 78 L66 94 L84 94Z" fill="#69db7c" />
      <path d="M116 100 L138 100 Q154 100 154 84 L154 66 Q154 56 144 56 Q134 56 134 66 L134 82 L116 82Z" fill="#69db7c" />
      <rect x="77" y="46" width="46" height="96" rx="23" fill="#69db7c" />
      <g className="ill-spin-slow">
        <circle cx="100" cy="36" r="7" fill="#ff8fab" />
        <circle cx="111" cy="44" r="7" fill="#ff8fab" />
        <circle cx="89" cy="44" r="7" fill="#ff8fab" />
        <circle cx="100" cy="44" r="5" fill="#ffe066" />
      </g>
      <path d="M86 128 L82 126 M118 70 L122 68 M56 84 L52 82 M146 74 L150 72" strokeWidth="3" />
      <Face x={100} y={92} s={0.8} />
    </g>
    <rect x="58" y="132" width="84" height="16" rx="5" fill="#f4a261" />
    <path d="M65 148 L135 148 L127 186 L73 186Z" fill="#e76f51" />
  </Svg>
)

const Party = () => (
  <Svg>
    <g className="ill-confetti">
      <rect x="120" y="40" width="10" height="16" rx="2" fill={RED} transform="rotate(20 125 48)" />
      <rect x="150" y="80" width="10" height="16" rx="2" fill="#4dabf7" transform="rotate(-30 155 88)" />
      <rect x="92" y="24" width="10" height="16" rx="2" fill="#69db7c" transform="rotate(-10 97 32)" />
      <circle cx="160" cy="44" r="6" fill="#ffd166" />
      <circle cx="132" cy="104" r="5" fill="#b388ff" />
      <circle cx="74" cy="44" r="5" fill="#ff9f43" />
    </g>
    <path className="ill-twinkle" d="M90 80 Q100 60 120 66 Q140 72 150 54" fill="none" stroke={RED} strokeWidth="5" />
    <path className="ill-twinkle" style={{ animationDelay: '.5s' }} d="M84 70 Q74 50 90 36" fill="none" stroke="#4dabf7" strokeWidth="5" />
    <g className="ill-wobble">
      <path d="M36 172 L72 86 L122 136Z" fill="#b388ff" />
      <path d="M52 134 L88 154 M62 110 L104 138" stroke="#fff" strokeWidth="6" />
      <path d="M36 172 L72 86 L122 136Z" fill="none" />
      <ellipse cx="97" cy="111" rx="36" ry="12" transform="rotate(45 97 111)" fill="#9b6bff" />
    </g>
  </Svg>
)

const Sun = () => (
  <Svg>
    <g className="ill-spin-slow">
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d="M100 12 L108 34 L92 34Z"
          fill="#ff9f43"
          transform={`rotate(${i * 36} 100 100)`}
        />
      ))}
    </g>
    <circle cx="100" cy="100" r="54" fill="#ffd43b" />
    <Face x={100} y={102} s={1.2} />
  </Svg>
)

const Star = () => (
  <Svg>
    <Sparkle x={34} y={48} delay={0} />
    <Sparkle x={170} y={160} s={0.7} delay={0.8} />
    <g className="ill-float">
      <polygon points={starPoints(100, 106, 78, 36)} fill="#ffd43b" />
      <Face x={100} y={110} />
    </g>
  </Svg>
)


const Fries = () => (
  <Svg>
    <Sparkle x={36} y={52} fill={YELLOW} delay={0} />
    <Sparkle x={166} y={40} s={0.7} fill={YELLOW} delay={0.7} />
    <g className="ill-wobble">
      <rect x="62" y="44" width="15" height="74" rx="3" fill={YELLOW} transform="rotate(-12 69 81)" />
      <rect x="79" y="28" width="15" height="86" rx="3" fill={YELLOW} transform="rotate(-4 86 71)" />
      <rect x="96" y="20" width="15" height="92" rx="3" fill="#ffd85c" />
      <rect x="112" y="30" width="15" height="84" rx="3" fill={YELLOW} transform="rotate(5 119 72)" />
      <rect x="126" y="46" width="15" height="72" rx="3" fill={YELLOW} transform="rotate(13 133 82)" />
      <path d="M50 94 Q100 116 150 94 L136 182 L64 182Z" fill={RED} />
      <path d="M58 104 Q100 122 142 104" fill="none" stroke="#fff" strokeWidth="3" opacity=".5" />
      <Face x={100} y={146} />
    </g>
  </Svg>
)

const Burger = () => (
  <Svg>
    <Sparkle x={34} y={44} fill={YELLOW} delay={0.2} />
    <Sparkle x={168} y={150} s={0.7} fill={YELLOW} delay={1} />
    <g className="ill-float-slow">
      <path d="M46 136 L154 136 Q154 162 132 162 L68 162 Q46 162 46 136Z" fill={BUN} />
      <rect x="40" y="114" width="120" height="24" rx="12" fill="#7b3f1d" />
      <path d="M44 106 L156 106 L150 118 L130 118 L121 132 L112 118 L50 118Z" fill={YELLOW} />
      <path
        d="M38 100 Q48 112 58 100 Q68 112 78 100 Q88 112 100 100 Q112 112 122 100 Q132 112 142 100 Q152 112 162 100 L160 108 L40 108Z"
        fill="#6cc24a"
      />
      <path d="M42 98 Q42 42 100 42 Q158 42 158 98Z" fill={BUN} />
      <g fill="#fff8e7" strokeWidth="2">
        <ellipse cx="74" cy="60" rx="4" ry="2.5" transform="rotate(-20 74 60)" />
        <ellipse cx="100" cy="52" rx="4" ry="2.5" />
        <ellipse cx="126" cy="60" rx="4" ry="2.5" transform="rotate(20 126 60)" />
      </g>
      <Face x={100} y={78} s={0.9} />
    </g>
  </Svg>
)

const Drink = () => (
  <Svg>
    <g className="ill-bop">
      <path d="M108 12 L120 14 L112 62 L100 60Z" fill="#fff" />
      <path d="M109 22 L119 24 M106 38 L116 40" stroke={RED} strokeWidth="5" />
      <path d="M58 68 L142 68 L130 182 L70 182Z" fill={RED} />
      <path d="M62 102 L138 102 L135 128 L65 128Z" fill={YELLOW} />
      <path d="M60 56 Q100 34 140 56Z" fill="#fff" />
      <rect x="50" y="54" width="100" height="16" rx="7" fill="#fff" />
      <Face x={100} y={152} />
    </g>
    <circle className="ill-twinkle" cx="40" cy="120" r="5" fill="#fff" />
    <circle className="ill-twinkle" style={{ animationDelay: '.6s' }} cx="162" cy="96" r="4" fill="#fff" />
  </Svg>
)

const NUGGET = 'M-32 4 Q-36 -22 -8 -26 Q20 -32 30 -6 Q38 22 8 28 Q-28 34 -32 4Z'
const Nuggets = () => (
  <Svg>
    <ellipse cx="100" cy="176" rx="70" ry="10" fill={INK} stroke="none" opacity=".1" />
    <g className="ill-wobble">
      <g transform="translate(66 108) rotate(-18)">
        <path d={NUGGET} fill="#e9a23b" />
        <circle cx="-10" cy="-6" r="2" fill="#b86e1b" stroke="none" />
        <circle cx="8" cy="6" r="2" fill="#b86e1b" stroke="none" />
      </g>
      <g transform="translate(136 100) rotate(22)">
        <path d={NUGGET} fill="#e9a23b" />
        <circle cx="-6" cy="8" r="2" fill="#b86e1b" stroke="none" />
        <circle cx="12" cy="-8" r="2" fill="#b86e1b" stroke="none" />
      </g>
      <g transform="translate(100 140) scale(1.25)">
        <path d={NUGGET} fill="#f2b552" />
      </g>
      <Face x={100} y={142} s={0.85} />
    </g>
    <Sparkle x={40} y={52} fill={YELLOW} delay={0.4} />
  </Svg>
)

const Cone = () => (
  <Svg>
    <Sparkle x={42} y={48} delay={0} />
    <Sparkle x={162} y={72} s={0.7} fill={YELLOW} delay={0.8} />
    <g className="ill-float">
      <path d="M70 102 L130 102 L100 184Z" fill="#e9a86b" />
      <path d="M80 118 L120 118 M88 140 L112 140 M84 106 L106 160 M116 106 L94 160" strokeWidth="3" />
      <path
        d="M62 104 Q56 82 80 80 Q76 60 98 58 Q96 38 108 30 Q126 44 120 60 Q142 64 138 82 Q146 100 138 104Z"
        fill="#fff"
      />
      <path d="M74 92 Q100 100 128 90" fill="none" strokeWidth="3" opacity=".35" />
      <Face x={100} y={80} s={0.8} />
    </g>
  </Svg>
)

const Bag = () => (
  <Svg>
    <path className="ill-steam" d="M84 36 Q78 26 84 18 Q90 10 84 2" fill="none" />
    <path className="ill-steam" style={{ animationDelay: '.6s' }} d="M116 36 Q110 26 116 18 Q122 10 116 2" fill="none" />
    <g className="ill-wobble">
      <path d="M54 56 L146 56 L154 182 L46 182Z" fill="#d9b07a" />
      <path d="M54 56 L146 56 L144 74 L56 74Z" fill="#c4955a" />
      <path d="M56 74 L66 66 L76 74 L86 66 L96 74 L106 66 L116 74 L126 66 L136 74 L144 74" fill="none" strokeWidth="3" />
      <rect x="70" y="96" width="60" height="34" rx="10" fill={RED} />
      <path d="M86 113 L114 113" stroke={YELLOW} strokeWidth="6" />
      <Face x={100} y={156} />
    </g>
  </Svg>
)

export const ILLUSTRATIONS = {
  fries: { label: 'Fries', Component: Fries },
  burger: { label: 'Burger', Component: Burger },
  drink: { label: 'Drink', Component: Drink },
  nuggets: { label: 'Nuggets', Component: Nuggets },
  cone: { label: 'Cone', Component: Cone },
  bag: { label: 'Takeout', Component: Bag },
  rocket: { label: 'Rocket', Component: Rocket },
  sun: { label: 'Sunny', Component: Sun },
  planet: { label: 'Planet', Component: Planet },
  heart: { label: 'Heart', Component: Heart },
  chat: { label: 'Chat', Component: Chat },
  bulb: { label: 'Idea', Component: Bulb },
  coffee: { label: 'Coffee', Component: Coffee },
  pizza: { label: 'Pizza', Component: Pizza },
  ghost: { label: 'Ghost', Component: Ghost },
  cat: { label: 'Cat', Component: Cat },
  trophy: { label: 'Trophy', Component: Trophy },
  music: { label: 'Music', Component: Music },
  cactus: { label: 'Cactus', Component: Cactus },
  star: { label: 'Star', Component: Star },
  party: { label: 'Party', Component: Party },
}

export const isImageUrl = (value) => typeof value === 'string' && /^(https?:)?\/\//.test(value)

export function Illustration({ value, className = '' }) {
  if (isImageUrl(value)) {
    return <img className={`illustration ${className}`} src={value} alt="" draggable="false" />
  }
  const entry = ILLUSTRATIONS[value] ?? ILLUSTRATIONS.fries
  return (
    <div className={`illustration ${className}`}>
      <entry.Component />
    </div>
  )
}
