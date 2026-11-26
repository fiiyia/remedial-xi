import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  Save,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { COMPETENCIES } from '../lib/generator/types';
import {
  AVAILABLE_CLASSES,
  exportSummaryToCsv,
  summarizeStudents,
  type AttemptRecord,
  type ClassName,
  type RemedialSettings,
} from '../lib/storage/repository';

interface TeacherDashboardViewProps {
  settings: RemedialSettings;
  attempts: AttemptRecord[];
  onSaveSettings: (next: RemedialSettings) => void;
}

type ClassFilter = 'ALL' | ClassName;

export function TeacherDashboardView({
  settings,
  attempts,
  onSaveSettings,
}: TeacherDashboardViewProps) {
  const [tab, setTab] = useState<'monitoring' | 'analytics' | 'settings'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<ClassFilter>('ALL');
  const [draft, setDraft] = useState<RemedialSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const summaryRows = useMemo(
    () => summarizeStudents(attempts, settings.kkm),
    [attempts, settings.kkm]
  );

  const classCounts = useMemo(() => {
    const xi1 = summaryRows.filter((r) => r.className === 'XI-1');
    const xi2 = summaryRows.filter((r) => r.className === 'XI-2');
    return {
      all: summaryRows.length,
      'XI-1': xi1.length,
      'XI-1-passed': xi1.filter((r) => r.passed).length,
      'XI-2': xi2.length,
      'XI-2-passed': xi2.filter((r) => r.passed).length,
    };
  }, [summaryRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return summaryRows.filter((r) => {
      const matchClass = classFilter === 'ALL' || r.className === classFilter;
      const matchQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.absen.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q);
      return matchClass && matchQuery;
    });
  }, [summaryRows, searchQuery, classFilter]);

  const stats = useMemo(() => {
    const scopeRows =
      classFilter === 'ALL'
        ? summaryRows
        : summaryRows.filter((r) => r.className === classFilter);
    const totalStudents = scopeRows.length;
    const passedStudents = scopeRows.filter((r) => r.passed).length;
    const passRate =
      totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const avgScore =
      totalStudents > 0
        ? (scopeRows.reduce((acc, r) => acc + r.bestScore, 0) / totalStudents).toFixed(1)
        : '0.0';
    return { totalStudents, passedStudents, passRate, avgScore };
  }, [summaryRows, classFilter]);

  const itemAnalytics = useMemo(() => {
    const scopedAttempts =
      classFilter === 'ALL'
        ? attempts
        : attempts.filter((a) => a.student.className === classFilter);

    return COMPETENCIES.map((comp) => {
      let earnedSum = 0;
      let maxSum = 0;
      let fullCorrectCount = 0;
      let count = 0;

      for (const att of scopedAttempts) {
        if (att.mode !== 'exam') continue;
        const item = att.itemBreakdown.find((b) => b.competencyId === comp.id);
        if (!item) continue;
        earnedSum += item.earned;
        maxSum += item.maxPoints;
        if (item.isFullyCorrect) fullCorrectCount++;
        count++;
      }

      const masteryPct = maxSum > 0 ? Math.round((earnedSum / maxSum) * 100) : 0;
      const fullPct = count > 0 ? Math.round((fullCorrectCount / count) * 100) : 0;

      return {
        ...comp,
        attemptsCount: count,
        masteryPct,
        fullPct,
      };
    });
  }, [attempts, classFilter]);

  const hardestTopic = useMemo(() => {
    const withData = itemAnalytics.filter((a) => a.attemptsCount > 0);
    if (withData.length === 0) return null;
    return [...withData].sort((a, b) => a.masteryPct - b.masteryPct)[0];
  }, [itemAnalytics]);

  const handleExportCsv = () => {
    const csv = exportSummaryToCsv(filteredRows, settings.kkm);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const suffix = classFilter === 'ALL' ? 'semua-kelas' : classFilter.toLowerCase();
    link.download = `rekap-remedial-matriks-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSaveSettings({
      ...draft,
      accessCode: draft.accessCode.trim().toUpperCase(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:py-8">
      {/* Header & Ekspor */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Dashboard Guru Matematika (Admin)
          </p>
          <h2 className="mt-1 text-2xl font-bold text-violet-950">{settings.title}</h2>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>
            Unduh Rekap {classFilter === 'ALL' ? 'Semua' : classFilter} (.CSV)
          </span>
        </button>
      </div>

      {/* Pemisah Kelas XI-1 & XI-2 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setClassFilter('ALL')}
          className={`rounded-2xl border p-4 text-left transition ${
            classFilter === 'ALL'
              ? 'border-[#7a5ca8] bg-[#f4effa]'
              : 'border-[#ebe4f4] bg-white hover:border-[#cbbbe6]'
          }`}
        >
          <div className="text-xs font-semibold text-[#6d4c9e]">Gabungan</div>
          <div className="mt-0.5 text-lg font-extrabold text-[#2c243b]">Semua Kelas</div>
          <div className="mt-1 text-xs text-[#5c536d]">
            Total {classCounts.all} peserta remedial
          </div>
        </button>

        {AVAILABLE_CLASSES.map((cls) => {
          const active = classFilter === cls;
          const total = classCounts[cls];
          const passed = classCounts[`${cls}-passed`];
          const accent =
            cls === 'XI-1'
              ? active
                ? 'border-[#c47c96] bg-[#fdf2f6]'
                : 'border-[#ebe4f4] bg-white hover:border-[#e2bdd0]'
              : active
                ? 'border-[#5a9a80] bg-[#eef8f3]'
                : 'border-[#ebe4f4] bg-white hover:border-[#bfe0d0]';
          return (
            <button
              key={cls}
              type="button"
              onClick={() => setClassFilter(cls)}
              className={`rounded-2xl border p-4 text-left transition ${accent}`}
            >
              <div className="text-xs font-semibold text-[#6d4c9e]">
                {cls === 'XI-1' ? 'Paket A' : 'Paket B'}
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-[#2c243b]">Kelas {cls}</div>
              <div className="mt-1 text-xs text-[#5c536d]">
                {total} siswa · {passed} tuntas (KKM {settings.kkm})
              </div>
            </button>
          );
        })}
      </div>

      {/* KPI Ringkasan */}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#6f6680]">
            Peserta ({classFilter === 'ALL' ? 'XI-1 & XI-2' : classFilter})
          </dt>
          <dd className="mt-1 text-2xl font-extrabold text-[#2c243b]">
            {stats.totalStudents} siswa
          </dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#266b4d]">
            Ketuntasan (KKM {settings.kkm})
          </dt>
          <dd className="mt-1 text-2xl font-extrabold text-[#266b4d]">
            {stats.passRate}%{' '}
            <span className="text-sm font-medium text-[#6f6680]">
              ({stats.passedStudents}/{stats.totalStudents})
            </span>
          </dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#6f6680]">Rata-rata Nilai Tertinggi</dt>
          <dd className="mt-1 text-2xl font-extrabold text-[#2c243b]">{stats.avgScore}</dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#a33b56]">Topik Paling Sulit</dt>
          <dd className="mt-1 text-sm font-bold text-[#a33b56]">
            {hardestTopic
              ? `No. ${hardestTopic.id}: ${hardestTopic.shortTitle} (${hardestTopic.masteryPct}%)`
              : 'Belum ada data'}
          </dd>
        </div>
      </dl>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#ebe4f4] pb-3">
        <button
          type="button"
          onClick={() => setTab('monitoring')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === 'monitoring'
              ? 'bg-[#6d4c9e] text-white'
              : 'border border-[#e3d9f0] bg-white text-[#563f7a] hover:bg-[#f6f2fb]'
          }`}
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          <span>Monitoring Siswa</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('analytics')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === 'analytics'
              ? 'bg-[#6d4c9e] text-white'
              : 'border border-[#e3d9f0] bg-white text-[#563f7a] hover:bg-[#f6f2fb]'
          }`}
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          <span>Analitik Butir Soal</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('settings')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === 'settings'
              ? 'bg-[#6d4c9e] text-white'
              : 'border border-[#e3d9f0] bg-white text-[#563f7a] hover:bg-[#f6f2fb]'
          }`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          <span>Pengaturan Remedial</span>
        </button>
      </div>

      {/* TAB 1: MONITORING SISWA */}
      {tab === 'monitoring' && (
        <section className="space-y-4 rounded-3xl border border-violet-200/80 bg-white/90 p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau No. Absen siswa..."
                className="h-10 w-full rounded-xl border border-violet-200 bg-violet-50/30 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
              />
            </div>
            <span className="text-xs font-medium text-violet-700">
              Menampilkan {filteredRows.length} siswa (
              {classFilter === 'ALL' ? 'XI-1 & XI-2' : `Kelas ${classFilter}`})
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="monitoring-table-caption"
            className="table-wrapper rounded-2xl border border-violet-200/80"
          >
            <table className="monitoring-table text-sm">
              <caption id="monitoring-table-caption" className="sr-only">
                Daftar monitoring hasil ujian remedial siswa kelas XI-1 dan XI-2
              </caption>
              <thead className="bg-violet-50/90 text-xs uppercase tracking-wide text-violet-700">
                <tr>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Nama Siswa
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    No. Absen
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Kelas
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Nilai Tertinggi
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Percobaan
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Waktu Selesai
                  </th>
                  <th scope="col" className="border-b border-violet-200 px-4 py-3 text-left">
                    Status KKM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100/70">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={`${row.className}-${row.absen}`} className="hover:bg-violet-50/40">
                      <th scope="row" className="px-4 py-3 font-semibold text-violet-950">
                        {row.name}
                      </th>
                      <td className="font-mono-math px-4 py-3 font-semibold text-violet-700">
                        {row.absen}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.className === 'XI-1'
                              ? 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200'
                              : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                          }`}
                        >
                          {row.className}
                        </span>
                      </td>
                      <td className="font-mono-math px-4 py-3 font-bold text-violet-950">
                        {row.bestScore}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.attemptsCount}×</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(row.lastSubmittedAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.passed
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          }`}
                        >
                          {row.passed ? 'TUNTAS' : 'BELUM TUNTAS'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: ANALITIK BUTIR SOAL */}
      {tab === 'analytics' && (
        <section className="space-y-4 rounded-3xl border border-violet-200/80 bg-white/90 p-5 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#2c243b]">
              Analisis Penguasaan 6 Kompetensi Matriks Kelas XI (
              {classFilter === 'ALL' ? 'XI-1 & XI-2' : `Kelas ${classFilter}`})
            </h3>
            <p className="text-xs text-slate-600">
              Menampilkan rata-rata persentase skor per kompetensi untuk mengidentifikasi materi
              yang paling perlu dibahas ulang.
            </p>
          </div>

          <div className="space-y-3">
            {itemAnalytics.map((item) => {
              const barColor =
                item.masteryPct >= settings.kkm
                  ? 'bg-emerald-400'
                  : item.masteryPct >= 55
                    ? 'bg-amber-400'
                    : 'bg-rose-400';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-violet-600">
                        Kompetensi {item.id} • {item.reference}
                      </span>
                      <h4 className="text-sm font-bold text-violet-950">{item.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-math text-lg font-extrabold text-violet-950">
                        {item.masteryPct}%
                      </div>
                      <div className="text-xs text-slate-500">
                        Benar penuh: {item.fullPct}% ({item.attemptsCount} percobaan)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-violet-100">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${item.masteryPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: PENGATURAN REMEDIAL */}
      {tab === 'settings' && (
        <section className="rounded-3xl border border-violet-200/80 bg-white/90 p-6 shadow-2xs">
          <form onSubmit={handleSaveSettingsSubmit} className="max-w-xl space-y-4">
            <div>
              <label htmlFor="set-title" className="block text-sm font-semibold text-violet-950">
                Judul Sesi Remedial
              </label>
              <input
                id="set-title"
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="form-control mt-1 h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="set-code" className="block text-sm font-semibold text-violet-950">
                  Kode Akses Remedial
                </label>
                <span className="mb-1 block text-xs text-slate-500">
                  Dibagikan ke siswa XI-1 &amp; XI-2.
                </span>
                <input
                  id="set-code"
                  type="text"
                  required
                  minLength={4}
                  value={draft.accessCode}
                  onChange={(e) => setDraft({ ...draft, accessCode: e.target.value })}
                  className="form-control font-mono-math h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm uppercase outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label htmlFor="set-kkm" className="block text-sm font-semibold text-violet-950">
                  Nilai KKM (1–100)
                </label>
                <span className="mb-1 block text-xs text-slate-500">Default saat ini: 78</span>
                <input
                  id="set-kkm"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={draft.kkm}
                  onChange={(e) => setDraft({ ...draft, kkm: Number(e.target.value) })}
                  className="form-control h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label
                  htmlFor="set-duration"
                  className="block text-sm font-semibold text-violet-950"
                >
                  Durasi Ujian (menit)
                </label>
                <span className="mb-1 block text-xs text-slate-500">Default saat ini: 90 menit</span>
                <input
                  id="set-duration"
                  type="number"
                  min={5}
                  max={180}
                  required
                  value={draft.durationMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, durationMinutes: Number(e.target.value) })
                  }
                  className="form-control h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label
                  htmlFor="set-attempts"
                  className="block text-sm font-semibold text-violet-950"
                >
                  Maksimal Percobaan Ujian
                </label>
                <span className="mb-1 block text-xs text-slate-500">Default: 3 percobaan</span>
                <input
                  id="set-attempts"
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={draft.maxAttempts}
                  onChange={(e) =>
                    setDraft({ ...draft, maxAttempts: Number(e.target.value) })
                  }
                  className="form-control h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-3.5">
              <input
                type="checkbox"
                checked={draft.requirePractice}
                onChange={(e) => setDraft({ ...draft, requirePractice: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">
                <strong className="block text-violet-950">
                  Wajibkan Mode Latihan sebelum Ujian Remedial
                </strong>
                Siswa harus memeriksa minimal 1 soal di Mode Latihan sebelum tombol Mulai Ujian
                terbuka.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6d4c9e] px-5 text-sm font-semibold text-white transition hover:bg-[#5b3d8a]"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Simpan Pengaturan</span>
              </button>

              {savedNotice && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Tersimpan!
                </span>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
