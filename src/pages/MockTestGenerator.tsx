// src/pages/MockTestGenerator.tsx
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TestConfig = {
  title: string; // Subject label (e.g., "Maths-I")
  numQuestions: string; // "5" | "10" | "15" | "20"
  questionType: string; // NOW = "2" | "3" | "5"
  difficulty: string; // "easy" | "medium" | "hard"
};

// Backend base
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Standard options
const STANDARD_OPTIONS = ["10th", "12th"] as const;
type Std = (typeof STANDARD_OPTIONS)[number];

// Subjects shown depend on Standard
const SUBJECTS_BY_STANDARD: Record<Std, string[]> = {
  "10th": [
    "Maths-I",
    "Maths-II",
    "Science-I",
    "Science-II",
    "History",
    "Geography",
    "Civics",
  ],
  "12th": ["Chemistry", "English", "Physics", "Biology", "Maths-I", "Maths-II"],
};

// Map UI subject label → folder slug per standard
const SUBJECT_SLUG: Record<Std, Record<string, string>> = {
  "10th": {
    "Maths-I": "maths1",
    "Maths-II": "maths2",
    "Science-I": "science1",
    "Science-II": "science2",
    "History": "history",
    "Geography": "geography",
    "Civics": "civics",
  },
  "12th": {
    "Chemistry": "chem",
    "English": "english",
    "Physics": "phy",
    "Biology": "bio",
    "Maths-I": "maths1",
    "Maths-II": "maths2",
  },
};

export default function MockTestGenerator() {
  const navigate = useNavigate();

  // NEW: standard lives outside testConfig (we keep your TestConfig shape unchanged)
  const [standard, setStandard] = useState<Std>("10th");

  const [testConfig, setTestConfig] = useState<TestConfig>({
    title: "",
    numQuestions: "10",
    questionType: "", // will hold "2" | "3" | "5"
    difficulty: "medium",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Subjects for the chosen standard
  const SUBJECT_OPTIONS = SUBJECTS_BY_STANDARD[standard];

  // Keep the selected subject valid when standard changes
  useEffect(() => {
    if (!SUBJECT_OPTIONS.includes(testConfig.title)) {
      setTestConfig((prev) => ({ ...prev, title: SUBJECT_OPTIONS[0] ?? "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard]);

  const marksOptions = [
    { v: "2", l: "2 Marks" },
    { v: "3", l: "3 Marks" },
    { v: "5", l: "5 Marks" },
    { v: "all", l: "All (2 + 3 + 5)" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation
    if (!testConfig.title) return toast.error("Please select a subject");
    if (!testConfig.questionType)
      return toast.error("Please select marks (2 / 3 / 5)");
    const n = parseInt(testConfig.numQuestions, 10);
    if (Number.isNaN(n) || n <= 0)
      return toast.error("Number of questions must be a positive number");

    try {
      setIsGenerating(true);

      // map subject label -> folder slug (same as your map)
      const std: "10th" | "12th" = standard ?? "10th";
      const slug =
        (SUBJECT_SLUG?.[std] && SUBJECT_SLUG[std][testConfig.title]) ||
        SUBJECT_SLUG["10th"][testConfig.title];
      if (!slug) {
        toast.error("No dataset mapped for this subject");
        return;
      }

      // marks is strictly one of "2" | "3" | "5"
      const chosenMarks = testConfig.questionType as "2" | "3" | "5";
      const diff = (testConfig.difficulty || "").toLowerCase();

      // helper to hit the backend
      const attempt = async (marks: "2" | "3" | "5", difficulty: string) => {
        const qs = new URLSearchParams({
          standard: std,
          subject: slug,
          total: String(n),
          marks,
          difficulty,
        });
        const res = await fetch(`${API_URL}/api/mock?` + qs.toString(), {
          cache: "no-store",
        });
        const paper = await res.json();
        if (!res.ok) throw new Error(paper?.error || "Failed to generate mock");
        const count =
          (paper?.sections?.["2"]?.length || 0) +
          (paper?.sections?.["3"]?.length || 0) +
          (paper?.sections?.["5"]?.length || 0);
        return { paper, count };
      };

      // 1) exact marks + difficulty
      let { paper, count } = await attempt(chosenMarks, diff);

      // 2) relax difficulty
      if (count === 0 && diff) {
        ({ paper, count } = await attempt(chosenMarks, ""));
      }

      // 3) try other marks buckets (keep difficulty relaxed)
      if (count === 0) {
        const order: Array<"2" | "3" | "5"> = ["2", "3", "5"].filter(
          (m) => m !== chosenMarks
        ) as any;
        for (const m of order) {
          const r = await attempt(m, "");
          if (r.count > 0) {
            paper = r.paper;
            count = r.count;
            break;
          }
        }
      }

      if (count === 0) {
        toast.error(
          "No questions found. Try a different subject/marks or set difficulty to Any."
        );
        return;
      }

      sessionStorage.setItem("mock:paper", JSON.stringify(paper));
      navigate("/mock-test", { state: { testConfig, standard: std, paper } });
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate mock");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="container mx-auto px-100 max-w-6xl flex flex-col items-center gap-8 pt-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Mock Test Generator
          </h1>
          <p className="text-muted-foreground">
            Create custom tests for your practice of Board paper
          </p>
        </div>

        <div className="p-4 w-full max-w-4xl">
          <Card className="border-border bg-card rounded-xl shadow-card mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Test Configuration
              </CardTitle>
              <CardDescription>Set up your mock test</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Standard */}
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Select
                    value={standard}
                    onValueChange={(value) => setStandard(value as Std)}
                  >
                    <SelectTrigger className="rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-popover border-border">
                      {STANDARD_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="rounded-md">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject (depends on Standard) */}
                <div className="space-y-2">
                  <Label htmlFor="title">Subject</Label>
                  <Select
                    value={testConfig.title}
                    onValueChange={(value) =>
                      setTestConfig({ ...testConfig, title: value })
                    }
                  >
                    <SelectTrigger className="rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-popover border-border">
                      {SUBJECT_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="rounded-md">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total */}
                <div className="space-y-2">
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Select
                    value={testConfig.numQuestions}
                    onValueChange={(value) =>
                      setTestConfig({ ...testConfig, numQuestions: value })
                    }
                  >
                    <SelectTrigger className="rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-popover border-border">
                      <SelectItem value="5" className="rounded-md">
                        5 Questions
                      </SelectItem>
                      <SelectItem value="10" className="rounded-md">
                        10 Questions
                      </SelectItem>
                      <SelectItem value="15" className="rounded-md">
                        15 Questions
                      </SelectItem>
                      <SelectItem value="20" className="rounded-md">
                        20 Questions
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marks (replace old "Question Type") */}
                <div className="space-y-2">
                  <Label htmlFor="questionType">Marks</Label>
                  <Select
                    value={testConfig.questionType}
                    onValueChange={(value) =>
                      setTestConfig({ ...testConfig, questionType: value })
                    }
                  >
                    <SelectTrigger className="rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                      <SelectValue placeholder="Select marks" />
                    </SelectTrigger>
                    <SelectContent>
                      {marksOptions.map((m) => (
                        <SelectItem
                          key={m.v}
                          value={m.v}
                          className="rounded-md"
                        >
                          {m.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty (unchanged) */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={testConfig.difficulty}
                    onValueChange={(value) =>
                      setTestConfig({ ...testConfig, difficulty: value })
                    }
                  >
                    <SelectTrigger className="rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-popover border-border">
                      <SelectItem value="easy" className="rounded-md">
                        Easy
                      </SelectItem>
                      <SelectItem value="medium" className="rounded-md">
                        Medium
                      </SelectItem>
                      <SelectItem value="hard" className="rounded-md">
                        Hard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
                  size="lg"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating…" : "Generate Test"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
