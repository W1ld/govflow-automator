import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const makData = [
  { kode: "524111", uraian: "Belanja Honor Output Kegiatan", pagu: 450000000, realisasi: 287500000 },
  { kode: "521111", uraian: "Belanja Keperluan Perkantoran", pagu: 180000000, realisasi: 95000000 },
  { kode: "524119", uraian: "Belanja Perjalanan Lainnya", pagu: 320000000, realisasi: 210000000 },
  { kode: "522141", uraian: "Belanja Sewa Gedung", pagu: 250000000, realisasi: 175000000 },
  { kode: "532111", uraian: "Belanja Modal Peralatan", pagu: 500000000, realisasi: 135000000 },
  { kode: "521213", uraian: "Belanja Honor Operasional", pagu: 350000000, realisasi: 190000000 },
  { kode: "521211", uraian: "Belanja Bahan Konsumsi", pagu: 200000000, realisasi: 98000000 },
  { kode: "524113", uraian: "Belanja Perjalanan Biasa", pagu: 200000000, realisasi: 97000000 },
];

const chartData = makData.map((m) => ({
  name: m.kode,
  pagu: m.pagu / 1000000,
  realisasi: m.realisasi / 1000000,
}));

const totalPagu = makData.reduce((a, b) => a + b.pagu, 0);
const totalRealisasi = makData.reduce((a, b) => a + b.realisasi, 0);

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const Anggaran = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Anggaran</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring pagu dan realisasi per Mata Anggaran Kegiatan (MAK)
          </p>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pagu</p>
              <p className="text-xl font-bold mt-1">{formatRp(totalPagu)}</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Realisasi</p>
              <p className="text-xl font-bold mt-1 text-success">{formatRp(totalRealisasi)}</p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sisa Anggaran</p>
              <p className="text-xl font-bold mt-1 text-accent">{formatRp(totalPagu - totalRealisasi)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pagu vs Realisasi per MAK (juta Rp)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" width={60} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(214,20%,88%)", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="pagu" fill="hsl(215, 50%, 23%)" radius={[0, 3, 3, 0]} name="Pagu" />
                  <Bar dataKey="realisasi" fill="hsl(42, 78%, 55%)" radius={[0, 3, 3, 0]} name="Realisasi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* MAK Details */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Detail per MAK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {makData.map((mak) => {
              const pct = Math.round((mak.realisasi / mak.pagu) * 100);
              return (
                <div key={mak.kode} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground mr-2">{mak.kode}</span>
                      <span className="font-medium">{mak.uraian}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Realisasi: {formatRp(mak.realisasi)}</span>
                    <span>Sisa: {formatRp(mak.pagu - mak.realisasi)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Anggaran;
