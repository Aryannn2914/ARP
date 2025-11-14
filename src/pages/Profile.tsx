/* src/pages/Profile.tsx */

import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";          // Firebase Auth instance
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Star, Coins, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/auth";              // Auth context

const API_URL = "http://localhost:3001/api";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut: signOutCtx } = useAuth(); // context
  const [userTokens, setUserTokens] = useState<number>(0);
  const [totalApprovedNotes, setTotalApprovedNotes] = useState<number>(0);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false); // <-- new

  /* ----------  Load tokens whenever the authenticated user changes ---------- */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Build a key that the backend can use.
    // If the context object has a `name`, use that.
    // Otherwise use *the part of the email before “@”*.
    // As a last resort use the Firebase UID.
    const studentName =
      user.name ??
      (user.email ? user.email.split("@")[0] : "") ??
      auth.currentUser?.uid ??
      "Unknown";

    fetchUserTokens(studentName);
  }, [user]); // Re‑run whenever the context user changes

  /* ----------  API call to fetch token & approved‑note counts ---------- */
  const fetchUserTokens = async (studentName: string) => {
    setLoadingTokens(true);
    try {
      const response = await axios.get(
        `${API_URL}/user/tokens/${encodeURIComponent(studentName)}`
      );
      setUserTokens(response.data.tokens ?? 0);
      setTotalApprovedNotes(response.data.totalApprovedNotes ?? 0);
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      setUserTokens(0);
      setTotalApprovedNotes(0);
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast.error("Failed to load user data. Please refresh the page.");
      }
    } finally {
      setLoadingTokens(false);
    }
  };

  /* ----------  Logout handler ---------- */
  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out of Firebase
      signOutCtx();       // Clear our Auth context
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  /* ----------  Loading placeholder ---------- */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  /* ----------  Derived values ---------- */
  const userName = user.name ?? (user.email ? user.email.split("@")[0] : "User");
  const userEmail = user.email ?? "Not available";
  const initial = userName[0]?.toUpperCase() ?? "U";
  const firebaseUid = auth.currentUser?.uid ?? "Unknown";

  /* ----------  Render ---------- */
  return (
    <div className="min-h-screen py-12 container mx-auto px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-4">
            {user.image && !imageError ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                onError={() => setImageError(true)} // <-- fallback
              />
            ) : (
              <div
                className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary text-xl font-semibold text-primary"
              >
                {initial}
              </div>
            )}

            <div>
              <p className="text-lg font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">ID: {firebaseUid}</p>
            </div>
          </div>

          <p>
            <strong>Email:</strong> {userEmail}
          </p>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="mt-4 rounded-lg"
          >
            Logout
          </Button>
        </div>

        {/* Tokens card */}
        <Card className="border-border bg-card rounded-xl shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">ARP Stars</h2>
                <p className="text-sm text-muted-foreground">
                  Earned by sharing study notes
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Total Stars</span>
                </div>
                {loadingTokens ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <span className="text-3xl font-bold text-primary">{userTokens}</span>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Approved Notes</p>
                {loadingTokens ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl font-semibold">{totalApprovedNotes}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-primary">How to earn:</strong> Upload your study notes and earn 50 Stars when teachers approve them. Redeem tokens for gift cards, study goodies, and UPI cash!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




// import { signOut } from "firebase/auth";
// import { auth } from "../config/firebase";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { useEffect, useState } from "react";
// import { Star, Coins, Loader2 } from "lucide-react";
// import axios from "axios";

// const API_URL = 'http://localhost:3001/api';

// export default function Profile() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<any>(null);
//   const [userTokens, setUserTokens] = useState<number>(0);
//   const [totalApprovedNotes, setTotalApprovedNotes] = useState<number>(0);
//   const [loadingTokens, setLoadingTokens] = useState<boolean>(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((currentUser) => {
//       setUser(currentUser);
//       if (currentUser) {
//         // Use displayName, email (before @), or uid as fallback for student name
//         const studentName = currentUser.displayName || 
//                           currentUser.email?.split('@')[0] || 
//                           currentUser.uid || 
//                           'Unknown Student';
//         fetchUserTokens(studentName);
//       } else {
//         setLoadingTokens(false);
//         // Redirect to login if not authenticated
//         navigate("/login");
//       }
//     });
//     return () => unsubscribe();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchUserTokens = async (studentName: string) => {
//     setLoadingTokens(true);
//     try {
//       const response = await axios.get(`${API_URL}/user/tokens/${encodeURIComponent(studentName)}`);
//       setUserTokens(response.data.tokens || 0);
//       setTotalApprovedNotes(response.data.totalApprovedNotes || 0);
//     } catch (error: any) {
//       console.error('Error fetching user tokens:', error);
//       setUserTokens(0);
//       setTotalApprovedNotes(0);
//       // Don't show error toast for initial load, just log it
//       if (error.response?.status !== 404) {
//         toast.error("Failed to load user data. Please refresh the page.");
//       }
//     } finally {
//       setLoadingTokens(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       toast.success("Logged out successfully!");
//       navigate("/login");
//     } catch (error) {
//       toast.error("Failed to log out. Please try again.");
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-muted-foreground">
//         <div className="flex flex-col items-center gap-2">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <p>Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   // Get user's display name from Firebase (set during signup or Google login)
//   // Fallback to email username if displayName is not set
//   const userName = user.displayName?.trim() || 
//                    (user.email ? user.email.split('@')[0] : null) || 
//                    "User";
//   const userEmail = user.email || "Not available";
//   const initial = userName[0]?.toUpperCase() ?? "U";

//   return (
//     <div className="min-h-screen py-12 container mx-auto px-4">
//       <h1 className="text-3xl md:text-4xl font-bold mb-6">My Profile</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
//         <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-3">
//           {/* Avatar + initial */}
//           <div className="flex items-center gap-4 mb-4">
//             {user.photoURL ? (
//               <img
//                 src={user.photoURL}
//                 alt="Profile"
//                 className="h-16 w-16 rounded-full object-cover border-2 border-primary"
//               />
//             ) : (
//               <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary text-xl font-semibold text-primary">
//                 {initial}
//               </div>
//             )}

//             <div>
//               <p className="text-lg font-semibold">{userName}</p>
//               <p className="text-sm text-muted-foreground">ID: {user.uid}</p>
//             </div>
//           </div>

//           <p>
//             <strong>Email:</strong> {userEmail}
//           </p>

//           <Button
//             variant="destructive"
//             onClick={handleLogout}
//             className="mt-4 rounded-lg"
//           >
//             Logout
//           </Button>
//         </div>

//         {/* Tokens Card */}
//         <Card className="border-border bg-card rounded-xl shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="p-3 rounded-lg bg-yellow-500/10">
//                 <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">ARP Tokens</h2>
//                 <p className="text-sm text-muted-foreground">Earned by sharing study notes</p>
//               </div>
//             </div>
            
//             <div className="space-y-4">
//               <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
//                 <div className="flex items-center gap-2">
//                   <Coins className="h-5 w-5 text-primary" />
//                   <span className="font-semibold">Total Tokens</span>
//                 </div>
//                 {loadingTokens ? (
//                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
//                 ) : (
//                   <span className="text-3xl font-bold text-primary">{userTokens}</span>
//                 )}
//               </div>
              
//               <div className="p-4 rounded-lg bg-muted/50">
//                 <p className="text-sm text-muted-foreground mb-1">Approved Notes</p>
//                 {loadingTokens ? (
//                   <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
//                 ) : (
//                   <p className="text-xl font-semibold">{totalApprovedNotes}</p>
//                 )}
//               </div>

//               <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
//                 <p className="text-xs text-muted-foreground">
//                   <strong className="text-primary">How to earn:</strong> Upload your study notes and earn 50 tokens when teachers approve them. 
//                   Redeem tokens for gift cards, study goodies, and UPI cash!
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }