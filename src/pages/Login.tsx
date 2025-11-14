/* src/pages/Login.tsx */
import { NavLink } from 'react-router-dom';
import { BookOpen, Mail, Lock } from 'lucide-react';
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
import { useState } from 'react';
import { toast } from 'sonner';
import { auth, provider } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  /* ------------- Firebase Sign‑In (Email/PW) --------------- */
  const handleEmailSignIn = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userData = {
        name: user.displayName,
        email: user.email ?? '',
        image: user.photoURL ?? '',
      };
      signIn(userData); // store in context
      toast.success('Signed in successfully!');

      // Redirect after successful sign‑in
      navigate('/');
    } catch (err) {
      console.error('Email sign‑in error', err);
      toast.error('Failed to sign in. Please check your credentials.');
    }
  };

  /* ------------- Firebase Sign‑In (Google) --------------- */
  const handleGoogleSignIn = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider);
      const userData = {
        name: user.displayName,
        email: user.email ?? '',
        image: user.photoURL ?? '',
      };
      signIn(userData);
      toast.success('Signed in with Google successfully!');

      navigate('/');
    } catch (err) {
      console.error('Google sign‑in error', err);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  /* ------------- Form validate & submit --------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client‑side validation
    if (!email || !password) {
      return toast.error('Please fill in all fields.');
    }

    if (!email.includes('@')) {
      return toast.error('Please enter a valid email address.');
    }

    // In this flow we only support sign‑in, not account creation
    await handleEmailSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-5" />

      <Card className="w-full max-w-md shadow-card-hover border-border bg-card rounded-2xl relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto p-3 rounded-xl gradient-primary w-fit">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to continue your learning journey
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline transition-base"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
              size="lg"
            >
              Sign In
            </Button>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full rounded-lg mt-2 border border-border bg-card text-primary hover:bg-muted transition-base"
              size="lg"
            >
              Sign in with Google
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <NavLink
                to="/signup"
                className="text-primary hover:underline font-medium transition-base"
              >
                Sign up for free
              </NavLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
// import { NavLink } from 'react-router-dom';
// import { BookOpen, Mail, Lock } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useState } from 'react';
// import { toast } from 'sonner';
// import { auth, provider } from "../config/firebase";
// import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";


// export const Auth = ()  => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const signIn = async () => {
//     try {
//     await createUserWithEmailAndPassword(auth, email, password)
//   } catch (error) {
//     console.error("Error signing in:", error);
//     toast.error('Failed to sign in. Please check your credentials and try again.');
//   }
//   };

//     const signInWithGoogle = async () => {
//     try {
//     await signInWithPopup(auth, provider)
//     toast.success('Signed in with Google successfully!');
//   } catch (error) {
//     console.error("Error signing in:", error);
//     toast.error('Failed to sign in. Please check your credentials and try again.');
//   }
//   };
//   // Logout function
//   //   const Logout = async () => {
//   //   try {
//   //   await signOut(auth);
//   //   toast.success('Logged out successfully.');
//   // } catch (error) {
//   //   console.error("Error logging out:", error);
//   //   toast.error('Failed to log out. Please try again.');
//   // }
//   // };


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (!email || !password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     if (!email.includes('@')) {
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     // Simulate login
//     toast.success('Login successful! Welcome back.');
//   };
  

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
//       <div className="absolute inset-0 gradient-hero opacity-5"></div>
      
//       <Card className="w-full max-w-md shadow-card-hover border-border bg-card rounded-2xl relative z-10">
//         <CardHeader className="space-y-4 text-center pb-8">
//           <div className="mx-auto p-3 rounded-xl gradient-primary w-fit">
//             <BookOpen className="h-8 w-8 text-white" />
//           </div>
//           <div>
//             <CardTitle className="text-2xl md:text-3xl">Welcome Back</CardTitle>
//             <CardDescription className="text-base mt-2">
//               Sign in to continue your learning journey
//             </CardDescription>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <a
//                   href="#"
//                   className="text-sm text-primary hover:underline transition-base"
//                 >
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
//               size="lg"
//               onClick={signIn}
//             >
//               Sign In
//             </Button>

//             <Button
//               type="button"
//               onClick={signInWithGoogle}
//               className="w-full rounded-lg mt-2 border border-border bg-card text-primary hover:bg-muted transition-base"
//               size="lg"
//             >
//               Sign in with Google
//             </Button>
//           </form>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-border"></div>
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-card px-2 text-muted-foreground">Or</span>
//             </div>
//           </div>

//           <div className="text-center">
//             <p className="text-sm text-muted-foreground">
//               Don't have an account?{' '}
//               <NavLink
//                 to="/signup"
//                 className="text-primary hover:underline font-medium transition-base"
//               >
//                 Sign up for free
//               </NavLink>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


