import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Brain,
  FileText,
  Award,
  Sparkles,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuickActions } from "@/components/QuickActions";

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: "Smart Notes",
      description:
        "Upload and manage your study materials, double verified by our teachers.",
    },
    {
      icon: Brain,
      title: "Board Mock Tests",
      description:
        "Generate personalized tests from your notes with our vast and unique dataset.",
    },
    {
      icon: Award,
      title: "Rewards",
      description:
        "Monitor your learning journey with detailed analytics and insights.",
    },
    {
      icon: Users,
      title: "Teacher Verified",
      description: "Content reviewed and approved by experienced educators.",
    },
  ];

  const benefits = [
    "ARP-powered learning assistance",
    "Automated test generation",
    "Smart content summarization",
    "Progress tracking & analytics",
    "Mobile-friendly interface",
    "Secure cloud storage",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>ARP-Powered Learning Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Learn Smart with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ARP
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your study materials into interactive learning
              experiences with user imported notes, automated mock tests.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card px-8"
              >
                <NavLink to="/signup">Get Started Free</NavLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-lg border-2 hover:bg-accent/10 transition-base"
              >
                <NavLink to="/notes">Explore Features</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to enhance your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-card-hover transition-base border-border bg-card rounded-lg"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit group-hover:scale-110 transition-base">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why Choose ARP?
              </h2>
              <p className="text-muted-foreground text-lg">
                Our platform combines students written notes with proven
                learning methodologies to help you achieve your academic goals
                faster and more efficiently.
              </p>

              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                asChild
                className="rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
              >
                <NavLink to="/signup">Start Learning Today</NavLink>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl gradient-hero opacity-20 blur-3xl absolute inset-0"></div>
              <Card className="relative shadow-card-hover border-border bg-card rounded-2xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg gradient-primary">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">10,000+</div>
                      <div className="text-muted-foreground">
                        Active Learners
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg gradient-primary">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">50,000+</div>
                      <div className="text-muted-foreground">
                        Notes Uploaded
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-lg gradient-primary">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">100,000+</div>
                      <div className="text-muted-foreground">
                        Tests Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quick Access
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Jump directly to any feature
            </p>
          </div>
          <QuickActions />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-4xl mx-auto shadow-card-hover border-border bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Join thousands of students already learning smarter with ARP
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  asChild
                  className="rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card px-8"
                >
                  <NavLink to="/signup">Get Started Now</NavLink>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="rounded-lg hover:bg-accent/10 transition-base"
                >
                  <NavLink to="/login">Already have an account?</NavLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
