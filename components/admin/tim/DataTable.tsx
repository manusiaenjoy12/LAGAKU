"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Eye, Pencil, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Tim {
  id: string;
  nama: string;
  jurusan?: string;
  angkatan?: string;
  nomor_hp?: string;
  jumlah_pemain: number;  // dari anggota_tim
  acara_nama?: string;    // dari relasi acara_id → acara.nama
  acara_tanggal?: string;
  dibuat_pada: string;
}

interface TimTableProps {
  data: Tim[];
  onDelete?: (tim: Tim) => void;
  onDetail?: (tim: Tim) => void;
  onEdit?: (tim: Tim) => void;
  startIndex?: number;
}

export default function TimTable({ data, onDelete, onDetail, onEdit, startIndex = 0 }: TimTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="overflow-x-auto"><Table>
      <TableHeader>
        <TableRow className="bg-muted/60 hover:bg-muted/60">
          <TableHead>No</TableHead>
          <TableHead>Nama Tim</TableHead>
          <TableHead>Acara yang Diikuti</TableHead>
          <TableHead>Jurusan</TableHead>
          <TableHead>Angkatan</TableHead>
          <TableHead>Nomor HP</TableHead>
          <TableHead>Jumlah Pemain</TableHead>
          <TableHead>Dibuat Pada</TableHead>
          <TableHead className="text-center">Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-6 text-gray-500">
              Tidak ada data tim.
            </TableCell>
          </TableRow>
        )}

        {data.map((tim, idx) => (
          <TableRow key={tim.id}>
            <TableCell className="text-muted-foreground">{startIndex + idx + 1}</TableCell>

            <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{tim.nama.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="font-semibold">{tim.nama}</span></div></TableCell>

            {/* ACARA NAMA */}
            <TableCell><div className="space-y-1.5"><Badge variant="secondary">{tim.acara_nama || "-"}</Badge>{tim.acara_tanggal && <p className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{new Date(tim.acara_tanggal).toLocaleDateString("id-ID")}</p>}</div></TableCell>

            <TableCell>{tim.jurusan || "-"}</TableCell>

            <TableCell>{tim.angkatan || "-"}</TableCell>

            <TableCell>{tim.nomor_hp || "-"}</TableCell>

            {/* JUMLAH PEMAIN */}
            <TableCell><span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground" />{tim.jumlah_pemain}</span></TableCell>

            <TableCell>{new Date(tim.dibuat_pada).toLocaleString()}</TableCell>

            <TableCell>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => onDetail?.(tim)} className="gap-1">
                  <Eye className="h-3.5 w-3.5" /> Detail
                </Button>

                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(tim)} className="gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete?.(tim)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table></div></div>
  );
}
