"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Users, GraduationCap, Phone, Trophy, SlidersHorizontal, RotateCcw } from "lucide-react";

/* ================================
   TYPE DATA HASIL NORMALISASI
================================ */
type PesertaType = {
  id: string;
  nama_pemain: string;
  nim?: string;
  tim?: {
    nama: string;
    jurusan?: string;
    angkatan?: string;
    nomor_hp?: string;
    acara?: {
      nama: string;
    } | null;
  } | null;
};

type TimRelation = {
  nama: string;
  jurusan?: string;
  angkatan?: string;
  nomor_hp?: string;
  acara?: { nama: string } | Array<{ nama: string }> | null;
};

type PesertaQueryRow = {
  id: string;
  nama_pemain: string;
  nim?: string | null;
  tim?: TimRelation | TimRelation[] | null;
};

export default function AdminPesertaPage() {
  const supabase = createClient();
  const [peserta, setPeserta] = useState<PesertaType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [jurusanFilter, setJurusanFilter] = useState("semua");
  const [angkatanFilter, setAngkatanFilter] = useState("semua");
  const [timFilter, setTimFilter] = useState("semua");
  const pageSize = 10;

  /* ================================
      LOAD DATA DARI SUPABASE
   ================================ */
  async function loadPeserta() {
    setLoading(true);

    const { data, error } = await supabase
      .from("anggota_tim")
      .select(`
        id,
        nama_pemain,
        nim,
        tim:tim_id (
          nama,
          jurusan,
          angkatan,
          nomor_hp,
          acara:acara_id (
            nama
          )
        )
      `)
      .order("nama_pemain");

    if (!error && data) {
      // NORMALISASI DATA (tim[] → tim object)
      const normalize = (data as unknown as PesertaQueryRow[]).map((row) => {
        const timObj = Array.isArray(row.tim) ? row.tim[0] : row.tim;

        return {
          id: row.id,
          nama_pemain: row.nama_pemain,
          nim: row.nim || null,
          tim: timObj
            ? {
                nama: timObj.nama,
                jurusan: timObj.jurusan,
                angkatan: timObj.angkatan,
                nomor_hp: timObj.nomor_hp,
                acara: Array.isArray(timObj.acara)
                  ? timObj.acara[0] || null
                  : timObj.acara || null,
              }
            : null,
        } as PesertaType;
      });

      setPeserta(normalize);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPeserta();
  }, []);

  const filtered = peserta.filter((p) => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch = [p.nama_pemain, p.nim, p.tim?.nama, p.tim?.jurusan, p.tim?.angkatan, p.tim?.acara?.nama]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase("id-ID").includes(keyword));
    return matchesSearch
      && (jurusanFilter === "semua" || p.tim?.jurusan === jurusanFilter)
      && (angkatanFilter === "semua" || p.tim?.angkatan === angkatanFilter)
      && (timFilter === "semua" || p.tim?.nama === timFilter);
  });
  const jurusanOptions = [...new Set(peserta.map((item) => item.tim?.jurusan).filter((value): value is string => Boolean(value)))].sort();
  const angkatanOptions = [...new Set(peserta.map((item) => item.tim?.angkatan).filter((value): value is string => Boolean(value)))].sort().reverse();
  const timOptions = [...new Set(peserta.map((item) => item.tim?.nama).filter((value): value is string => Boolean(value)))].sort();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilters = [search, jurusanFilter !== "semua", angkatanFilter !== "semua", timFilter !== "semua"].filter(Boolean).length;
  const resetFilters = () => {
    setSearch(""); setJurusanFilter("semua"); setAngkatanFilter("semua"); setTimFilter("semua"); setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Peserta Lomba</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kelola dan temukan peserta yang terdaftar dalam kompetisi.</p>
      </div>

      <Card className="overflow-hidden border-indigo-200/70 shadow-sm dark:border-indigo-900/70">
        <div className="flex flex-col gap-3 border-b bg-linear-to-r from-indigo-50 to-blue-50 px-5 py-4 dark:from-indigo-950/40 dark:to-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-600 p-2 text-white"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="font-bold">Filter Data Peserta</h2><p className="text-xs text-muted-foreground">Persempit daftar berdasarkan data akademik dan tim.</p></div></div>
          <div className="flex items-center gap-2">{activeFilters > 0 && <Badge>{activeFilters} filter aktif</Badge>}<Button variant="outline" size="sm" onClick={resetFilters} disabled={activeFilters === 0} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset</Button></div>
        </div>
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari peserta, NIM, tim, jurusan, atau acara..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9" />
          </div>
          <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5"><Users className="h-4 w-4" /> {filtered.length} peserta</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jurusan</Label><Select value={jurusanFilter} onValueChange={(value) => { setJurusanFilter(value); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Filter jurusan" /></SelectTrigger>
              <SelectContent><SelectItem value="semua">Semua Jurusan</SelectItem>{jurusanOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select></div>
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Angkatan</Label><Select value={angkatanFilter} onValueChange={(value) => { setAngkatanFilter(value); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Filter angkatan" /></SelectTrigger>
              <SelectContent><SelectItem value="semua">Semua Angkatan</SelectItem>{angkatanOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select></div>
            <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tim</Label><Select value={timFilter} onValueChange={(value) => { setTimFilter(value); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Filter tim" /></SelectTrigger>
              <SelectContent><SelectItem value="semua">Semua Tim</SelectItem>{timOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select></div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Daftar Peserta</CardTitle>
          <CardDescription>Informasi peserta beserta tim dan lomba yang diikuti.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="w-14">No</TableHead>
                  <TableHead>Nama Pemain</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Tim</TableHead>
                  <TableHead>Jurusan</TableHead>
                  <TableHead>Angkatan</TableHead>
                  <TableHead>Nomor HP</TableHead>
                  <TableHead>Acara</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length === 0 && <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">Tidak ada peserta yang sesuai dengan pencarian.</TableCell></TableRow>}
                {paginated.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{item.nama_pemain.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="font-semibold">{item.nama_pemain}</span></div></TableCell>
                    <TableCell><Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" />{item.nim ?? "-"}</Badge></TableCell>
                    <TableCell className="font-medium">{item.tim?.nama ?? "-"}</TableCell>
                    <TableCell>{item.tim?.jurusan ?? "-"}</TableCell>
                    <TableCell><Badge variant="secondary">{item.tim?.angkatan ?? "-"}</Badge></TableCell>
                    <TableCell><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{item.tim?.nomor_hp ?? "-"}</span></TableCell>
                    <TableCell><Badge className="gap-1"><Trophy className="h-3 w-3" />{item.tim?.acara?.nama ?? "-"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>

      {!loading && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-card p-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length} peserta</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2)).map((number) => <Button key={number} size="sm" variant={number === page ? "default" : "outline"} onClick={() => setPage(number)} className="min-w-9">{number}</Button>)}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</Button>
          </div>
        </div>
      )}
    </div>
  );
}
