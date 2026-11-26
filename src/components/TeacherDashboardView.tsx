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
  exportSummaryToCsv,
  summarizeStudents,
  type AttemptRecord,
  type RemedialSettings,
} from '../lib/storage/repository';

interface TeacherDashboardViewProps {
  settings: RemedialSettings;
  attempts: AttemptRecord[];
  onSaveSettings: (next: RemedialSettings) => void;
}

export function TeacherDashboardView({
  settings,
  attempts,
  onSaveSettings,
}: TeacherDashboardViewProps) {
  const [tab, setTab] = useState<'monitoring' | 'analytics' | 'settings'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [draft, setDraft] = useState<RemedialSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const summaryRows = useMemo(
    () => summarizeStudents(attempts, settings.kkm),
    [attempts, settings.kkm]
  );

  const classes = useMemo(() => {
    const set = new Set(summaryRows.map((r) => r.className));
    return ['ALL', ...[...set].sort()];
  }, [summaryRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return summaryRows.filter((r) => {
      const matchClass = classFilter === 'ALL' || r.className === classFilter;
      const matchQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.nis.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q);
      return matchClass && matchQuery;
    });
  }, [summaryRows, searchQuery, classFilter]);

  const stats = useMemo(() => {
    const totalStudents = summaryRows.length;
    const passedStudents = summaryRows.filter((r) => r.passed).length;
    const passRate =
      totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const avgScore =
      totalStudents > 0
        ? (
            summaryRows.reduce((acc, r) => acc + r.bestScore, 0) / totalStudents
          ).toFixed(1)
        : '0.0';
    return { totalStudents, passedStudents, passRate, avgScore };
  }, [summaryRows]);

  const itemAnalytics = useMemo(() => {
    return COMPETENCIES.map((comp) => {
      let earnedSum = 0;
      let maxSum = 0;
      let fullCorrectCount = 0;
      let count = 0;

      for (const att of attempts) {
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
  }, [attempts]);

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
    link.download = `rekap-remedial-matriks-${new Date().toISOString().slice(0, 10)}.csv`;
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
      {/* Header & KPI */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Dashboard Guru Matematika (Admin)
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{settings.title}</h2>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Unduh Rekap (.CSV)</span>
        </button>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <dt className="text-xs font-medium text-slate-500">Siswa Mengikuti Remedial</dt>
          <dd className="mt-1 text-2xl font-extrabold text-slate-900">
            {stats.totalStudents} siswa
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <dt className="text-xs font-medium text-slate-500">
            Tingkat Ketuntasan (KKM {settings.kkm})
          </dt>
          <dd className="mt-1 text-2xl font-extrabold text-emerald-700">
            {stats.passRate}%{' '}
            <span className="text-sm font-medium text-slate-500">
              ({stats.passedStudents}/{stats.totalStudents})
            </span>
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <dt className="text-xs font-medium text-slate-500">Rata-rata Nilai Tertinggi</dt>
          <dd className="mt-1 text-2xl font-extrabold text-slate-900">{stats.avgScore}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <dt className="text-xs font-medium text-slate-500">Topik Paling Sulit</dt>
          <dd className="mt-1 text-sm font-bold text-rose-700">
            {hardestTopic
              ? `No. ${hardestTopic.id}: ${hardestTopic.shortTitle} (${hardestTopic.masteryPct}%)`
              : 'Belum ada data'}
          </dd>
        </div>
      </dl>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setTab('monitoring')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === 'monitoring'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
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
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
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
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          <span>Pengaturan Remedial</span>
        </button>
      </div>

      {/* TAB 1: MONITORING SISWA */}
      {tab === 'monitoring' && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIS siswa..."
                className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="class-filter" className="text-xs font-semibold text-slate-600">
                Kelas:
              </label>
              <select
                id="class-filter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'Semua Kelas' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="monitoring-table-caption"
            className="table-wrapper rounded-xl border border-slate-200"
          >
            <table className="monitoring-table text-sm">
              <caption
                id="monitoring-table-caption"
                className="sr-only"
              >
                Daftar monitoring hasil ujian remedial siswa kelas XI
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Nama Siswa
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    NIS
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Kelas
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Nilai Tertinggi
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Percobaan
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Waktu Selesai
                  </th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-3 text-left">
                    Status KKM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={`${row.nis}-${row.className}`} className="hover:bg-slate-50/70">
                      <th scope="row" className="px-4 py-3 font-semibold text-slate-900">
                        {row.name}
                      </th>
                      <td className="font-mono-math px-4 py-3 text-slate-600">{row.nis}</td>
                      <td className="px-4 py-3 text-slate-700">{row.className}</td>
                      <td className="font-mono-math px-4 py-3 font-bold text-slate-900">
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
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analisis Penguasaan 6 Kompetensi PH XI.2
            </h3>
            <p className="text-xs text-slate-600">
              Menampilkan rata-rata persentase skor per kompetensi dari seluruh percobaan ujian
              remedial untuk mengidentifikasi materi yang paling perlu dibahas ulang di kelas.
            </p>
          </div>

          <div className="space-y-3">
            {itemAnalytics.map((item) => {
              const barColor =
                item.masteryPct >= 75
                  ? 'bg-emerald-500'
                  : item.masteryPct >= 55
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600">
                        Kompetensi {item.id} • {item.reference}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-math text-lg font-extrabold text-slate-900">
                        {item.masteryPct}%
                      </div>
                      <div className="text-xs text-slate-500">
                        Benar penuh: {item.fullPct}% ({item.attemptsCount} percobaan)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleSaveSettingsSubmit} className="max-w-xl space-y-4">
            <div>
              <label htmlFor="set-title" className="block text-sm font-semibold text-slate-800">
                Judul Sesi Remedial
              </label>
              <input
                id="set-title"
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="form-control mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="set-code" className="block text-sm font-semibold text-slate-800">
                  Kode Akses Remedial
                </label>
                <span className="mb-1 block text-xs text-slate-500">
                  Dibagikan ke siswa untuk masuk.
                </span>
                <input
                  id="set-code"
                  type="text"
                  required
                  minLength={4}
                  value={draft.accessCode}
                  onChange={(e) => setDraft({ ...draft, accessCode: e.target.value })}
                  className="form-control font-mono-math h-11 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label htmlFor="set-kkm" className="block text-sm font-semibold text-slate-800">
                  Nilai KKM (1–100)
                </label>
                <span className="mb-1 block text-xs text-slate-500">Default sekolah: 75</span>
                <input
                  id="set-kkm"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={draft.kkm}
                  onChange={(e) => setDraft({ ...draft, kkm: Number(e.target.value) })}
                  className="form-control h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label
                  htmlFor="set-duration"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Durasi Ujian (menit)
                </label>
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
                  className="form-control mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label
                  htmlFor="set-attempts"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Maksimal Percobaan Ujian
                </label>
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
                  className="form-control mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <input
                type="checkbox"
                checked={draft.requirePractice}
                onChange={(e) => setDraft({ ...draft, requirePractice: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">
                <strong className="block text-slate-900">
                  Wajibkan Mode Latihan sebelum Ujian Remedial
                </strong>
                Siswa harus memeriksa minimal 1 soal di Mode Latihan sebelum tombol Mulai Ujian
                terbuka.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
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
