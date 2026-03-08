import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import InputKegiatan from "./pages/InputKegiatan";
import DaftarSPJ from "./pages/DaftarSPJ";
import Anggaran from "./pages/Anggaran";
import KalkulatorPajak from "./pages/KalkulatorPajak";
import ArsipDokumen from "./pages/ArsipDokumen";
import Pengaturan from "./pages/Pengaturan";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/kegiatan/baru" element={<ProtectedRoute><InputKegiatan /></ProtectedRoute>} />
            <Route path="/kegiatan/:id/edit" element={<ProtectedRoute><InputKegiatan /></ProtectedRoute>} />
            <Route path="/spj" element={<ProtectedRoute><DaftarSPJ /></ProtectedRoute>} />
            <Route path="/anggaran" element={<ProtectedRoute><Anggaran /></ProtectedRoute>} />
            <Route path="/pajak" element={<ProtectedRoute><KalkulatorPajak /></ProtectedRoute>} />
            <Route path="/arsip" element={<ProtectedRoute><ArsipDokumen /></ProtectedRoute>} />
            <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
