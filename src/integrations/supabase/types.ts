export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      kegiatan: {
        Row: {
          bendahara_nama: string | null
          bendahara_nip: string | null
          catatan_revisi: string | null
          created_at: string
          id: string
          jenis_belanja: string
          kode_mak: string | null
          kop_template_id: string | null
          lokasi: string | null
          nama_kegiatan: string
          nilai_bruto: number
          nilai_netto: number
          nomor_spj: string
          pph_jenis: string | null
          pph_nominal: number
          pph_rate: number
          ppk_nama: string | null
          ppk_nip: string | null
          ppn_nominal: number
          ppn_rate: number
          pptk_nama: string | null
          pptk_nip: string | null
          status: string
          tahun_anggaran: number
          tanggal_kegiatan: string
          updated_at: string
          uraian: string | null
        }
        Insert: {
          bendahara_nama?: string | null
          bendahara_nip?: string | null
          catatan_revisi?: string | null
          created_at?: string
          id?: string
          jenis_belanja: string
          kode_mak?: string | null
          kop_template_id?: string | null
          lokasi?: string | null
          nama_kegiatan: string
          nilai_bruto?: number
          nilai_netto?: number
          nomor_spj: string
          pph_jenis?: string | null
          pph_nominal?: number
          pph_rate?: number
          ppk_nama?: string | null
          ppk_nip?: string | null
          ppn_nominal?: number
          ppn_rate?: number
          pptk_nama?: string | null
          pptk_nip?: string | null
          status?: string
          tahun_anggaran?: number
          tanggal_kegiatan: string
          updated_at?: string
          uraian?: string | null
        }
        Update: {
          bendahara_nama?: string | null
          bendahara_nip?: string | null
          catatan_revisi?: string | null
          created_at?: string
          id?: string
          jenis_belanja?: string
          kode_mak?: string | null
          kop_template_id?: string | null
          lokasi?: string | null
          nama_kegiatan?: string
          nilai_bruto?: number
          nilai_netto?: number
          nomor_spj?: string
          pph_jenis?: string | null
          pph_nominal?: number
          pph_rate?: number
          ppk_nama?: string | null
          ppk_nip?: string | null
          ppn_nominal?: number
          ppn_rate?: number
          pptk_nama?: string | null
          pptk_nip?: string | null
          status?: string
          tahun_anggaran?: number
          tanggal_kegiatan?: string
          updated_at?: string
          uraian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kegiatan_kop_template_id_fkey"
            columns: ["kop_template_id"]
            isOneToOne: false
            referencedRelation: "kop_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      kop_templates: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          fax: string | null
          id: string
          is_active: boolean
          kode_pos: string | null
          kota: string | null
          logo_url: string | null
          nama_instansi: string
          nama_unit_kerja: string | null
          provinsi: string | null
          telepon: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          id?: string
          is_active?: boolean
          kode_pos?: string | null
          kota?: string | null
          logo_url?: string | null
          nama_instansi: string
          nama_unit_kerja?: string | null
          provinsi?: string | null
          telepon?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          id?: string
          is_active?: boolean
          kode_pos?: string | null
          kota?: string | null
          logo_url?: string | null
          nama_instansi?: string
          nama_unit_kerja?: string | null
          provinsi?: string | null
          telepon?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      pejabat_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          jabatan: string
          nama: string
          nip: string | null
          pangkat_golongan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          jabatan: string
          nama: string
          nip?: string | null
          pangkat_golongan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          jabatan?: string
          nama?: string
          nip?: string | null
          pangkat_golongan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
