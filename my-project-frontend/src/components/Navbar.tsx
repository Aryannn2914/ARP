


import { NavLink } from "react-router-dom";
import { BookOpen, Menu, X, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, getInitial } = useAuth(); // ✅ Added getInitial

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/notes", label: "Notes" },
    { to: "/mock-tests", label: "Mock Tests" },
    { to: "/progress", label: "Profile" },
    { to: "/rewards", label: "Rewards" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 transition-base hover:opacity-80">
            <div className="p-2 rounded-lg gradient-primary">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ARP
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-base ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-accent/10"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            
            {/* Profile + Logout */}
            {user ? (
              <div className="hidden md:flex items-center">
                {/* ✅ Avatar with fallback */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary flex items-center justify-center font-semibold">
                    {getInitial()}
                  </div>
                )}

                <Button variant="ghost" size="sm" onClick={signOut} className="ml-2 rounded-lg">
                  Logout
                </Button>
              </div>
            ) : null}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons (Show only if NOT logged in) */}
            {!user && (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-lg">
                  <NavLink to="/login">Login</NavLink>
                </Button>
                <Button asChild className="rounded-lg gradient-primary text-white">
                  <NavLink to="/signup">Sign Up</NavLink>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-base ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-accent/10"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Auth + Profile */}
            <div className="pt-2 border-t border-border space-y-2">
              {!user ? (
                <>
                  <Button variant="ghost" asChild className="w-full rounded-lg justify-start">
                    <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                  </Button>
                  <Button asChild className="w-full rounded-lg gradient-primary text-white justify-start">
                    <NavLink to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
                  </Button>
                </>
              ) : (
                <div className="flex items-center p-4 space-x-3 border-t border-border">
                  
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary flex items-center justify-center font-semibold">
                      {getInitial()}
                    </div>
                  )}

                  <span className="font-medium">{user.name ?? "User"}</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="ml-auto rounded-lg"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};











// import { NavLink } from "react-router-dom";
// import { BookOpen, Menu, X, User, Gift } from "lucide-react";
// import { ThemeToggle } from "./ThemeToggle";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { useAuth } from "@/lib/auth";

// export const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { user, signOut } = useAuth(); // Auth context

//   const navLinks = [
//     { to: "/", label: "Home" },
//     { to: "/notes", label: "Notes" },
//     { to: "/mock-tests", label: "Mock Tests" },
//     { to: "/progress", label: "Profile" },
//     { to: "/rewards", label: "Rewards"}, //  New Rewards tab
//   ];

//   return (
//     <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <NavLink
//             to="/"
//             className="flex items-center gap-2 transition-base hover:opacity-80"
//           >
//             <div className="p-2 rounded-lg gradient-primary">
//               <BookOpen className="h-6 w-6 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               ARP
//             </span>
//           </NavLink>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-1">
//             {navLinks.map((link) => (
//               <NavLink
//                 key={link.to}
//                 to={link.to}
//                 className={({ isActive }) =>
//                   `flex items-center gap-2 px-4 py-2 rounded-lg transition-base ${
//                     isActive
//                       ? "bg-primary/10 text-primary font-medium"
//                       : "text-foreground hover:bg-accent/10"
//                   }`
//                 }
//               >
//                 {link.icon && <link.icon className="h-4 w-4 text-primary" />}
//                 {link.label}
//               </NavLink>
//             ))}
//           </div>

//           {/* Right Side (Profile / Theme / Auth Buttons) */}
//           <div className="flex items-center gap-2">
//             {/* Profile Section */}
//             <div className="hidden md:flex items-center">
//               {user?.image ? (
//                 <>
//                   <img
//                     src={user.image}
//                     alt="Profile"
//                     className="h-8 w-8 rounded-full object-cover border-2 border-primary"
//                   />
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={signOut}
//                     className="ml-2 rounded-lg"
//                   >
//                     Logout
//                   </Button>
//                 </>
//               ) : (
//                 <User className="h-7 w-7 text-muted-foreground" />
//               )}
//             </div>

//             {/* Theme Toggle */}
//             <ThemeToggle />

//             {/* Auth Buttons (if not logged in) */}
//             {!user?.image && (
//               <div className="hidden md:flex items-center gap-2">
//                 <Button variant="ghost" asChild className="rounded-lg">
//                   <NavLink to="/login">Login</NavLink>
//                 </Button>
//                 <Button asChild className="rounded-lg gradient-primary text-white">
//                   <NavLink to="/signup">Sign Up</NavLink>
//                 </Button>
//               </div>
//             )}

//             {/* Mobile Menu Toggle */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="md:hidden rounded-lg"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top">
//             {navLinks.map((link) => (
//               <NavLink
//                 key={link.to}
//                 to={link.to}
//                 onClick={() => setIsMenuOpen(false)}
//                 className={({ isActive }) =>
//                   `flex items-center gap-2 px-4 py-2 rounded-lg transition-base ${
//                     isActive
//                       ? "bg-primary/10 text-primary font-medium"
//                       : "text-foreground hover:bg-accent/10"
//                   }`
//                 }
//               >
//                 {link.icon && <link.icon className="h-4 w-4 text-primary" />}
//                 {link.label}
//               </NavLink>
//             ))}

//             {/* Auth Links (mobile) */}
//             {!user?.image && (
//               <div className="pt-2 border-t border-border space-y-2">
//                 <Button variant="ghost" asChild className="w-full rounded-lg justify-start">
//                   <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
//                     Login
//                   </NavLink>
//                 </Button>
//                 <Button asChild className="w-full rounded-lg gradient-primary text-white justify-start">
//                   <NavLink to="/signup" onClick={() => setIsMenuOpen(false)}>
//                     Sign Up
//                   </NavLink>
//                 </Button>
//               </div>
//             )}

//             {/* Mobile Profile (if logged in) */}
//             {user?.image && (
//               <div className="flex items-center p-4 space-x-3 border-t border-border">
//                 <img
//                   src={user.image}
//                   alt="Profile"
//                   className="h-10 w-10 rounded-full object-cover border-2 border-primary"
//                 />
//                 <span className="font-medium">{user.name ?? "User"}</span>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => {
//                     signOut();
//                     setIsMenuOpen(false);
//                   }}
//                   className="ml-auto rounded-lg"
//                 >
//                   Logout
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };
