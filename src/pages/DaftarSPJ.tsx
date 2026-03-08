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
import { Search, Filter, Download, Eye } from "lucide-react";
import { useState } from "react";

const allSPJ = [
  { id: "SPJ-2026-0142", kegiatan: "Workshop Peningkatan Kapasitas SDM", mak: "524111", tanggal: "28 Feb 2026", status: "verified", nilai: 45500000, operator: "Andi S." },
  { id: "SPJ-2026-0141", kegiatan: "Pengadaan ATK Semester I", mak: "521111", tanggal: "25 Feb 2026", status: "draft", nilai: 12300000, operator: "Budi R." },
  { id: "SPJ-2026-0140", kegiatan: "Rapat Koordinasi Lintas Unit", mak: "524119", tanggal: "22 Feb 2026", status: "revisi", nilai: 8750000, operator: "Andi S." },
  { id: "SPJ-2026-0139", kegiatan: "Perjalanan Dinas Monitoring Lapangan", mak: "524113", tanggal: "20 Feb 2026", status: "verified", nilai: 23100000, operator: "Citra M." },
  { id: "SPJ-2026-0138", kegiatan: "Honor Narasumber Bimbingan Teknis", mak: "521213", tanggal: "18 Feb 2026", status: "verified", nilai: 15000000, operator: "Budi R." },
  { id: "SPJ-2026-0137", kegiatan: "Sewa Gedung Pertemuan", mak: "522141", tanggal: "15 Feb 2026", status: "verified", nilai: 35000000, operator: "Dewi A." },
  { id: "SPJ-2026-0136", kegiatan: "Pengadaan Komputer Unit Kerja", mak: "532111", tanggal: "12 Feb 2026", status: "draft", nilai: 67500000, operator: "Andi S." },
  { id: "SPJ-2026-0135", kegiatan: "Konsumsi Rapat Pimpinan", mak: "521211", tanggal: "10 Feb 2026", status: "verified", nilai: 4200000, operator: "Citra M." },
];

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const statusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-success/15 text-success border-success/20 hover:bg-success/20">Verified</Badge>;
    case "draft":
      return <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">Draft</Badge>;
    case "revisi":
      return <Badge className="bg-warning/15 text-warning border-warning/20 hover:bg-warning/20">Revisi</Badge>;
    default:
      return null;
  }
};

const DaftarSPJ = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = allSPJ.filter((item) => {
    const matchSearch = item.kegiatan.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daftar SPJ</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} dokumen ditemukan</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
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
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="revisi">Revisi</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
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
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operator</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nilai</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{item.id}</td>
                      <td className="py-3 px-4 max-w-[250px] truncate">{item.kegiatan}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{item.mak}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.tanggal}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.operator}</td>
                      <td className="py-3 px-4">{statusBadge(item.status)}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium">{formatRp(item.nilai)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DaftarSPJ;
