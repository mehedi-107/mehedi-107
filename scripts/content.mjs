// Every word on the profile lives here. Edit, then run `npm run build`.
// Colors are terminal color names from scripts/theme.mjs.

export const profile = {
  name: 'Md. Mehedi Hasan',
  user: 'mehedi',
  host: 'buet',
  school: 'BUET CSE',
  focus: 'systems, networks, applied AI',
  motto: 'chasing the escaping sun',
  repositories: 'https://github.com/mehedi-107?tab=repositories',
  // Absolute URLs: GitHub resolves these reliably inside <picture> sources.
  assetBase: 'https://github.com/mehedi-107/mehedi-107/raw/main/assets/',
};

// `fetch` output, beside the MH logo.
export const fetchInfo = [
  ['role', 'CSE undergraduate @ BUET'],
  ['focus', 'systems · networks · applied AI'],
  ['langs', 'C++ · C · Python · TypeScript · Java · SQL'],
  ['stack', 'ns-3 · xv6 · NestJS · React · Docker'],
  ['awards', '2 hackathon podiums'],
  ['motto', 'chasing the escaping sun'],
];

// `ls -l ~/projects`: one clickable row each. Keep `about` within 50 characters.
export const projects = [
  {
    id: 'hystart',
    name: 'hystart-pp',
    lang: 'C++',
    about: 'RFC 9406 slow-start exit for CUBIC and NewReno',
    title: 'HyStart++ in ns-3',
    href: 'https://github.com/mehedi-107/ns-3-computer-network-project',
  },
  {
    id: 'agrisense',
    name: 'agrisense',
    lang: 'Python',
    about: 'farmer-first planning agent: weather + retrieval',
    title: 'IrisOut AgriSense',
    href: 'https://github.com/mehedi-107/IrisOut_AgriSense',
  },
  {
    id: 'compiler',
    name: 'c-compiler',
    lang: 'C++',
    about: 'flex → antlr4 → x86-16, with a peephole pass',
    title: 'Compiler for a subset of C',
    href: 'https://github.com/mehedi-107/cse-310-compiler-sessional',
  },
  {
    id: 'xv6',
    name: 'xv6-mlfq',
    lang: 'C',
    about: 'syscall history, tickets and an MLFQ scheduler',
    title: 'xv6, scheduling and IPC',
    href: 'https://github.com/mehedi-107/cse-314-operating-system',
  },
  {
    id: 'commerce',
    name: 'commerce',
    lang: 'TS',
    about: 'React storefront on a NestJS + MongoDB API',
    title: 'Full-stack commerce',
    href: 'https://github.com/mehedi-107/cse-326-amazon-frontend',
  },
  {
    id: 'coursework',
    name: 'coursework',
    lang: 'md',
    about: 'every BUET CSE project, indexed by term',
    title: 'Academic Works',
    href: 'https://github.com/mehedi-107/Academic-Works',
  },
];

// `cat awards.log`
export const awards = [
  {
    id: 'poridhi',
    date: '2025-04-26',
    place: 'FIRST PRIZE',
    color: 'green',
    event: 'AI Engineering Hackathon',
    org: 'Poridhi.io × Brain Station 23',
  },
  {
    id: 'bcf',
    date: '2024',
    place: '2ND RUNNER-UP',
    color: 'yellow',
    event: 'Microservice & DevOps Hackathon',
    org: 'BUET CSE Fest 2024',
    href: 'https://github.com/mehedi-107/bcf2024',
  },
];

// `cat ~/.config/stack.toml`
export const stack = [
  ['languages', ['C++', 'C', 'Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'Bash']],
  ['systems', ['ns-3', 'xv6', 'pthreads', 'Flex', 'ANTLR4', 'x86-16']],
  ['web', ['React', 'Vite', 'Tailwind', 'NestJS', 'Express', 'Swagger']],
  ['data', ['MongoDB', 'PostgreSQL', 'Chroma']],
  ['ai', ['embeddings', 'A*', 'minimax', 'decision trees', 'GRASP']],
  ['platform', ['Docker', 'GitHub Actions', 'Vercel', 'Linux', 'Git']],
];

// `cat links.txt`: one clickable row per link.
export const links = {
  command: 'cat links.txt',
  items: [
    {
      id: 'linkedin',
      label: 'linkedin',
      shown: 'linkedin.com/in/md-mehedi-hasan-369581281',
      hint: 'say hello',
      href: 'https://www.linkedin.com/in/md-mehedi-hasan-369581281',
    },
    {
      id: 'scholar',
      label: 'scholar',
      shown: 'scholar.google.com/citations?user=wuuYLMEAAAAJ',
      hint: 'publications',
      href: 'https://scholar.google.com/citations?user=wuuYLMEAAAAJ',
    },
  ],
};
