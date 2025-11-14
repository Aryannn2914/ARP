import { sampleUnique } from "./random";

export type Std = "10th" | "12th";
export type Question = {
  id?: string | number;
  text: string;
  marks: 2 | 3 | 5;
  subject?: string;
  unit?: string;
  chapter?: string;
  options?: string[] | null;
  answer?: string;
  [k: string]: any;
};

export const SUBJECTS: Record<Std, string[]> = {
  "10th": ["maths1","maths2","science1","science2","history","civics","geography"],
  "12th": ["chem","english","phy","bio","maths1","maths2"],
};

async function loadJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return res.json();
}

async function loadSubjectPool(std: Std, subject: string): Promise<Question[]> {
  // read /manifest.json to know which chapter files to load
  const base = `/data/${std}/${subject}`;
  const manifest = await loadJSON<{ chapters: string[] }>(`${base}/manifest.json`);
  const chapters = Array.isArray(manifest?.chapters) ? manifest.chapters : [];

  const all: Question[] = [];
  for (const file of chapters) {
    try {
      const arr = await loadJSON<Question[]>(`${base}/${file}`);
      if (Array.isArray(arr)) all.push(...arr);
    } catch {}
  }
  // tag subject if missing
  return all.map(q => ({ subject, ...q }));
}

export async function buildPaper(params: {
  std: Std;
  subject: string;
  counts: { two: number; three: number; five: number };
  unit?: string | null;
  chapter?: string | null;
}) {
  const { std, subject, counts, unit, chapter } = params;
  const all = await loadSubjectPool(std, subject);

  const filter = (m: 2 | 3 | 5) =>
    all.filter(q =>
      q.marks === m &&
      (unit ? q.unit === unit : true) &&
      (chapter ? q.chapter === chapter : true)
    );

  const m2 = sampleUnique(filter(2), counts.two);
  const m3 = sampleUnique(filter(3), counts.three);
  const m5 = sampleUnique(filter(5), counts.five);

  return {
    meta: {
      standard: std, subject, unit: unit ?? null, chapter: chapter ?? null,
      createdAt: new Date().toISOString(),
      counts
    },
    sections: { "2": m2, "3": m3, "5": m5 },
    all: [...m2, ...m3, ...m5],
  };
}
