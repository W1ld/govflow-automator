import {
  Wallet,
  TrendingUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";

const summaryCards = [
  {
    title: "Total Pagu",
    value: "Rp 2.450.000.000",
    change: "TA 2026",
    icon: Wallet,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "Realisasi",
    value: "Rp 1.287.500.000",
    change: "52.6%",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "SPJ Diverifikasi",
    value: "142",
    change: "+12 bulan ini",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Menunggu Revisi",
    value: "8",
    change: "Perlu tindakan",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const budgetData = [
  { name: "Jan", pagu: 200, realisasi: 120 },
  { name: "Feb", pagu: 200, realisasi: 165 },
  { name: "Mar", pagu: 200, realisasi: 190 },
  { name: "Apr", pagu: 210, realisasi: 140 },
  { name: "Mei", pagu: 210, realisasi: 175 },
  { name: "Jun", pagu: 205, realisasi: 155 },
  { name: "Jul", pagu: 205, realisasi: 0 },
  { name: "Agu", pagu: 205, realisasi: 0 },
  { name: "Sep", pagu: 205, realisasi: 0 },
  { name: "Okt", pagu: 205, realisasi: 0 },
  { name: "Nov", pagu: 205, realisasi: 0 },
  { name: "Des", pagu: 200, realisasi: 0 },
];

const taxData = [
  { name: "PPh 21", value: 45200000, color: "hsl(215, 50%, 23%)" },
  { name: "PPh 22", value: 12800000, color: "hsl(42, 78%, 55%)" },
  { name: "PPh 23", value: 8500000, color: "hsl(152, 60%, 40%)" },
  { name: "PPN", value: 128750000, color: "hsl(210, 80%, 52%)" },
];

const recentSPJ = [
  { id: "SPJ-2026-0142", kegiatan: "Workshop Peningkatan Kapasitas SDM", tanggal: "28 Feb 2026", status: "verified", nilai: "Rp 45.500.000" },
  { id: "SPJ-2026-0141", kegiatan: "Pengadaan ATK Semester I", tanggal: "25 Feb 2026", status: "draft", nilai: "Rp 12.300.000" },
  { id: "SPJ-2026-0140", kegiatan: "Rapat Koordinasi Lintas Unit", tanggal: "22 Feb 2026", status: "revisi", nilai: "Rp 8.750.000" },
  { id: "SPJ-2026-0139", kegiatan: "Perjalanan Dinas Monitoring", tanggal: "20 Feb 2026", status: "verified", nilai: "Rp 23.100.000" },
  { id: "SPJ-2026-0138", kegiatan: "Honor Narasumber Bimtek", tanggal: "18 Feb 2026", status: "verified", nilai: "Rp 15.000.000" },
];

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

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan keuangan dan progres SPJ — Tahun Anggaran 2026
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold text-card-foreground">{card.value}</p>
                    <p className={`text-xs font-medium ${card.color}`}>{card.change}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget Bar Chart */}
          <Card className="lg:col-span-2 border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Pagu vs Realisasi (juta Rp)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 12%, 50%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 20%, 88%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="pagu" fill="hsl(215, 50%, 23%)" radius={[3, 3, 0, 0]} name="Pagu" />
                    <Bar dataKey="realisasi" fill="hsl(42, 78%, 55%)" radius={[3, 3, 0, 0]} name="Realisasi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tax Pie Chart */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Komposisi Pajak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taxData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatRupiah(value)}
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 20%, 88%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {taxData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent SPJ Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">SPJ Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">No. SPJ</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kegiatan</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSPJ.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs">{item.id}</td>
                      <td className="py-2.5 px-3">{item.kegiatan}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.tanggal}</td>
                      <td className="py-2.5 px-3">{statusBadge(item.status)}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{item.nilai}</td>
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

export default Dashboard;
