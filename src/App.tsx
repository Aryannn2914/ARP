// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Landing from './pages/Landing';
import { Auth } from './pages/Login';
import Signup from './pages/Signup';
import NotesViewer from './pages/NotesViewer';
import MockTestGenerator from './pages/MockTestGenerator';
import MockTestResult from './pages/MockTestResults';
import Progress from './pages/Progress';
import TeacherVerification from './pages/TeacherVerification';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Rewards from './pages/rewards';               
import { AuthProvider } from './lib/auth';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {/* Toast notifications from two different UI kits */}
          <Toaster />
          <Sonner />

          <AuthProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/notes" element={<NotesViewer />} />
                    <Route path="/mock-tests" element={<MockTestGenerator />} />
                    <Route path="/mock-test" element={<MockTestResult />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/teacher/verification" element={<TeacherVerification />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/rewards" element={<Rewards />} /> {/* ⬇️ NEW ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}





// import { Toaster } from '@/components/ui/toaster';
// import { Toaster as Sonner } from '@/components/ui/sonner';
// import { TooltipProvider } from '@/components/ui/tooltip';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { ThemeProvider } from '@/contexts/ThemeContext';
// import { Navbar } from '@/components/Navbar';
// import { Footer } from '@/components/Footer';
// import Landing from './pages/Landing';
// import { Auth } from './pages/Login';
// import Signup from './pages/Signup';
// import NotesViewer from './pages/NotesViewer';
// import MockTestGenerator from './pages/MockTestGenerator';
// import MockTestResult from './pages/MockTestResults';
// import Progress from './pages/Progress';
// import TeacherVerification from './pages/TeacherVerification';
// import AdminDashboard from './pages/AdminDashboard';
// import NotFound from './pages/NotFound';
// import Rewards from './pages/rewards';   // ⭐ ADD THIS IMPORT

// import { AuthProvider } from './lib/auth';
// import Profile from './pages/Profile';

// const queryClient = new QueryClient();

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider>
//         <TooltipProvider>
//           <Toaster />
//           <Sonner />

//           <AuthProvider>
//             <BrowserRouter>
//               <div className="flex flex-col min-h-screen">
//                 <Navbar />
//                 <main className="flex-1">
//                   <Routes>
//                     <Route path="/" element={<Landing />} />
//                     <Route path="/login" element={<Auth />} />
//                     <Route path="/signup" element={<Signup />} />
//                     <Route path="/notes" element={<NotesViewer />} />
//                     <Route path="/mock-tests" element={<MockTestGenerator />} />
//                     <Route path="/mock-test" element={<MockTestResult />} />
//                     <Route path="/progress" element={<Progress />} />
//                     <Route path="/teacher/verification" element={<TeacherVerification />} />
//                     <Route path="/admin/dashboard" element={<AdminDashboard />} />
//                     <Route path="/rewards" element={<Rewards />} /> {/* ⭐ ADD THIS ROUTE */}
//                     <Route path="*" element={<NotFound />} />
//                   </Routes>
//                 </main>
//                 <Footer />
//               </div>
//             </BrowserRouter>
//           </AuthProvider>
//         </TooltipProvider>
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }
