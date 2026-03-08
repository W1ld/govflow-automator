import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building2, Users, Save, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  is_active: boolean;
};

type PejabatTemplate = {
  id: string;
  jabatan: string;
  nama: string;
  nip: string | null;
  pangkat_golongan: string | null;
  is_active: boolean;
};

type KopFormData = Omit<KopTemplate, "id" | "is_active"> & { logoFile?: File | null };

const emptyKop: KopFormData = {
  nama_instansi: "",
  nama_unit_kerja: "",
  alamat: "",
  kota: "",
  provinsi: "",
  kode_pos: "",
  telepon: "",
  fax: "",
  email: "",
  website: "",
  logo_url: null,
  logoFile: null,
};

const emptyPejabat: Omit<PejabatTemplate, "id" | "is_active"> = {
  jabatan: "",
  nama: "",
  nip: "",
  pangkat_golongan: "",
};

const Pengaturan = () => {
  const { user } = useAuth();
  const [kopList, setKopList] = useState<KopTemplate[]>([]);
  const [pejabatList, setPejabatList] = useState<PejabatTemplate[]>([]);
  const [kopForm, setKopForm] = useState<KopFormData>(emptyKop);
  const [editKopId, setEditKopId] = useState<string | null>(null);
  const [kopDialogOpen, setKopDialogOpen] = useState(false);
  const [pejabatForm, setPejabatForm] = useState(emptyPejabat);
  const [editPejabatId, setEditPejabatId] = useState<string | null>(null);
  const [pejabatDialogOpen, setPejabatDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [kopRes, pejabatRes] = await Promise.all([
      supabase.from("kop_templates").select("*").order("created_at"),
      supabase.from("pejabat_templates").select("*").order("created_at"),
    ]);
    if (kopRes.data) setKopList(kopRes.data);
    if (pejabatRes.data) setPejabatList(pejabatRes.data);
  };

  const getLogoSignedUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from("kop-logos").createSignedUrl(path, 3600);
    if (error) {
      console.error("[Pengaturan] signed URL error:", error);
      return null;
    }
    return data.signedUrl;
  };

  // KOP CRUD
  const openKopCreate = () => {
    setKopForm(emptyKop);
    setEditKopId(null);
    setLogoPreview(null);
    setKopDialogOpen(true);
  };

  const openKopEdit = (kop: KopTemplate) => {
    setKopForm({
      nama_instansi: kop.nama_instansi,
      nama_unit_kerja: kop.nama_unit_kerja || "",
      alamat: kop.alamat || "",
      kota: kop.kota || "",
      provinsi: kop.provinsi || "",
      kode_pos: kop.kode_pos || "",
      telepon: kop.telepon || "",
      fax: kop.fax || "",
      email: kop.email || "",
      website: kop.website || "",
      logo_url: kop.logo_url,
      logoFile: null,
    });
    setEditKopId(kop.id);
    setLogoPreview(kop.logo_url || null);
    setKopDialogOpen(true);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG, JPG, dll)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    setKopForm({ ...kopForm, logoFile: file });
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setKopForm({ ...kopForm, logoFile: null, logo_url: null });
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadLogo = async (file: File, kopId: string, userId: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${kopId}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("kop-logos").upload(path, file, { upsert: true });
    if (error) throw error;
    // Store the storage path, not a URL
    return path;
  };

  const saveKop = async () => {
    if (!kopForm.nama_instansi) {
      toast.error("Nama instansi wajib diisi");
      return;
    }
    setSaving(true);

    try {
      const payload: Record<string, any> = {
        nama_instansi: kopForm.nama_instansi,
        nama_unit_kerja: kopForm.nama_unit_kerja || null,
        alamat: kopForm.alamat || null,
        kota: kopForm.kota || null,
        provinsi: kopForm.provinsi || null,
        kode_pos: kopForm.kode_pos || null,
        telepon: kopForm.telepon || null,
        fax: kopForm.fax || null,
        email: kopForm.email || null,
        website: kopForm.website || null,
      };

      if (editKopId) {
        // Handle logo upload for edit
        if (kopForm.logoFile) {
          payload.logo_url = await uploadLogo(kopForm.logoFile, editKopId, user!.id);
        } else if (kopForm.logo_url === null) {
          payload.logo_url = null;
        }
        const { error } = await supabase.from("kop_templates").update(payload).eq("id", editKopId);
        if (error) throw error;
        toast.success("Template KOP berhasil diupdate");
      } else {
        // Insert first, then upload logo
        payload.logo_url = null;
        const { data, error } = await supabase.from("kop_templates").insert(payload as any).select("id").single();
        if (error) throw error;
        if (kopForm.logoFile && data) {
          const logoUrl = await uploadLogo(kopForm.logoFile, data.id, user!.id);
          await supabase.from("kop_templates").update({ logo_url: logoUrl }).eq("id", data.id);
        }
        toast.success("Template KOP berhasil disimpan");
      }
    } catch (err: any) {
      console.error("[Pengaturan] save kop error:", err);
      toast.error("Gagal menyimpan. Silakan coba lagi.");
    }

    setSaving(false);
    setKopDialogOpen(false);
    fetchAll();
  };

  const deleteKop = async (id: string) => {
    if (!confirm("Hapus template KOP ini?")) return;
    await supabase.from("kop_templates").delete().eq("id", id);
    toast.success("Template KOP dihapus");
    fetchAll();
  };

  // Pejabat CRUD
  const openPejabatCreate = () => {
    setPejabatForm(emptyPejabat);
    setEditPejabatId(null);
    setPejabatDialogOpen(true);
  };

  const openPejabatEdit = (p: PejabatTemplate) => {
    setPejabatForm({
      jabatan: p.jabatan,
      nama: p.nama,
      nip: p.nip || "",
      pangkat_golongan: p.pangkat_golongan || "",
    });
    setEditPejabatId(p.id);
    setPejabatDialogOpen(true);
  };

  const savePejabat = async () => {
    if (!pejabatForm.jabatan || !pejabatForm.nama) {
      toast.error("Jabatan dan nama wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      jabatan: pejabatForm.jabatan,
      nama: pejabatForm.nama,
      nip: pejabatForm.nip || null,
      pangkat_golongan: pejabatForm.pangkat_golongan || null,
    };

    if (editPejabatId) {
      const { error } = await supabase.from("pejabat_templates").update(payload).eq("id", editPejabatId);
      if (error) toast.error("Gagal update");
      else toast.success("Data pejabat berhasil diupdate");
    } else {
      const { error } = await supabase.from("pejabat_templates").insert(payload);
      if (error) toast.error("Gagal simpan");
      else toast.success("Data pejabat berhasil disimpan");
    }
    setSaving(false);
    setPejabatDialogOpen(false);
    fetchAll();
  };

  const deletePejabat = async (id: string) => {
    if (!confirm("Hapus data pejabat ini?")) return;
    await supabase.from("pejabat_templates").delete().eq("id", id);
    toast.success("Data pejabat dihapus");
    fetchAll();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola template KOP surat dan data pejabat penandatangan
          </p>
        </div>

        {/* KOP Templates */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Template KOP Surat
              </CardTitle>
              <Button size="sm" onClick={openKopCreate} className="gap-1">
                <Plus className="w-4 h-4" /> Tambah KOP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {kopList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Belum ada template KOP. Klik "Tambah KOP" untuk memulai.
              </p>
            ) : (
              <div className="space-y-3">
                {kopList.map((kop) => (
                  <div key={kop.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      {kop.logo_url ? (
                        <img src={kop.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Image className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{kop.nama_instansi}</p>
                        {kop.nama_unit_kerja && (
                          <p className="text-xs text-muted-foreground">{kop.nama_unit_kerja}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[kop.kota, kop.provinsi].filter(Boolean).join(", ")}
                          {kop.telepon && ` • ${kop.telepon}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openKopEdit(kop)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteKop(kop.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pejabat Templates */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Data Pejabat Penandatangan
              </CardTitle>
              <Button size="sm" onClick={openPejabatCreate} className="gap-1">
                <Plus className="w-4 h-4" /> Tambah Pejabat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pejabatList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Belum ada data pejabat. Data ini dipakai untuk auto-fill di form kegiatan.
              </p>
            ) : (
              <div className="space-y-3">
                {pejabatList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div>
                      <p className="font-medium text-sm">{p.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.jabatan}
                        {p.pangkat_golongan && ` • ${p.pangkat_golongan}`}
                        {p.nip && ` • NIP: ${p.nip}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openPejabatEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePejabat(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KOP Dialog */}
      <Dialog open={kopDialogOpen} onOpenChange={setKopDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editKopId ? "Edit Template KOP" : "Tambah Template KOP"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Logo Instansi</Label>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain border rounded-md p-1" />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    {logoPreview ? "Ganti Logo" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG. Maks 2MB.</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nama Instansi *</Label>
              <Input value={kopForm.nama_instansi} onChange={(e) => setKopForm({ ...kopForm, nama_instansi: e.target.value })} placeholder="Contoh: KEMENTERIAN KEUANGAN RI" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nama Unit Kerja</Label>
              <Input value={kopForm.nama_unit_kerja || ""} onChange={(e) => setKopForm({ ...kopForm, nama_unit_kerja: e.target.value })} placeholder="Contoh: Direktorat Jenderal Perbendaharaan" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Alamat</Label>
              <Input value={kopForm.alamat || ""} onChange={(e) => setKopForm({ ...kopForm, alamat: e.target.value })} placeholder="Jl. Lapangan Banteng Timur No.2-4" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Kota</Label>
                <Input value={kopForm.kota || ""} onChange={(e) => setKopForm({ ...kopForm, kota: e.target.value })} placeholder="Jakarta Pusat" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Provinsi</Label>
                <Input value={kopForm.provinsi || ""} onChange={(e) => setKopForm({ ...kopForm, provinsi: e.target.value })} placeholder="DKI Jakarta" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Kode Pos</Label>
                <Input value={kopForm.kode_pos || ""} onChange={(e) => setKopForm({ ...kopForm, kode_pos: e.target.value })} placeholder="10710" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Telepon</Label>
                <Input value={kopForm.telepon || ""} onChange={(e) => setKopForm({ ...kopForm, telepon: e.target.value })} placeholder="(021) 3449230" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Fax</Label>
                <Input value={kopForm.fax || ""} onChange={(e) => setKopForm({ ...kopForm, fax: e.target.value })} placeholder="(021) 3457490" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input value={kopForm.email || ""} onChange={(e) => setKopForm({ ...kopForm, email: e.target.value })} placeholder="info@kemenkeu.go.id" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Website</Label>
              <Input value={kopForm.website || ""} onChange={(e) => setKopForm({ ...kopForm, website: e.target.value })} placeholder="www.kemenkeu.go.id" />
            </div>
            <Button onClick={saveKop} className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pejabat Dialog */}
      <Dialog open={pejabatDialogOpen} onOpenChange={setPejabatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPejabatId ? "Edit Data Pejabat" : "Tambah Data Pejabat"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Jabatan *</Label>
              <Input value={pejabatForm.jabatan} onChange={(e) => setPejabatForm({ ...pejabatForm, jabatan: e.target.value })} placeholder="Contoh: PPK, Bendahara, PPTK, KPA" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nama Lengkap *</Label>
              <Input value={pejabatForm.nama} onChange={(e) => setPejabatForm({ ...pejabatForm, nama: e.target.value })} placeholder="Nama lengkap dengan gelar" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">NIP</Label>
              <Input value={pejabatForm.nip || ""} onChange={(e) => setPejabatForm({ ...pejabatForm, nip: e.target.value })} placeholder="197x0101 200x01 x 00x" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pangkat/Golongan</Label>
              <Input value={pejabatForm.pangkat_golongan || ""} onChange={(e) => setPejabatForm({ ...pejabatForm, pangkat_golongan: e.target.value })} placeholder="Contoh: Pembina (IV/a)" />
            </div>
            <Button onClick={savePejabat} className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Pengaturan;
