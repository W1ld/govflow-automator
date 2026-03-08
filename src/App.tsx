import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import InputKegiatan from "./pages/InputKegiatan";
import DaftarSPJ from "./pages/DaftarSPJ";
import Anggaran from "./pages/Anggaran";
import KalkulatorPajak from "./pages/KalkulatorPajak";
import ArsipDokumen from "./pages/ArsipDokumen";
import Pengaturan from "./pages/Pengaturan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kegiatan/baru" element={<InputKegiatan />} />
          <Route path="/spj" element={<DaftarSPJ />} />
          <Route path="/anggaran" element={<Anggaran />} />
          <Route path="/pajak" element={<KalkulatorPajak />} />
          <Route path="/arsip" element={<ArsipDokumen />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
