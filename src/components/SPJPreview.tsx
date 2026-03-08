import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type KopTemplate = {
  id: string;
  nama_instansi: string;
  nama_unit_kerja: string | null;
  alamat: string | null;
  kota: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  telepon: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
};

type Kegiatan = {
  id: string;
  nomor_spj: string;
  nama_kegiatan: string;
  kode_mak: string | null;
  tanggal_kegiatan: string;
  lokasi: string | null;
  uraian: string | null;
  jenis_belanja: string;
  nilai_bruto: number;
  nilai_netto: number;
  pph_jenis: string | null;
  pph_nominal: number;
  ppn_nominal: number;
  ppk_nama: string | null;
  ppk_nip: string | null;
  bendahara_nama: string | null;
  bendahara_nip: string | null;
  pptk_nama: string | null;
  pptk_nip: string | null;
  kop_template_id: string | null;
  status: string;
};

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDateLong = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const jenisBelanjaLabel: Record<string, string> = {
  honor: "Honor Narasumber/Panitia",
  pengadaan_barang: "Pengadaan Barang",
  jasa: "Belanja Jasa",
  perjalanan: "Perjalanan Dinas",
  operasional: "Operasional Kantor",
};

export function SPJPreview({ kegiatan }: { kegiatan: Kegiatan }) {
  const [kop, setKop] = useState<KopTemplate | null>(null);

  useEffect(() => {
    if (kegiatan.kop_template_id) {
      supabase
        .from("kop_templates")
        .select("*")
        .eq("id", kegiatan.kop_template_id)
        .single()
        .then(({ data }) => {
          if (data) setKop(data);
        });
    }
  }, [kegiatan.kop_template_id]);

  return (
    <div className="bg-card border rounded-lg p-8 space-y-6 text-sm print:shadow-none" id="spj-preview">
      {/* KOP Header */}
      {kop && (
        <div className="text-center border-b-2 border-foreground pb-4 space-y-1">
          <div className="flex items-center justify-center gap-4">
            {kop.logo_url && (
              <img src={kop.logo_url} alt="Logo" className="w-14 h-14 object-contain" />
            )}
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider">{kop.nama_instansi}</h2>
              {kop.nama_unit_kerja && (
                <p className="text-base font-semibold uppercase">{kop.nama_unit_kerja}</p>
              )}
            </div>
          </div>
          {kop.alamat && (
            <p className="text-xs text-muted-foreground">
              {kop.alamat}
              {kop.kota && `, ${kop.kota}`}
              {kop.provinsi && `, ${kop.provinsi}`}
              {kop.kode_pos && ` ${kop.kode_pos}`}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {kop.telepon && <span>Telp: {kop.telepon}</span>}
            {kop.fax && <span>Fax: {kop.fax}</span>}
            {kop.email && <span>Email: {kop.email}</span>}
          </div>
          {kop.website && (
            <p className="text-xs text-muted-foreground">{kop.website}</p>
          )}
        </div>
      )}

      {/* Document Title */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold uppercase">Surat Pertanggungjawaban (SPJ)</h3>
        <p className="text-xs text-muted-foreground">Nomor: {kegiatan.nomor_spj}</p>
      </div>

      {/* Details Table */}
      <div className="space-y-2">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-muted-foreground w-40">Nama Kegiatan</td>
              <td className="py-1 font-medium">: {kegiatan.nama_kegiatan}</td>
            </tr>
            <tr>
              <td className="py-1 text-muted-foreground">Kode MAK</td>
              <td className="py-1 font-mono">: {kegiatan.kode_mak || "-"}</td>
            </tr>
            <tr>
              <td className="py-1 text-muted-foreground">Tanggal</td>
              <td className="py-1">: {formatDateLong(kegiatan.tanggal_kegiatan)}</td>
            </tr>
            <tr>
              <td className="py-1 text-muted-foreground">Lokasi</td>
              <td className="py-1">: {kegiatan.lokasi || "-"}</td>
            </tr>
            <tr>
              <td className="py-1 text-muted-foreground">Jenis Belanja</td>
              <td className="py-1">: {jenisBelanjaLabel[kegiatan.jenis_belanja] || kegiatan.jenis_belanja}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {kegiatan.uraian && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Uraian Kegiatan</p>
          <p className="text-sm">{kegiatan.uraian}</p>
        </div>
      )}

      {/* Financial Summary */}
      <div className="border rounded-md p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Rincian Keuangan</p>
        <div className="flex justify-between">
          <span>Nilai Bruto</span>
          <span className="font-mono font-medium">{formatRp(kegiatan.nilai_bruto)}</span>
        </div>
        {kegiatan.pph_nominal > 0 && (
          <div className="flex justify-between">
            <span>{kegiatan.pph_jenis}</span>
            <span className="font-mono text-destructive">-{formatRp(kegiatan.pph_nominal)}</span>
          </div>
        )}
        {kegiatan.ppn_nominal > 0 && (
          <div className="flex justify-between">
            <span>PPN</span>
            <span className="font-mono">{formatRp(kegiatan.ppn_nominal)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Nilai Netto</span>
          <span className="font-mono">{formatRp(kegiatan.nilai_netto)}</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
        {kegiatan.pptk_nama && (
          <div className="space-y-12">
            <p className="font-semibold">PPTK</p>
            <div>
              <p className="font-medium underline">{kegiatan.pptk_nama}</p>
              {kegiatan.pptk_nip && <p className="text-muted-foreground">NIP. {kegiatan.pptk_nip}</p>}
            </div>
          </div>
        )}
        {kegiatan.ppk_nama && (
          <div className="space-y-12">
            <p className="font-semibold">Pejabat Pembuat Komitmen</p>
            <div>
              <p className="font-medium underline">{kegiatan.ppk_nama}</p>
              {kegiatan.ppk_nip && <p className="text-muted-foreground">NIP. {kegiatan.ppk_nip}</p>}
            </div>
          </div>
        )}
        {kegiatan.bendahara_nama && (
          <div className="space-y-12">
            <p className="font-semibold">Bendahara Pengeluaran</p>
            <div>
              <p className="font-medium underline">{kegiatan.bendahara_nama}</p>
              {kegiatan.bendahara_nip && <p className="text-muted-foreground">NIP. {kegiatan.bendahara_nip}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
