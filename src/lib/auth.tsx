/* src/lib/auth.tsx */

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect,
} from 'react';

/* ----------------------------------------------------- */
/* User shape – you already had this, we just keep it    */
/* ----------------------------------------------------- */
export interface User {
  name?: string;          // <‑‑ user’s display name (e.g. “alice”)
  email?: string;
  image?: string;         // URL to a custom avatar, if any
  // add any other fields you care about
}

/* ----------------------------------------------------- */
/* Auth context contract                               */
/* ----------------------------------------------------- */
export interface AuthContextProps {
  user: User | null;          // the currently–logged‑in user
  signIn: (u: User) => void;  // call with the full user object
  signOut: () => void;        // clears the user
  getInitial: () => string;   // helper that returns the first letter
}

/* ----------------------------------------------------- */
/* Context – we keep the default “empty” implementation */
/* ----------------------------------------------------- */
const AuthContext = createContext<AuthContextProps>({
  user: null,
  signIn: () => {},
  signOut: () => {},
  getInitial: () => '?',
});

/* ----------------------------------------------------- */
/* Provider – persist the user in localStorage           */
/* ----------------------------------------------------- */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  /* on mount, restore from LS if present */
  useEffect(() => {
    const stored = localStorage.getItem('auth-user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* sync LS whenever user changes */
  useEffect(() => {
    if (user) localStorage.setItem('auth-user', JSON.stringify(user));
    else localStorage.removeItem('auth-user');
  }, [user]);

  const signIn = (u: User) => setUser(u);
  const signOut = () => setUser(null);

  /* helper that can be useful in any component */
  const getInitial = (): string =>
    user?.name?.[0]?.toLocaleUpperCase() ?? '?';

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, getInitial }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ----------------------------------------------------- */
/* Hook to consume the context                         */
/* ----------------------------------------------------- */
export const useAuth = () => useContext(AuthContext);




// // src/lib/auth.tsx
// import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// export interface User {
//   name?: string;
//   email?: string;
//   image?: string;            // avatar URL
//   // you can add other fields you care about
// }

// /* ------------------------------------------- */
// export interface AuthContextProps {
//   user: User | null;
//   signIn: (u: User) => void;
//   signOut: () => void;
// }
// /* ------------------------------------------- */
// const AuthContext = createContext<AuthContextProps>({
//   user: null,
//   signIn: () => {},
//   signOut: () => {},
// });

// /* ------------------------------------------- */
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   /* Persist user in localStorage – optional but handy for demos */
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const stored = localStorage.getItem('auth-user');
//     if (stored) setUser(JSON.parse(stored));
//   }, []);

//   useEffect(() => {
//     if (user) localStorage.setItem('auth-user', JSON.stringify(user));
//     else localStorage.removeItem('auth-user');
//   }, [user]);

//   const signIn = (u: User) => setUser(u);
//   const signOut = () => setUser(null);

//   return (
//     <AuthContext.Provider value={{ user, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// /* ------------------------------------------- */
// export const useAuth = () => useContext(AuthContext);