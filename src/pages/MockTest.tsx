import { Clock, ChevronLeft, ChevronRight, CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MockTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [showResults, setShowResults] = useState(false);

  // Mock questions
  const questions = [
    {
      id: 1,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'O(log n)',
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      correctAnswer: 'Stack',
    },
    {
      id: 3,
      question: 'What does BFS stand for?',
      options: ['Binary First Search', 'Breadth First Search', 'Best First Search', 'Basic Field Search'],
      correctAnswer: 'Breadth First Search',
    },
    {
      id: 4,
      question: 'Which sorting algorithm has the best average case?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
      correctAnswer: 'Quick Sort',
    },
    {
      id: 5,
      question: 'What is a linked list?',
      options: [
        'A linear data structure',
        'A tree structure',
        'A graph structure',
        'A hash table'
      ],
      correctAnswer: 'A linear data structure',
    },
  ];

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleSubmit = () => {
    const correctAnswers = questions.filter(
      (q, index) => answers[index] === q.correctAnswer
    ).length;
    
    setShowResults(true);
    toast.success(`Test submitted! You scored ${correctAnswers}/${questions.length}`);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mock Test</h1>
          <p className="text-muted-foreground">Data Structures & Algorithms Quiz</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-xl font-bold">{formatTime(timeLeft)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Answered</p>
                <p className="text-xl font-bold">
                  {answeredCount}/{questions.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Progress</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Card */}
        <Card className="border-border bg-card rounded-xl shadow-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="rounded-md">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <Badge
                variant={answers[currentQuestion] ? 'default' : 'outline'}
                className="rounded-md"
              >
                {answers[currentQuestion] ? 'Answered' : 'Not Answered'}
              </Badge>
            </div>
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-base cursor-pointer ${
                    answers[currentQuestion] === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent/10'
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto rounded-lg border-border hover:bg-accent/10 transition-base"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg border transition-base ${
                  currentQuestion === index
                    ? 'border-primary bg-primary text-white'
                    : answers[index]
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border hover:bg-accent/10'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="w-full sm:w-auto rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="rounded-xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl">Test Results</DialogTitle>
              <DialogDescription>
                Here's how you performed on this mock test
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="text-5xl font-bold mb-2">
                  {questions.filter((q, i) => answers[i] === q.correctAnswer).length}/
                  {questions.length}
                </div>
                <p className="text-muted-foreground">Correct Answers</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border bg-background/50 rounded-lg">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(
                        (questions.filter((q, i) => answers[i] === q.correctAnswer).length /
                          questions.length) *
                          100
                      )}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background/50 rounded-lg">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{formatTime(1800 - timeLeft)}</p>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="flex-1 rounded-lg border-border hover:bg-accent/10 transition-base"
                >
                  Review Answers
                </Button>
                <Button
                  onClick={() => navigate('/progress')}
                  className="flex-1 rounded-lg gradient-primary text-white hover:opacity-90 transition-base"
                >
                  View Progress
                </Button>
              </div>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full rounded-lg hover:bg-accent/10 transition-base"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
