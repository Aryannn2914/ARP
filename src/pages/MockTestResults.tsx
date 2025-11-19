// src/pages/MockTestResults.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type TestConfig = {
  title: string;         // e.g. "Maths-I"
  numQuestions: string;  // "5" | "10" | ...
  questionType: string;  // NOW: "2" | "3" | "5"  (marks)
  difficulty: string;    // "easy" | "medium" | "hard"
};

/** Backend paper shape (from /api/mock) */
type BackendQ = {
  questions: string;
  chpt_no?: number;
  marks: 2 | 3 | 5;
  difficulty?: string;
};

type BackendPaper = {
  meta: {
    standard: "10th" | "12th";
    subject: string;                 // folder slug (e.g. maths1)
    totalRequested: number;
    marksChoice: "2" | "3" | "5" | "all";
    difficulty?: string;
    createdAt: string;
  };
  sections: { "2": BackendQ[]; "3": BackendQ[]; "5": BackendQ[] };
};

type Question = {
  id?: string | number;
  type?: string;
  difficulty?: string;
  marks?: number;
  text?: string;
  statement?: string;
  options?: string[];
  answer?: string;
  [k: string]: any;
};

export default function MockTestResults() {
  const { state } = useLocation() as {
    state?: { testConfig?: TestConfig; paper?: BackendPaper; standard?: "10th" | "12th" };
  };
  const navigate = useNavigate();
  const testConfig: TestConfig | undefined = state?.testConfig;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [paperMeta, setPaperMeta] = useState<BackendPaper["meta"] | null>(null);

  // (Kept for structure parity; not used now that data comes from backend)
  const subjectMap: Record<string, { indexPath: string; folder: string }> = {
    "Maths-I":   { indexPath: "/data/maths1/index.json",   folder: "/data/maths1/" },
    "Maths-II":  { indexPath: "/data/maths2/index.json",   folder: "/data/maths2/" },
    "Science-I": { indexPath: "/data/science1/index.json", folder: "/data/science1/" },
    "Science-II":{ indexPath: "/data/science2/index.json", folder: "/data/science2/" },
    "History":   { indexPath: "/data/history/index.json",  folder: "/data/history/" },
    "Geography": { indexPath: "/data/geography/index.json",folder: "/data/geography/" },
  };

  useEffect(() => {
    if (!testConfig) {
      toast.error("Missing test configuration");
      navigate(-1);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        // 1) Prefer paper from router state
        let paper: BackendPaper | null = state?.paper ?? null;

        // 2) Fallback: sessionStorage (set by generator)
        if (!paper) {
          try {
            paper = JSON.parse(sessionStorage.getItem("mock:paper") || "null");
          } catch {
            paper = null;
          }
        }

        if (!paper) throw new Error("No generated paper found. Please create a mock test again.");

        // Map backend sections (2/3/5) → flat Question[] while preserving your structure
        const flat: Question[] = []
          .concat(
            (paper.sections?.["2"] || []).map(toFrontQuestion),
            (paper.sections?.["3"] || []).map(toFrontQuestion),
            (paper.sections?.["5"] || []).map(toFrontQuestion)
          )
          // keep a stable id
          .map((q, idx) => ({ id: q.id ?? `${Date.now()}-${idx}`, ...q }));

        if (flat.length === 0) throw new Error("No questions found in the generated paper.");

        // If user asked for N questions, but backend sent more (e.g., marksChoice=all split),
        // trim to requested number (without re-randomizing so order remains)
        const requested = Math.max(1, parseInt(testConfig.numQuestions || "10", 10) || 10);
        const finalQs = flat.slice(0, requested);

        setQuestions(finalQs);
        setPaperMeta(paper.meta);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "Failed to load generated test");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!testConfig) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              Generated Test — {testConfig.title}
              {paperMeta ? (
                <span className="block text-sm font-normal text-muted-foreground">
                  {paperMeta.standard} • {paperMeta.subject} • {paperMeta.marksChoice.toUpperCase()}
                  {paperMeta.difficulty ? ` • ${paperMeta.difficulty}` : ""}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <>
                <div className="mb-4">
                  <strong>Questions:</strong> {questions.length}
                </div>

                <ol className="space-y-4">
                  {questions.map((q, i) => (
                    <li key={q.id ?? i}>
                      <div className="mb-1">
                        <strong>Q{i + 1}.</strong> {q.text || "No text available"}
                      </div>

                      {Array.isArray(q.options) && (
                        <ul className="list-disc ml-6">
                          {q.options.map((opt: string, idx: number) => (
                            <li key={idx}>{opt}</li>
                          ))}
                        </ul>
                      )}

                      <div className="text-sm text-muted-foreground">
                        {q.marks ? `${q.marks} marks` : null}
                        {q.difficulty ? ` • ${q.difficulty}` : null}
                        {q.chpt_no !== undefined ? ` • Ch: ${q.chpt_no}` : null}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex gap-3">
                  <Button onClick={() => navigate(-1)}>Back</Button>

                  
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* Helpers */

// Map a backend question to your front-end Question shape
function toFrontQuestion(bq: BackendQ): Question {
  return {
    text: bq.questions,
    marks: bq.marks,
    difficulty: (bq.difficulty || "").toLowerCase(),
    chpt_no: bq.chpt_no,
    // keep optional fields for UI compatibility
    options: undefined,
    type: inferQuestionType({ text: bq.questions }),
    raw: bq,
  };
}

function inferQuestionType(q: Question): string | undefined {
  if (Array.isArray(q.options) && q.options.length > 0) return "mcq";
  const txt = (q.text || q.statement || "").trim();
  if (!txt) return undefined;
  if (txt.length < 120) return "short";
  return "long";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
