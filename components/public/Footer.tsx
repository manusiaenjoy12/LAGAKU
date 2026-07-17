"use client";

import { Code2, GraduationCap, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const developers = [
  {
    name: "Aziz Febrian Arsanda",
    faculty: "Fakultas Keguruan dan Ilmu Pendidikan",
    studyProgram: "Pendidikan Teknik Informatika",
    role: "Pengembang LAGAKU",
    photo: "/aziz-febrian-arsanda.jpeg",
  },
];

const Footer = () => {
  const navigationItems = ["Beranda", "Turnamen", "Tim", "Jadwal"];

  return (
    <footer className="border-t py-10 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LAGAKU
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Turnamen Mahasiswa
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Platform turnamen mahasiswa untuk mengelola kompetisi secara
              mudah, adil, dan transparan.
            </p>
          </div>

          {/* Navigation Section */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm block py-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">
              Kontak
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li className="flex items-start py-1">
                <span className="font-medium mr-2 min-w-16">Email:</span>
                support@lagaku.id
              </li>
              <li className="flex items-start py-1">
                <span className="font-medium mr-2 min-w-16">Telepon:</span>
                (021) 1234-5678
              </li>
              <li className="flex items-start py-1">
                <span className="font-medium mr-2 min-w-16">Alamat:</span>
                Jakarta, Indonesia
              </li>
            </ul>
          </div>

          {/* Social Links / Additional Section (optional) */}
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">
              Ikuti Kami
            </h4>
            <div className="flex space-x-4">
              {[
                { name: "Facebook", icon: "fb" },
                { name: "Twitter", icon: "tw" },
                { name: "Instagram", icon: "ig" },
                { name: "LinkedIn", icon: "in" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="mb-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Dikembangkan Oleh</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mahasiswa yang merancang dan mengembangkan platform LAGAKU
            </p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
            {developers.map((developer) => (
              <article
                key={developer.name}
                className="flex w-full max-w-sm items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950/50"
              >
                <Avatar className="h-16 w-16 shrink-0 border-2 border-blue-200 dark:border-blue-900">
                  <AvatarImage src={developer.photo} alt={`Foto ${developer.name}`} className="object-cover" />
                  <AvatarFallback>{developer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h5 className="truncate font-bold text-gray-900 dark:text-white">{developer.name}</h5>
                  <p className="truncate text-sm font-medium text-blue-600 dark:text-blue-400">{developer.role}</p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {developer.studyProgram}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {developer.faculty}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} LAGAKU. Seluruh hak dilindungi. |
            Platform Turnamen Mahasiswa
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
