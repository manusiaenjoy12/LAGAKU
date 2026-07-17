"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudentProfile {
  nama: string;
  nim: string | null;
  fakultas: string | null;
  program_studi: string | null;
  peran: string;
}

export function StudentIdentityCard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("pengguna")
        .select("nama, nim, fakultas, program_studi, peran")
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (data?.peran === "mahasiswa") setProfile(data);
    };
    load();
  }, []);

  if (!profile) return null;

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-900 dark:from-blue-950/40 dark:to-indigo-950/30">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-600 p-3 text-white"><GraduationCap className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Identitas Mahasiswa</p>
            <h2 className="text-lg font-bold">{profile.nama}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>NIM: {profile.nim || "Belum dilengkapi"}</span>
              <span>{profile.fakultas || "Fakultas belum diisi"}</span>
              <span>{profile.program_studi || "Program studi belum diisi"}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild className="gap-2"><Link href="/profile"><UserRound className="h-4 w-4" /> Lengkapi Profil</Link></Button>
      </CardContent>
    </Card>
  );
}
