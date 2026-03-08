import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";

const KalkulatorPajak = () => {
  const [jenis, setJenis] = useState("");
  const [golongan, setGolongan] = useState("");
  const [bruto, setBruto] = useState("");
  const [method, setMethod] = useState("gross");

  const nilaiInput = parseFloat(bruto) || 0;

  let pphLabel = "";
  let pphRate = 0;
  let ppnRate = 0;

  if (jenis === "pph21") {
    pphLabel = "PPh 21";
    if (golongan === "gol3_atas") pphRate = 0.05;
    else if (golongan === "gol3_bawah") pphRate = 0.05;
    else if (golongan === "non_pns") pphRate = 0.05;
    else pphRate = 0;
  } else if (jenis === "pph22") {
    pphLabel = "PPh 22";
    pphRate = 0.015;
    ppnRate = 0.11;
  } else if (jenis === "pph23") {
    pphLabel = "PPh 23";
    pphRate = 0.02;
    ppnRate = 0.11;
  }

  let nilaiBruto = 0;
  let pph = 0;
  let ppn = 0;
  let netto = 0;

  if (method === "gross") {
    nilaiBruto = nilaiInput;
    pph = nilaiBruto * pphRate;
    ppn = nilaiBruto * ppnRate;
    netto = nilaiBruto - pph;
  } else {
    // Gross-up: netto is known, find bruto
    netto = nilaiInput;
    nilaiBruto = pphRate < 1 ? netto / (1 - pphRate) : netto;
    pph = nilaiBruto * pphRate;
    ppn = nilaiBruto * ppnRate;
  }

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleReset = () => {
    setJenis("");
    setGolongan("");
    setBruto("");
    setMethod("gross");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kalkulator Pajak</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hitung PPh 21, PPh 22, PPh 23, dan PPN secara mandiri
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Parameter Perhitungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Jenis Pajak</Label>
                <Select value={jenis} onValueChange={setJenis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pajak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pph21">PPh Pasal 21</SelectItem>
                    <SelectItem value="pph22">PPh Pasal 22</SelectItem>
                    <SelectItem value="pph23">PPh Pasal 23</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Metode</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross">Gross (Bruto → Netto)</SelectItem>
                    <SelectItem value="grossup">Gross-Up (Netto → Bruto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {jenis === "pph21" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Golongan</Label>
                <Select value={golongan} onValueChange={setGolongan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gol3_atas">PNS Gol. III ke atas (5%)</SelectItem>
                    <SelectItem value="gol3_bawah">PNS Gol. II ke bawah (0%)</SelectItem>
                    <SelectItem value="non_pns">Non-PNS (5%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {method === "gross" ? "Nilai Bruto (Rp)" : "Nilai Netto / Take Home (Rp)"}
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={bruto}
                onChange={(e) => setBruto(e.target.value)}
                className="font-mono text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {nilaiInput > 0 && jenis && (
          <Card className="border shadow-sm border-accent/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Hasil Perhitungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nilai Bruto</span>
                <span className="font-mono font-bold text-lg">{formatRp(nilaiBruto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pphLabel} ({(pphRate * 100).toFixed(1)}%)</span>
                <span className="font-mono text-destructive">-{formatRp(pph)}</span>
              </div>
              {ppnRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN (11%)</span>
                  <span className="font-mono text-info">{formatRp(ppn)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="font-bold">Nilai Netto (Diterima)</span>
                <span className="font-mono font-bold text-lg text-success">{formatRp(netto)}</span>
              </div>
              {ppnRate > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">Total Disetor ke Negara</span>
                    <span className="font-mono font-bold">{formatRp(pph + ppn)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </AppLayout>
  );
};

export default KalkulatorPajak;
