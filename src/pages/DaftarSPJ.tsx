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
import { Search, Filter, Eye, Trash2, CheckCircle, RotateCcw, Archive, FileText, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SPJPreview } from "@/components/SPJPreview";
import { exportToPDF, exportToDOCX } from "@/lib/export-spj";

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
};

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const statusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-success/15 text-success border-success/20 hover:bg-success/20">Verified</Badge>;
    case "draft":
      return <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">Draft</Badge>;
    case "revisi":
      return <Badge className="bg-warning/15 text-warning border-warning/20 hover:bg-warning/20">Revisi</Badge>;
    case "arsip":
      return <Badge className="bg-info/15 text-info border-info/20 hover:bg-info/20">Arsip</Badge>;
    default:
      return null;
  }
};

const DaftarSPJ = () => {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // "active" = not arsip
  const [previewItem, setPreviewItem] = useState<Kegiatan | null>(null);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from("kegiatan")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter === "active") {
      query = query.neq("status", "arsip");
    } else if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: result, error } = await query;
    if (error) {
      toast.error("Gagal memuat data: " + error.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("kegiatan").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Gagal update status: " + error.message);
    } else {
      toast.success(`Status diubah ke ${newStatus}`);
      fetchData();
    }
  };

  const deleteKegiatan = async (id: string) => {
    if (!confirm("Yakin ingin menghapus SPJ ini?")) return;
    const { error } = await supabase.from("kegiatan").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus: " + error.message);
    } else {
      toast.success("SPJ berhasil dihapus");
      fetchData();
    }
  };

  const filtered = data.filter((item) => {
    const matchSearch =
      item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.nomor_spj.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daftar SPJ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Memuat..." : `${filtered.length} dokumen ditemukan`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama atau nomor SPJ..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif (non-arsip)</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="revisi">Revisi</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="arsip">Arsip</SelectItem>
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
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">MAK</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nilai</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        {loading ? "Memuat data..." : "Belum ada data SPJ"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{item.nomor_spj}</td>
                        <td className="py-3 px-4 max-w-[250px] truncate">{item.nama_kegiatan}</td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{item.kode_mak || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(item.tanggal_kegiatan)}</td>
                        <td className="py-3 px-4">{statusBadge(item.status)}</td>
                        <td className="py-3 px-4 text-right font-mono font-medium">{formatRp(item.nilai_bruto)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" title="Lihat Detail" onClick={() => setPreviewItem(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {item.status === "draft" && (
                              <Button variant="ghost" size="sm" title="Verifikasi" onClick={() => updateStatus(item.id, "verified")}>
                                <CheckCircle className="w-4 h-4 text-success" />
                              </Button>
                            )}
                            {item.status === "verified" && (
                              <Button variant="ghost" size="sm" title="Revisi" onClick={() => updateStatus(item.id, "revisi")}>
                                <RotateCcw className="w-4 h-4 text-warning" />
                              </Button>
                            )}
                            {item.status === "verified" && (
                              <Button variant="ghost" size="sm" title="Arsipkan" onClick={() => updateStatus(item.id, "arsip")}>
                                <Archive className="w-4 h-4 text-info" />
                              </Button>
                            )}
                            {item.status === "draft" && (
                              <Button variant="ghost" size="sm" title="Hapus" onClick={() => deleteKegiatan(item.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
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

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview SPJ — {previewItem?.nomor_spj}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPDF(previewItem)}
                  className="gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToDOCX(previewItem)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export DOCX
                </Button>
              </div>
              <SPJPreview kegiatan={previewItem} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default DaftarSPJ;
