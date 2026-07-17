"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Save, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MatchData {
  id: string;
  acara_id: string;
  tim_a_id: string;
  tim_b_id: string;
  skor_tim_a: number | null;
  skor_tim_b: number | null;
  kategori_lomba: string | null;
  tim_a: { nama: string } | null;
  tim_b: { nama: string } | null;
}

export default function EditPertandinganPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: match, error: loadError } = await supabase
        .from("pertandingan")
        .select("*, tim_a:tim_a_id(nama), tim_b:tim_b_id(nama)")
        .eq("id", id)
        .single();

      if (loadError) setError(loadError.message);
      else setData(match as MatchData);
    };
    load();
  }, [id]);

  const changeScore = (field: "skor_tim_a" | "skor_tim_b", amount: number) => {
    setData((current) => current ? {
      ...current,
      [field]: Math.max(0, (current[field] ?? 0) + amount),
    } : current);
  };

  const save = async () => {
    if (!data) return;
    if (data.skor_tim_a === null || data.skor_tim_b === null) {
      setError("Poin kedua tim wajib diisi.");
      return;
    }
    if (data.skor_tim_a === data.skor_tim_b) {
      setError("Pertandingan sistem gugur tidak boleh berakhir seri.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const pemenang = data.skor_tim_a > data.skor_tim_b ? data.tim_a_id : data.tim_b_id;
    const { error: saveError } = await supabase
      .from("pertandingan")
      .update({
        skor_tim_a: data.skor_tim_a,
        skor_tim_b: data.skor_tim_b,
        kategori_lomba: data.kategori_lomba?.trim() || "Umum",
        status: "selesai",
        pemenang_id: pemenang,
      })
      .eq("id", id);

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }
    router.push(`/admin/pertandingan/detail/${data.acara_id}`);
    router.refresh();
  };

  if (!data) return <div className="p-8 text-center text-muted-foreground">Memuat pertandingan...</div>;

  const renderScoreControl = (team: string, field: "skor_tim_a" | "skor_tim_b") => (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40 pb-3">
        <CardTitle className="truncate text-center text-base">{team}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-3 p-5">
        <Button variant="outline" size="icon" onClick={() => changeScore(field, -1)} aria-label={`Kurangi poin ${team}`}>
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={0}
          value={data[field] ?? 0}
          onChange={(e) => setData({ ...data, [field]: Math.max(0, Number(e.target.value)) })}
          className="h-16 w-24 text-center text-3xl font-bold tabular-nums"
        />
        <Button variant="outline" size="icon" onClick={() => changeScore(field, 1)} aria-label={`Tambah poin ${team}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Trophy className="h-6 w-6 text-amber-500" /> Input Poin Pertandingan</h1>
        <p className="mt-1 text-muted-foreground">Masukkan hasil akhir dan sistem akan menentukan pemenang.</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid gap-4 md:grid-cols-2">
        {renderScoreControl(data.tim_a?.nama || "Tim A", "skor_tim_a")}
        {renderScoreControl(data.tim_b?.nama || "Tim B", "skor_tim_b")}
      </div>

      <div className="space-y-2">
        <Label>Kategori Lomba</Label>
        <Input value={data.kategori_lomba || ""} onChange={(e) => setData({ ...data, kategori_lomba: e.target.value })} placeholder="Contoh: Futsal Putra" />
      </div>

      <Button onClick={save} disabled={loading} className="h-12 w-full gap-2 text-base">
        <Save className="h-4 w-4" /> {loading ? "Menyimpan..." : "Simpan Poin & Tentukan Pemenang"}
      </Button>
    </div>
  );
}
