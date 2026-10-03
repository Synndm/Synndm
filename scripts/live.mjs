// Gera assets/live/agora.svg com dados reais do GitHub e o horário de Belém.
// Roda na GitHub Action (.github/workflows/live.yml) a cada hora; também roda local: `node scripts/live.mjs`.
import { mkdir, writeFile } from 'node:fs/promises';

const USER = 'Synndm';
const OUT = new URL('../assets/live/agora.svg', import.meta.url);
const headers = { 'User-Agent': USER, Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const gh = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};

const [repos, events] = await Promise.all([
  gh(`/users/${USER}/repos?per_page=100&sort=pushed`),
  gh(`/users/${USER}/events/public?per_page=100`),
]);

// ---------- dados ----------
const now = new Date();
const own = repos.filter((r) => !r.fork && r.name !== USER);
const last = own[0];
const stars = own.reduce((n, r) => n + r.stargazers_count, 0);

const DAYS = 14;
const belemDay = (d) => new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10); // UTC-3, sem horário de verão
const days = Array.from({ length: DAYS }, (_, i) => belemDay(new Date(now.getTime() - (DAYS - 1 - i) * 86400e3)));
const perDay = Object.fromEntries(days.map((d) => [d, 0]));
for (const e of events) if (e.type === 'PushEvent') {
  const d = belemDay(new Date(e.created_at));
  if (d in perDay) perDay[d]++;
}
const counts = days.map((d) => perDay[d]);
const total = counts.reduce((a, b) => a + b, 0);

const hour = process.env.HOUR ? Number(process.env.HOUR) : (now.getUTCHours() + 21) % 24; // HOUR=20 para testar
const minute = now.getUTCMinutes();
const period = hour < 5 ? 'madrugada' : hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite';
const greeting = { madrugada: 'Madrugada em Belém', manha: 'Bom dia de Belém', tarde: 'Boa tarde de Belém', noite: 'Boa noite de Belém' }[period];
const clock = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const ago = (iso) => {
  const m = Math.round((now - new Date(iso)) / 60000);
  if (m < 60) return `há ${Math.max(m, 1)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- céu ----------
const SKY = {
  madrugada: ['#05030F', '#1E1B4B', '#312E81'],
  manha: ['#1E3A8A', '#F97316', '#FDBA74'],
  tarde: ['#1D4ED8', '#7C3AED', '#C084FC'],
  noite: ['#0B0620', '#3B0764', '#7E22CE'],
}[period];
const night = period === 'madrugada' || period === 'noite';
// arco do sol/lua: 6h→18h (sol) ou 18h→6h (lua), da esquerda para a direita
const t = night ? (((hour + 6) % 24) * 60 + minute) / 720 : ((hour - 6) * 60 + minute) / 720;
const bx = 40 + t * 220, by = 168 - Math.sin(Math.PI * t) * 72; // nasce e se põe atrás dos prédios

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const stars_ = night
  ? Array.from({ length: 34 }, (_, i) => `<circle class="tw" style="animation-delay:-${(rnd() * 3).toFixed(2)}s" cx="${(rnd() * 300).toFixed(1)}" cy="${(rnd() * 140).toFixed(1)}" r="${(rnd() * 1.1 + .4).toFixed(2)}" fill="#fff"/>`).join('')
  : '';
const body = night
  ? `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><circle r="18" fill="#F5F3FF" mask="url(#moon)"/></g>`
  : `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><circle class="halo" r="34" fill="#FDE68A" fill-opacity=".25"/><circle r="20" fill="#FDE68A"/></g>`;

// ---------- gráfico ----------
const max = Math.max(...counts, 1);
const CX = 360, CW = 480, CB = 222, CH = 64, gap = 6, bw = (CW - gap * (DAYS - 1)) / DAYS;
const bars = counts.map((c, i) => {
  const h = c ? Math.max(4, (c / max) * CH) : 2;
  const x = CX + i * (bw + gap);
  return `<rect class="bar" style="animation-delay:${(i * 0.04).toFixed(2)}s" x="${x.toFixed(1)}" y="${(CB - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${c ? 'url(#barg)' : '#FFFFFF'}" fill-opacity="${c ? 1 : .08}"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="250" viewBox="0 0 880 250" role="img" aria-label="${esc(`${greeting}, ${clock}. Último push em ${last?.name ?? '—'} ${last ? ago(last.pushed_at) : ''}. ${total} pushes nos últimos ${DAYS} dias.`)}">
  <defs>
    <clipPath id="frame"><rect width="880" height="250" rx="18"/></clipPath>
    <mask id="moon"><circle r="18" fill="#fff"/><circle cx="8" cy="-6" r="15" fill="#000"/></mask>
    <clipPath id="sky"><rect width="300" height="250"/></clipPath>
    <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY[0]}"/><stop offset=".65" stop-color="${SKY[1]}"/><stop offset="1" stop-color="${SKY[2]}"/></linearGradient>
    <linearGradient id="barg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#C084FC"/></linearGradient>
    <linearGradient id="fadeR" x1="0" x2="1"><stop offset=".7" stop-color="#0D0B16" stop-opacity="0"/><stop offset="1" stop-color="#0D0B16"/></linearGradient>
  </defs>
  <style>
    .sans { font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif; }
    .mono { font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; }
    .tw { animation: tw 3s ease-in-out infinite; }
    @keyframes tw { 50% { opacity: .2; } }
    .halo { animation: halo 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes halo { 50% { transform: scale(1.25); opacity: .5; } }
    .wave { animation: wave 6s ease-in-out infinite alternate; }
    .wave2 { animation-duration: 8s; animation-direction: alternate-reverse; }
    @keyframes wave { to { transform: translateX(-40px); } }
    .bar { transform-box: fill-box; transform-origin: bottom; transform: scaleY(0); animation: grow .7s cubic-bezier(.2,.7,.2,1) forwards; }
    @keyframes grow { to { transform: scaleY(1); } }
    .live { animation: live 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes live { from { transform: scale(1); opacity: .9; } to { transform: scale(3); opacity: 0; } }
    .in { opacity: 0; animation: in .6s ease-out forwards; }
    .d1 { animation-delay: .1s; } .d2 { animation-delay: .25s; } .d3 { animation-delay: .4s; }
    @keyframes in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .tw, .halo, .wave, .live { animation: none; } .bar { animation: none; transform: none; } .in { animation: none; opacity: 1; } }
  </style>

  <g clip-path="url(#frame)">
    <rect width="880" height="250" fill="#0D0B16"/>

    <!-- céu de Belém -->
    <g clip-path="url(#sky)">
      <rect width="300" height="250" fill="url(#skyg)"/>
      ${stars_}
      ${body}
      <path d="M0 176h18v-22h14v22h10v-40h20v40h8v-28h16v28h12v-52h22v52h10v-30h14v30h16v-18h12v18h20v-46h18v46h12v-26h16v26h20v-34h14v34h28V250H0z" fill="#07050F" fill-opacity=".85"/>
      <g class="wave"><path d="M-40 196q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0V250H-40z" fill="#1E1B4B" fill-opacity=".9"/></g>
      <g class="wave wave2"><path d="M-40 212q20-7 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0V250H-40z" fill="#312E81" fill-opacity=".85"/></g>
      <rect width="300" height="250" fill="url(#fadeR)"/>
      <text class="mono" x="22" y="34" font-size="11" fill="#FFFFFF" fill-opacity=".75" letter-spacing="1.5">BELÉM, PA</text>
      <text class="sans" x="22" y="70" font-size="34" font-weight="800" fill="#FFFFFF">${clock}</text>
    </g>

    <!-- painel -->
    <g class="in d1">
      <circle cx="338" cy="36" r="4" fill="#EF4444"/>
      <circle class="live" cx="338" cy="36" r="4" fill="#EF4444"/>
      <text class="mono" x="352" y="40" font-size="11" fill="#F87171" letter-spacing="1.5">AO VIVO</text>
      <text class="mono" x="840" y="40" font-size="11" fill="#52525B" text-anchor="end">atualiza a cada hora</text>
      <text class="sans" x="330" y="80" font-size="26" font-weight="800" fill="#F4F4F5">${greeting}</text>
    </g>

    <g class="in d2">
      <text class="mono" x="330" y="112" font-size="11" fill="#71717A">último push</text>
      <text class="sans" x="330" y="134" font-size="17" font-weight="600" fill="#E9D5FF">${esc(last?.name ?? '—')}</text>
      <text class="sans" x="330" y="152" font-size="12" fill="#A1A1AA">${last ? esc(ago(last.pushed_at)) : ''}${last?.language ? ` · ${esc(last.language)}` : ''}</text>

      <text class="mono" x="610" y="112" font-size="11" fill="#71717A">pushes · ${DAYS} dias</text>
      <text class="sans" x="610" y="140" font-size="26" font-weight="800" fill="#F4F4F5">${total}</text>

      <text class="mono" x="740" y="112" font-size="11" fill="#71717A">repos</text>
      <text class="sans" x="740" y="140" font-size="26" font-weight="800" fill="#F4F4F5">${own.length}${stars ? `<tspan font-size="13" font-weight="600" fill="#FACC15" dx="8">★ ${stars}</tspan>` : ''}</text>
    </g>

    <g class="in d3">${bars}</g>
    <text class="mono" x="360" y="240" font-size="10" fill="#52525B">${days[0].slice(8)}/${days[0].slice(5, 7)}</text>
    <text class="mono" x="840" y="240" font-size="10" fill="#52525B" text-anchor="end">hoje</text>
  </g>
  <rect x=".5" y=".5" width="879" height="249" rx="17.5" fill="none" stroke="#FFFFFF" stroke-opacity=".1"/>
</svg>
`;

await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, svg);
console.log(`agora.svg: ${greeting}, ${clock}, último push ${last?.name}, ${total} pushes em ${DAYS} dias`);
