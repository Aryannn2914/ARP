/* src/pages/Signup.tsx */
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/lib/auth';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function Signup() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* ----------- Validation ----------- */
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    /* ----------- Sign‑up ----------- */
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(user, { displayName: formData.name });

      const userData = {
        name: formData.name,
        email: user.email ?? '',
        image: user.photoURL ?? '',
      };

      signIn(userData);          // store in Auth context → navbar updates
      toast.success('Account created successfully! Welcome to ARP.');
      navigate('/');              // redirect to home
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-5"></div>

      <Card className="w-full max-w-md shadow-card-hover border-border bg-card rounded-2xl relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto p-3 rounded-xl gradient-primary w-fit">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl">Create Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Join ARP and start learning smarter today
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={formData.role}
                  onValueChange={value =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-popover border-border">
                    <SelectItem value="student" className="rounded-md">
                      Student
                    </SelectItem>
                    <SelectItem value="teacher" className="rounded-md">
                      Teacher
                    </SelectItem>
                    <SelectItem value="admin" className="rounded-md">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Link to login */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <NavLink
                to="/login"
                className="text-primary hover:underline font-medium transition-base"
              >
                Sign in
              </NavLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}