import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";
import { getLogoSignedUrl } from "@/lib/storage-utils";

type KopTemplate = {
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

async function fetchKop(kopId: string | null): Promise<KopTemplate | null> {
  if (!kopId) return null;
  const { data } = await supabase.from("kop_templates").select("*").eq("id", kopId).single();
  return data;
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function fetchImageAsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url);
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

// ==================== PDF EXPORT ====================
export async function exportToPDF(kegiatan: Kegiatan) {
  const kop = await fetchKop(kegiatan.kop_template_id);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // KOP Header
  if (kop) {
    let logoWidth = 0;

    // Add logo if available
    if (kop.logo_url) {
      const logoUrl = await getLogoSignedUrl(kop.logo_url);
      const logoBase64 = logoUrl ? await fetchImageAsBase64(logoUrl) : null;
      if (logoBase64) {
        try {
          const logoSize = 15; // mm
          const logoX = 15;
          doc.addImage(logoBase64, "PNG", logoX, y - 3, logoSize, logoSize);
          logoWidth = logoSize + 5;
        } catch {
          // Logo failed to load, continue without it
        }
      }
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(kop.nama_instansi, pageWidth / 2, y, { align: "center" });
    y += 6;

    if (kop.nama_unit_kerja) {
      doc.setFontSize(12);
      doc.text(kop.nama_unit_kerja.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 5;
    }

    if (logoWidth > 0) {
      y = Math.max(y, 15 + 15); // ensure y is past the logo
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const addrParts = [kop.alamat, kop.kota, kop.provinsi, kop.kode_pos].filter(Boolean);
    if (addrParts.length) {
      doc.text(addrParts.join(", "), pageWidth / 2, y, { align: "center" });
      y += 4;
    }

    const contactParts = [];
    if (kop.telepon) contactParts.push(`Telp: ${kop.telepon}`);
    if (kop.fax) contactParts.push(`Fax: ${kop.fax}`);
    if (kop.email) contactParts.push(`Email: ${kop.email}`);
    if (contactParts.length) {
      doc.text(contactParts.join("  |  "), pageWidth / 2, y, { align: "center" });
      y += 4;
    }

    if (kop.website) {
      doc.text(kop.website, pageWidth / 2, y, { align: "center" });
      y += 4;
    }

    doc.setLineWidth(0.8);
    doc.line(15, y, pageWidth - 15, y);
    y += 2;
    doc.setLineWidth(0.3);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;
  }

  // Document Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("SURAT PERTANGGUNGJAWABAN (SPJ)", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nomor: ${kegiatan.nomor_spj}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Details table
  const details = [
    ["Nama Kegiatan", kegiatan.nama_kegiatan],
    ["Kode MAK", kegiatan.kode_mak || "-"],
    ["Tanggal", formatDateLong(kegiatan.tanggal_kegiatan)],
    ["Lokasi", kegiatan.lokasi || "-"],
    ["Jenis Belanja", jenisBelanjaLabel[kegiatan.jenis_belanja] || kegiatan.jenis_belanja],
  ];

  autoTable(doc, {
    startY: y,
    body: details.map(([label, value]) => [label, `: ${value}`]),
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" } },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Uraian
  if (kegiatan.uraian) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Uraian Kegiatan:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(kegiatan.uraian, pageWidth - 30);
    doc.text(lines, 15, y);
    y += lines.length * 5 + 5;
  }

  // Financial Summary
  const finRows: string[][] = [
    ["Nilai Bruto", formatRp(kegiatan.nilai_bruto)],
  ];
  if (kegiatan.pph_nominal > 0) {
    finRows.push([kegiatan.pph_jenis || "PPh", `-${formatRp(kegiatan.pph_nominal)}`]);
  }
  if (kegiatan.ppn_nominal > 0) {
    finRows.push(["PPN", formatRp(kegiatan.ppn_nominal)]);
  }
  finRows.push(["Nilai Netto", formatRp(kegiatan.nilai_netto)]);

  autoTable(doc, {
    startY: y,
    head: [["Keterangan", "Jumlah"]],
    body: finRows,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 52, 74], textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.row.index === finRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 20;

  if (y > 240) {
    doc.addPage();
    y = 30;
  }

  // Signatures
  doc.setFontSize(9);
  const sigWidth = (pageWidth - 30) / 3;
  const signers = [
    { title: "PPTK", nama: kegiatan.pptk_nama, nip: kegiatan.pptk_nip },
    { title: "Pejabat Pembuat Komitmen", nama: kegiatan.ppk_nama, nip: kegiatan.ppk_nip },
    { title: "Bendahara Pengeluaran", nama: kegiatan.bendahara_nama, nip: kegiatan.bendahara_nip },
  ].filter((s) => s.nama);

  signers.forEach((signer, i) => {
    const x = 15 + i * sigWidth + sigWidth / 2;
    doc.setFont("helvetica", "bold");
    doc.text(signer.title, x, y, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(signer.nama!, x, y + 25, { align: "center" });
    if (signer.nip) {
      doc.text(`NIP. ${signer.nip}`, x, y + 30, { align: "center" });
    }
  });

  doc.save(`SPJ_${kegiatan.nomor_spj.replace(/\//g, "-")}.pdf`);
}

// ==================== DOCX EXPORT ====================
export async function exportToDOCX(kegiatan: Kegiatan) {
  const kop = await fetchKop(kegiatan.kop_template_id);

  const children: (Paragraph | Table)[] = [];

  // KOP Header with logo
  if (kop) {
    // Logo + institution name
    if (kop.logo_url) {
      const logoUrl = await getLogoSignedUrl(kop.logo_url);
      const logoBuffer = logoUrl ? await fetchImageAsArrayBuffer(logoUrl) : null;
      if (logoBuffer) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
            children: [
              new ImageRun({
                data: logoBuffer,
                transformation: { width: 60, height: 60 },
                type: "png",
              }),
            ],
          })
        );
      }
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
        children: [new TextRun({ text: kop.nama_instansi, bold: true, size: 28, font: "Arial" })],
      })
    );
    if (kop.nama_unit_kerja) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({ text: kop.nama_unit_kerja.toUpperCase(), bold: true, size: 24, font: "Arial" })],
        })
      );
    }
    const addrParts = [kop.alamat, kop.kota, kop.provinsi, kop.kode_pos].filter(Boolean);
    if (addrParts.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
          children: [new TextRun({ text: addrParts.join(", "), size: 18, font: "Arial" })],
        })
      );
    }
    const contactParts = [];
    if (kop.telepon) contactParts.push(`Telp: ${kop.telepon}`);
    if (kop.fax) contactParts.push(`Fax: ${kop.fax}`);
    if (kop.email) contactParts.push(`Email: ${kop.email}`);
    if (contactParts.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: contactParts.join("  |  "), size: 18, font: "Arial" })],
        })
      );
    }

    children.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
        spacing: { after: 200 },
      })
    );
  }

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 50 },
      children: [new TextRun({ text: "SURAT PERTANGGUNGJAWABAN (SPJ)", bold: true, size: 26, font: "Arial" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: `Nomor: ${kegiatan.nomor_spj}`, size: 22, font: "Arial" })],
    })
  );

  // Details as table
  const detailRows = [
    ["Nama Kegiatan", kegiatan.nama_kegiatan],
    ["Kode MAK", kegiatan.kode_mak || "-"],
    ["Tanggal", formatDateLong(kegiatan.tanggal_kegiatan)],
    ["Lokasi", kegiatan.lokasi || "-"],
    ["Jenis Belanja", jenisBelanjaLabel[kegiatan.jenis_belanja] || kegiatan.jenis_belanja],
  ];

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  } as const;

  const detailTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: detailRows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: noBorder,
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "Arial" })] })],
            }),
            new TableCell({
              borders: noBorder,
              children: [new Paragraph({ children: [new TextRun({ text: `: ${value}`, size: 22, font: "Arial" })] })],
            }),
          ],
        })
    ),
  });

  children.push(new Paragraph({ children: [] }));

  // Uraian
  const afterDetails: (Paragraph | Table)[] = [];
  if (kegiatan.uraian) {
    afterDetails.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "Uraian Kegiatan:", bold: true, size: 22, font: "Arial" })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: kegiatan.uraian, size: 22, font: "Arial" })],
      })
    );
  }

  // Financial table
  const finData: string[][] = [["Nilai Bruto", formatRp(kegiatan.nilai_bruto)]];
  if (kegiatan.pph_nominal > 0) finData.push([kegiatan.pph_jenis || "PPh", `-${formatRp(kegiatan.pph_nominal)}`]);
  if (kegiatan.ppn_nominal > 0) finData.push(["PPN", formatRp(kegiatan.ppn_nominal)]);
  finData.push(["Nilai Netto", formatRp(kegiatan.nilai_netto)]);

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  } as const;

  const finTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: thinBorder,
            shading: { fill: "29344A" },
            children: [new Paragraph({ children: [new TextRun({ text: "Keterangan", bold: true, size: 22, font: "Arial", color: "FFFFFF" })] })],
          }),
          new TableCell({
            borders: thinBorder,
            shading: { fill: "29344A" },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Jumlah", bold: true, size: 22, font: "Arial", color: "FFFFFF" })] })],
          }),
        ],
      }),
      ...finData.map(
        ([label, val], idx) =>
          new TableRow({
            children: [
              new TableCell({
                borders: thinBorder,
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: idx === finData.length - 1, size: 22, font: "Arial" })] })],
              }),
              new TableCell({
                borders: thinBorder,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: val, bold: idx === finData.length - 1, size: 22, font: "Arial" })] })],
              }),
            ],
          })
      ),
    ],
  });

  // Signatures
  const signers = [
    { title: "PPTK", nama: kegiatan.pptk_nama, nip: kegiatan.pptk_nip },
    { title: "Pejabat Pembuat Komitmen", nama: kegiatan.ppk_nama, nip: kegiatan.ppk_nip },
    { title: "Bendahara Pengeluaran", nama: kegiatan.bendahara_nama, nip: kegiatan.bendahara_nip },
  ].filter((s) => s.nama);

  const sigParagraphs: Paragraph[] = [new Paragraph({ spacing: { before: 600 }, children: [] })];

  const allSections: (Paragraph | Table)[] = [
    ...children,
    detailTable,
    ...afterDetails,
    finTable,
    ...sigParagraphs,
  ];

  if (signers.length > 0) {
    const sigTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: signers.map(
            (s) =>
              new TableCell({
                borders: noBorder,
                width: { size: Math.floor(100 / signers.length), type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.title, bold: true, size: 20, font: "Arial" })] }),
                  new Paragraph({ spacing: { before: 600 }, children: [] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.nama!, underline: {}, size: 20, font: "Arial" })] }),
                  ...(s.nip
                    ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `NIP. ${s.nip}`, size: 18, font: "Arial" })] })]
                    : []),
                ],
              })
          ),
        }),
      ],
    });
    allSections.push(sigTable);
  }

  const doc2 = new Document({
    sections: [{ children: allSections }],
  });

  const blob = await Packer.toBlob(doc2);
  saveAs(blob, `SPJ_${kegiatan.nomor_spj.replace(/\//g, "-")}.docx`);
}
