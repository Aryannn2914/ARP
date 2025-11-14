import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, BookOpen, Target, Award, CheckCircle, User, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:3001/api';

export default function Progress() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [mockTests, setMockTests] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [goals, setGoals] = useState([
    { title: "Upload 50 Notes", progress: 0, total: 50 },
    { title: "Take 50 Custom Tests", progress: 0, total: 50 },
    { title: "Earn 1000 Tokens", progress: 0, total: 1000 },
  ]);
  const [achievements, setAchievements] = useState([
    { icon: "⚡", title: "Quick Learner", desc: "Completed 10 tests in a week", earned: false },
    { icon: "🎯", title: "Perfectionist", desc: "Scored 100% in 5 tests", earned: false },
    { icon: "🔥", title: "Consistent", desc: "Studied 7 days straight", earned: false },
    { icon: "📚", title: "Contributor", desc: "Uploaded 50 notes", earned: false },
  ]);

  // 🔹 Fetch user info + progress data from Firebase and backend
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProgressData(currentUser);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProgressData = async (currentUser: any) => {
    setLoading(true);
    try {
      // Get student name from Firebase
      const studentName = currentUser.displayName?.trim() || 
                         currentUser.email?.split('@')[0] || 
                         currentUser.uid || 
                         'Unknown Student';

      // Fetch tokens and approved notes from backend
      const tokensResponse = await axios.get(`${API_URL}/user/tokens/${encodeURIComponent(studentName)}`);
      const tokens = tokensResponse.data.tokens || 0;
      const approvedNotes = tokensResponse.data.totalApprovedNotes || 0;

      setCoins(tokens);
      setNotesCount(approvedNotes);
      
      // Mock tests - set to 0 for now (can be fetched from backend if endpoint exists)
      setMockTests(0);

      // Update goals with real data
      setGoals([
        { title: "Upload 50 Notes", progress: approvedNotes, total: 50 },
        { title: "Take 50 Custom Tests", progress: 0, total: 50 }, // Can be updated when mock tests endpoint is available
        { title: "Earn 1000 Stars", progress: tokens, total: 1000 },
      ]);

      // Update achievements based on actual progress
      setAchievements([
        { icon: "⚡", title: "Quick Learner", desc: "Completed 10 tests in a week", earned: false }, // Can be updated when test data is available
        { icon: "🎯", title: "Perfectionist", desc: "Scored 100% in 5 tests", earned: false },
        { icon: "🔥", title: "Consistent", desc: "Studied 7 days straight", earned: false },
        { icon: "📚", title: "Contributor", desc: "Uploaded 50 notes", earned: approvedNotes >= 50 },
      ]);
    } catch (error: any) {
      console.error("Error fetching progress data:", error);
      // Set defaults on error
      setCoins(0);
      setNotesCount(0);
      setMockTests(0);
      if (error.response?.status !== 404) {
        toast.error("Failed to load progress data. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user) {
      toast.error("Please log in to redeem rewards");
      navigate("/login");
      return;
    }

    if (coins < 250) {
      toast.error("❌ You need at least 250 stars to redeem a gift card!");
      return;
    }

    try {
      const studentName = user.displayName?.trim() || 
                         user.email?.split('@')[0] || 
                         user.uid || 
                         'Unknown Student';

      // Call backend to redeem tokens
      const response = await axios.post(`${API_URL}/user/redeem`, {
        studentName: studentName,
        gift: "Amazon Gift Card",
        cost: 250
      });

      const newTokens = response.data.tokens;
      setCoins(newTokens);
      
      // Update goals with new token value
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.title === "Earn 1000 Stars" 
            ? { ...goal, progress: newTokens }
            : goal
        )
      );
      
      toast.success("🎁 Successfully redeemed 1 Amazon Gift Card!");
    } catch (error: any) {
      console.error("Redeem error:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Failed to redeem. Please try again.");
      } else {
        toast.error("Failed to redeem. Please try again.");
      }
      // Refresh data
      if (user) {
        await fetchProgressData(user);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get user's display name from Firebase
  const userName = user.displayName?.trim() || 
                   (user.email ? user.email.split('@')[0] : null) || 
                   "User";
  const userEmail = user.email || "Not available";
  const userImage = user.photoURL || null;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {userImage ? (
              <img
                src={userImage}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-4 border-primary shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary text-2xl font-semibold text-primary">
                {userName[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{userName}</h1>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          {/* Tokens */}
          <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end">
            <div className="bg-primary/10 px-5 py-3 rounded-xl flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="font-semibold text-lg">{coins} Stars</span>
              )}
            </div>
            <Button
              onClick={handleRedeem}
              disabled={loading || coins < 250}
              className="mt-2 rounded-lg bg-primary text-white hover:opacity-90 transition-all disabled:opacity-50"
            >
              Redeem Now
            </Button>
          </div>
        </div>

        {/* ---------- Overview Cards ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="border-border bg-card shadow-card rounded-xl hover:shadow-card-hover transition-all">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-semibold">{notesCount}</h3>
              <p className="text-muted-foreground text-sm">Notes Uploaded</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-card rounded-xl hover:shadow-card-hover transition-all">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-semibold">{mockTests}</h3>
              <p className="text-muted-foreground text-sm">Custom Mock Tests</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-card rounded-xl hover:shadow-card-hover transition-all">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-semibold">
                {achievements.filter((a) => a.earned).length}
              </h3>
              <p className="text-muted-foreground text-sm">Achievements Unlocked</p>
            </CardContent>
          </Card>
        </div>

        {/* ---------- Learning Goals ---------- */}
        <Card className="border-border bg-card shadow-card rounded-xl mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Learning Goals
            </CardTitle>
            <CardDescription>Your ongoing learning objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {goal.progress}/{goal.total}
                  </span>
                </div>
                <ProgressBar
                  value={(goal.progress / goal.total) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ---------- Achievements ---------- */}
        <Card className="border-border bg-card shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>Milestones you've unlocked</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  ach.earned
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="text-2xl">{ach.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    {ach.title}
                    {ach.earned && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{ach.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
