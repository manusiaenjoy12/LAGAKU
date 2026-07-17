"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import TimTable, { Tim } from "@/components/admin/tim/DataTable";
import { toast } from "sonner";
import DetailAnggotaModal from "@/components/admin/tim/DetailDialogAnggota";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface TimQueryRow {
  id: string;
  nama: string;
  jurusan: string | null;
  angkatan: string | null;
  nomor_hp: string | null;
  dibuat_pada: string;
  acara: { id: string; nama: string; tanggal_mulai_pertandingan: string | null } | Array<{ id: string; nama: string; tanggal_mulai_pertandingan: string | null }> | null;
  anggota_tim: Array<{ count: number }> | null;
}

export default function TimPage() {
  const router = useRouter();
  const supabase = createClient();

  const [timList, setTimList] = useState<Tim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimId, setSelectedTimId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [acaraFilter, setAcaraFilter] = useState("semua");
  const [jurusanFilter, setJurusanFilter] = useState("semua");
  const [tanggalFilter, setTanggalFilter] = useState("");
  const pageSize = 10;

  const filteredTim = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");
    return timList.filter((tim) => {
      const matchesSearch = [tim.nama, tim.acara_nama, tim.jurusan, tim.angkatan, tim.nomor_hp]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("id-ID").includes(keyword));
      return matchesSearch
        && (acaraFilter === "semua" || tim.acara_nama === acaraFilter)
        && (jurusanFilter === "semua" || tim.jurusan === jurusanFilter)
        && (!tanggalFilter || tim.acara_tanggal?.slice(0, 10) === tanggalFilter);
    });
  }, [acaraFilter, jurusanFilter, search, tanggalFilter, timList]);
  const acaraOptions = [...new Set(timList.map((tim) => tim.acara_nama).filter((value): value is string => Boolean(value && value !== "-")))].sort();
  const jurusanOptions = [...new Set(timList.map((tim) => tim.jurusan).filter((value): value is string => Boolean(value)))].sort();
  const totalPages = Math.max(1, Math.ceil(filteredTim.length / pageSize));
  const paginatedTim = filteredTim.slice((page - 1) * pageSize, page * pageSize);
  const activeFilters = [search, acaraFilter !== "semua", jurusanFilter !== "semua", tanggalFilter].filter(Boolean).length;
  const resetFilters = () => {
    setSearch(""); setAcaraFilter("semua"); setJurusanFilter("semua"); setTanggalFilter(""); setPage(1);
  };

  // ================================================
  // LOAD DATA TIM + JUMLAH ANGGOTA + ACARA
  // ================================================
  const loadTim = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tim")
      .select(
        `
        id,
        nama,
        jurusan,
        angkatan,
        nomor_hp,
        dibuat_pada,
        acara:acara_id (
          id,
          nama,
          tanggal_mulai_pertandingan
        ),
        anggota_tim(count)
      `,
      )
      .order("dibuat_pada", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const formatted: Tim[] = (data as unknown as TimQueryRow[]).map((item) => {
      const acara = Array.isArray(item.acara) ? item.acara[0] : item.acara;
      return {
        id: item.id,
        nama: item.nama,
        jurusan: item.jurusan || undefined,
        angkatan: item.angkatan || undefined,
        nomor_hp: item.nomor_hp || undefined,
        dibuat_pada: item.dibuat_pada,
        jumlah_pemain: item.anggota_tim?.[0]?.count || 0,
        acara_nama: acara?.nama || "-",
        acara_tanggal: acara?.tanggal_mulai_pertandingan || undefined,
      };
    });

    setTimList(formatted);
    setLoading(false);
  };

  useEffect(() => {
    loadTim();
  }, []);

  // ================================================
  // HANDLE DELETE WITH SWEETALERT
  // ================================================
  const handleDelete = async (tim: Tim) => {
    const result = await Swal.fire({
      title: 'Hapus Tim?',
      html: `
        <div class="text-left">
          <p class="mb-3">Apakah Anda yakin ingin menghapus tim:</p>
          <div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
            <p class="font-semibold text-lg text-red-700 mb-2">${tim.nama}</p>
            <div class="space-y-1 text-sm text-gray-600">
              <p><span class="font-medium">Acara:</span> ${tim.acara_nama}</p>
              <p><span class="font-medium">Jumlah Anggota:</span> ${tim.jumlah_pemain} orang</p>
              ${tim.jurusan ? `<p><span class="font-medium">Jurusan:</span> ${tim.jurusan}</p>` : ''}
              ${tim.angkatan ? `<p><span class="font-medium">Angkatan:</span> ${tim.angkatan}</p>` : ''}
            </div>
          </div>
          <p class="text-sm text-red-600 font-medium">⚠️ Peringatan: Semua anggota tim juga akan ikut terhapus!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Tim',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-5 py-2 rounded',
        cancelButton: 'px-5 py-2 rounded'
      }
    });

    if (!result.isConfirmed) return;

    // Tampilkan loading
    Swal.fire({
      title: 'Menghapus...',
      text: 'Sedang menghapus data tim',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-lg'
      }
    });

    const { error } = await supabase.from("tim").delete().eq("id", tim.id);

    Swal.close();

    if (error) {
      Swal.fire({
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan saat menghapus tim',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'rounded-lg'
        }
      });
    } else {
      Swal.fire({
        title: 'Berhasil!',
        html: `
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Tim Berhasil Dihapus</h3>
            <p class="text-gray-600">Tim "${tim.nama}" telah dihapus dari sistem.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg'
        }
      });
      loadTim();
    }
  };

  const handleDetail = (tim: Tim) => {
    setSelectedTimId(tim.id);
  };

  // ================================================
  // RENDER PAGE
  // ================================================
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Data Tim</h1>
        <Link href="/admin/tim/tambah">
          <Button>Tambah Tim</Button>
        </Link>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-blue-200/70 bg-card shadow-sm dark:border-blue-900/70">
        <div className="flex flex-col gap-3 border-b bg-linear-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-950/40 dark:to-cyan-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-600 p-2 text-white"><SlidersHorizontal className="h-5 w-5" /></div><div><h2 className="font-bold">Filter Data Tim</h2><p className="text-xs text-muted-foreground">Cari tim berdasarkan acara, jurusan, dan tanggal.</p></div></div>
          <div className="flex items-center gap-2">{activeFilters > 0 && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">{activeFilters} filter aktif</span>}<Button variant="outline" size="sm" onClick={resetFilters} disabled={activeFilters === 0} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset</Button></div>
        </div>
        <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Cari nama tim, acara, jurusan, angkatan..."
              className="pl-9 pr-9"
              aria-label="Cari tim"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            Menampilkan {filteredTim.length} dari {timList.length} tim
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acara yang Diikuti</Label><Select value={acaraFilter} onValueChange={(value) => { setAcaraFilter(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Acara yang diikuti" /></SelectTrigger>
            <SelectContent><SelectItem value="semua">Semua Acara</SelectItem>{acaraOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select></div>
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jurusan</Label><Select value={jurusanFilter} onValueChange={(value) => { setJurusanFilter(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Filter jurusan" /></SelectTrigger>
            <SelectContent><SelectItem value="semua">Semua Jurusan</SelectItem>{jurusanOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select></div>
          <div className="space-y-2"><Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tanggal Acara</Label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="date" value={tanggalFilter} onChange={(event) => { setTanggalFilter(event.target.value); setPage(1); }} aria-label="Filter tanggal acara" className="pl-9" /></div></div>
        </div>
        </div>
      </div>

      {/* LOADING SKELETON */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <TimTable
          data={paginatedTim}
          startIndex={(page - 1) * pageSize}
          onDelete={handleDelete}
          onDetail={handleDetail}
          onEdit={(tim) => router.push(`/admin/tim/edit/${tim.id}`)}
        />
      )}

      {!loading && filteredTim.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border bg-card p-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2)).map((number) => (
              <Button key={number} size="sm" variant={number === page ? "default" : "outline"} onClick={() => setPage(number)} className="min-w-9">{number}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</Button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTimId && (
        <DetailAnggotaModal
          timId={selectedTimId}
          onClose={() => setSelectedTimId(null)}
        />
      )}
    </div>
  );
}
