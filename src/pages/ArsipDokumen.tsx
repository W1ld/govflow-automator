import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Eye, RotateCcw, Archive } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SPJPreview } from "@/components/SPJPreview";

type Kegiatan = {
  id: string;
  nomor_spj: string;
  nama_kegiatan: string;
  kode_mak: string | null;
  tanggal_kegiatan: string;
  jenis_belanja: string;
  nilai_bruto: number;
  nilai_netto: number;
  pph_jenis: string | null;
  pph_nominal: number;
  ppn_nominal: number;
  status: string;
  lokasi: string | null;
  uraian: string | null;
  ppk_nama: string | null;
  ppk_nip: string | null;
  bendahara_nama: string | null;
  bendahara_nip: string | null;
  pptk_nama: string | null;
  pptk_nip: string | null;
  kop_template_id: string | null;
  created_at: string;
  tahun_anggaran: number;
};

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const ArsipDokumen = () => {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState("all");
  const [previewItem, setPreviewItem] = useState<Kegiatan | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from("kegiatan")
      .select("*")
      .eq("status", "arsip")
      .order("tanggal_kegiatan", { ascending: false });

    if (tahun !== "all") {
      query = query.eq("tahun_anggaran", parseInt(tahun));
    }

    const { data: result, error } = await query;
    if (error) toast.error("Gagal memuat arsip");
    else setData(result || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tahun]);

  const restoreFromArchive = async (id: string) => {
    const { error } = await supabase.from("kegiatan").update({ status: "verified" }).eq("id", id);
    if (error) toast.error("Gagal mengembalikan");
    else {
      toast.success("Dokumen dikembalikan ke status Verified");
      fetchData();
    }
  };

  const filtered = data.filter(
    (item) =>
      item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.nomor_spj.toLowerCase().includes(search.toLowerCase())
  );

  const totalNilai = filtered.reduce((sum, item) => sum + item.nilai_bruto, 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Arsip Dokumen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dokumen SPJ yang telah difinalisasi dan diarsipkan
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Arsip</p>
              <p className="text-xl font-bold mt-1">{filtered.length} dokumen</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Nilai</p>
              <p className="text-xl font-bold mt-1">{formatRp(totalNilai)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari arsip berdasarkan nama atau nomor SPJ..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={tahun} onValueChange={setTahun}>
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>TA {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">No. SPJ</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kegiatan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">TA</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nilai</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        {loading ? "Memuat..." : "Belum ada dokumen terarsip"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{item.nomor_spj}</td>
                        <td className="py-3 px-4 max-w-[250px] truncate">{item.nama_kegiatan}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(item.tanggal_kegiatan)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.tahun_anggaran}</td>
                        <td className="py-3 px-4 text-right font-mono font-medium">{formatRp(item.nilai_bruto)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" title="Lihat" onClick={() => setPreviewItem(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Kembalikan" onClick={() => restoreFromArchive(item.id)}>
                              <RotateCcw className="w-4 h-4 text-info" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Arsip SPJ — {previewItem?.nomor_spj}</DialogTitle>
          </DialogHeader>
          {previewItem && <SPJPreview kegiatan={previewItem} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ArsipDokumen;
