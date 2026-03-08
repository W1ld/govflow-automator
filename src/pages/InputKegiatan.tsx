import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, FileText, Calculator } from "lucide-react";
import { toast } from "sonner";

const InputKegiatan = () => {
  const [jenisKegiatan, setJenisKegiatan] = useState("");
  const [nilaiBruto, setNilaiBruto] = useState("");

  const pphRate = jenisKegiatan === "honor" ? 0.05 : jenisKegiatan === "pengadaan_barang" ? 0.015 : jenisKegiatan === "jasa" ? 0.02 : 0;
  const ppnRate = ["pengadaan_barang", "jasa"].includes(jenisKegiatan) ? 0.11 : 0;
  const bruto = parseFloat(nilaiBruto) || 0;
  const pph = bruto * pphRate;
  const ppn = bruto * ppnRate;
  const netto = bruto - pph;

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Data kegiatan berhasil disimpan sebagai Draft");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Input Kegiatan Baru</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Satu kali input, sistem otomatis menghasilkan dokumen pendukung
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Informasi Kegiatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nama Kegiatan</Label>
                      <Input placeholder="Contoh: Workshop Peningkatan SDM" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kode MAK</Label>
                      <Input placeholder="5211.001.051.A.524111" className="font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tanggal Kegiatan</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Lokasi</Label>
                      <Input placeholder="Ruang Rapat Lt.3 Gedung A" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Uraian Kegiatan</Label>
                    <Textarea placeholder="Jelaskan secara singkat tujuan dan uraian kegiatan..." rows={3} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Jenis Belanja</Label>
                      <Select value={jenisKegiatan} onValueChange={setJenisKegiatan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis belanja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="honor">Honor Narasumber/Panitia</SelectItem>
                          <SelectItem value="pengadaan_barang">Pengadaan Barang</SelectItem>
                          <SelectItem value="jasa">Belanja Jasa</SelectItem>
                          <SelectItem value="perjalanan">Perjalanan Dinas</SelectItem>
                          <SelectItem value="operasional">Operasional Kantor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nilai Bruto (Rp)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={nilaiBruto}
                        onChange={(e) => setNilaiBruto(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">PPK</Label>
                      <Input placeholder="Nama Pejabat Pembuat Komitmen" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Bendahara Pengeluaran</Label>
                      <Input placeholder="Nama Bendahara" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - Tax Calculator Preview */}
            <div className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Perhitungan Pajak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nilai Bruto</span>
                    <span className="font-mono font-medium">{formatRp(bruto)}</span>
                  </div>
                  {pphRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        PPh ({jenisKegiatan === "honor" ? "21" : jenisKegiatan === "pengadaan_barang" ? "22" : "23"}) ({(pphRate * 100).toFixed(1)}%)
                      </span>
                      <span className="font-mono text-destructive">-{formatRp(pph)}</span>
                    </div>
                  )}
                  {ppnRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">PPN (11%)</span>
                      <span className="font-mono text-info">{formatRp(ppn)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Nilai Netto</span>
                    <span className="font-mono">{formatRp(netto)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Dokumen Otomatis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Dokumen berikut akan disiapkan secara otomatis:
                  </p>
                  <ul className="space-y-2 text-xs">
                    {["Surat Undangan", "Daftar Hadir", "Notulen Rapat", "SPTB", "Kwitansi", "SPD"].map((doc) => (
                      <li key={doc} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-muted-foreground">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Draft
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Simpan & Generate Dokumen
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default InputKegiatan;
