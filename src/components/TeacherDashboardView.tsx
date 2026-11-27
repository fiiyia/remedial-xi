import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { COMPETENCIES } from '../lib/generator/types';
import {
  AVAILABLE_CLASSES,
  exportSummaryToCsv,
  getViolationLabel,
  summarizeStudents,
  type AttemptRecord,
  type ClassName,
  type RemedialSettings,
} from '../lib/storage/repository';

export type TeacherTab = 'monitoring' | 'integrity' | 'analytics' | 'settings';

interface TeacherDashboardViewProps {
  settings: RemedialSettings;
  attempts: AttemptRecord[];
  activeTab: TeacherTab;
  externalSearch?: string;
  onTabChange: (tab: TeacherTab) => void;
  onSaveSettings: (next: RemedialSettings) => void;
}

type ClassFilter = 'ALL' | ClassName;

export function TeacherDashboardView({
  settings,
  attempts,
  activeTab,
  externalSearch = '',
  onSaveSettings,
}: TeacherDashboardViewProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [classFilter, setClassFilter] = useState<ClassFilter>('ALL');
  const [draft, setDraft] = useState<RemedialSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const effectiveSearch = (externalSearch || localSearch).trim().toLowerCase();

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
    return summaryRows.filter((r) => {
      const matchClass = classFilter === 'ALL' || r.className === classFilter;
      const matchQuery =
        !effectiveSearch ||
        r.name.toLowerCase().includes(effectiveSearch) ||
        r.absen.toLowerCase().includes(effectiveSearch) ||
        r.className.toLowerCase().includes(effectiveSearch);
      return matchClass && matchQuery;
    });
  }, [summaryRows, effectiveSearch, classFilter]);

  const allViolationLogs = useMemo(() => {
    const logs: Array<{
      id: string;
      studentName: string;
      absen: string;
      className: ClassName;
      type: AttemptRecord['violations'][number]['type'];
      detail: string;
      timestamp: string;
      autoSubmitted: boolean;
    }> = [];

    for (const att of attempts) {
      if (att.mode !== 'exam') continue;
      if (classFilter !== 'ALL' && att.student.className !== classFilter) continue;
      const matchQuery =
        !effectiveSearch ||
        att.student.name.toLowerCase().includes(effectiveSearch) ||
        att.student.absen.toLowerCase().includes(effectiveSearch) ||
        att.student.className.toLowerCase().includes(effectiveSearch);
      if (!matchQuery) continue;

      for (let i = 0; i < (att.violations?.length ?? 0); i++) {
        const v = att.violations[i];
        logs.push({
          id: `${att.id}-v${i}`,
          studentName: att.student.name,
          absen: att.student.absen,
          className: att.student.className,
          type: v.type,
          detail: v.detail,
          timestamp: v.timestamp,
          autoSubmitted: Boolean(att.autoSubmittedByViolation),
        });
      }
    }

    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [attempts, classFilter, effectiveSearch]);

  const stats = useMemo(() => {
    const scopeRows =
      classFilter === 'ALL'
        ? summaryRows
        : summaryRows.filter((r) => r.className === classFilter);
    const totalStudents = scopeRows.length;
    const passedStudents = scopeRows.filter((r) => r.passed).length;
    const flaggedStudents = scopeRows.filter((r) => r.totalViolations > 0).length;
    const passRate =
      totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
    const avgScore =
      totalStudents > 0
        ? (scopeRows.reduce((acc, r) => acc + r.bestScore, 0) / totalStudents).toFixed(1)
        : '0.0';
    return { totalStudents, passedStudents, flaggedStudents, passRate, avgScore };
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
    onSaveSettings(draft);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Banner Guru Periwinkle */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#7372F3] via-[#7E7AF6] to-[#6866E6] px-5 py-5 text-white shadow-md shadow-[#6c6ce5]/15 sm:px-6">
        <div>
          <p className="text-xs font-semibold text-white/80">
            Dashboard Guru · SMA Don Bosco II
          </p>
          <h1 className="mt-0.5 text-lg font-extrabold sm:text-2xl">{settings.title}</h1>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 text-xs font-semibold text-white transition hover:bg-white/25"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>
            Unduh Rekap {classFilter === 'ALL' ? 'Semua' : classFilter} (.CSV)
          </span>
        </button>
      </section>

      {/* Pemisah Kelas XI-1 & XI-2 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setClassFilter('ALL')}
          className={`rounded-2xl border p-4 text-left transition ${
            classFilter === 'ALL'
              ? 'border-[#6c6ce5] bg-[#f3f2ff]'
              : 'border-[#eceef8] bg-white hover:border-[#cfd0f7]'
          }`}
        >
          <div className="text-xs font-semibold text-[#6c6ce5]">Gabungan</div>
          <div className="mt-0.5 text-lg font-extrabold text-[#262542]">Semua Kelas</div>
          <div className="mt-1 text-xs text-[#7c7f9d]">
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
                ? 'border-[#e88ea8] bg-[#fff2f6]'
                : 'border-[#eceef8] bg-white hover:border-[#f2c6d4]'
              : active
                ? 'border-[#5ac799] bg-[#eefbf5]'
                : 'border-[#eceef8] bg-white hover:border-[#bcead5]';
          return (
            <button
              key={cls}
              type="button"
              onClick={() => setClassFilter(cls)}
              className={`rounded-2xl border p-4 text-left transition ${accent}`}
            >
              <div className="text-xs font-semibold text-[#6c6ce5]">
                {cls === 'XI-1' ? 'Paket A' : 'Paket B'}
              </div>
              <div className="mt-0.5 text-lg font-extrabold text-[#262542]">Kelas {cls}</div>
              <div className="mt-1 text-xs text-[#7c7f9d]">
                {total} siswa · {passed} tuntas (KKM {settings.kkm})
              </div>
            </button>
          );
        })}
      </div>

      {/* KPI Ringkasan */}
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#8a8da8]">
            Peserta ({classFilter === 'ALL' ? 'XI-1 & XI-2' : classFilter})
          </dt>
          <dd className="mt-1 text-xl font-extrabold text-[#262542] sm:text-2xl">
            {stats.totalStudents} siswa
          </dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#28a870]">
            Ketuntasan (KKM {settings.kkm})
          </dt>
          <dd className="mt-1 text-xl font-extrabold text-[#28a870] sm:text-2xl">
            {stats.passRate}%{' '}
            <span className="text-xs font-medium text-[#8a8da8] sm:text-sm">
              ({stats.passedStudents}/{stats.totalStudents})
            </span>
          </dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#8a8da8]">Rata-rata Nilai</dt>
          <dd className="mt-1 text-xl font-extrabold text-[#262542] sm:text-2xl">
            {stats.avgScore}
          </dd>
        </div>
        <div className="soft-card rounded-2xl p-4">
          <dt className="text-xs font-medium text-[#d94657]">Deteksi Pelanggaran Layar</dt>
          <dd className="mt-1 text-xl font-extrabold text-[#d94657] sm:text-2xl">
            {stats.flaggedStudents}{' '}
            <span className="text-xs font-medium text-[#8a8da8] sm:text-sm">
              siswa ({allViolationLogs.length} log)
            </span>
          </dd>
        </div>
      </dl>

      {/* TAB 1: MONITORING SISWA */}
      {activeTab === 'monitoring' && (
        <section className="soft-card space-y-4 rounded-3xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-48 flex-1 sm:hidden">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9db8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari nama atau No. Absen..."
                className="h-10 w-full rounded-xl border border-[#eceef8] bg-[#fafbff] pl-9 pr-3 text-sm outline-none focus:border-[#6c6ce5]"
              />
            </div>
            <h2 className="text-sm font-bold text-[#262542]">
              Daftar Monitoring Siswa ({filteredRows.length})
            </h2>
            <span className="text-xs font-medium text-[#8a8da8]">
              Filter: {classFilter === 'ALL' ? 'Kelas XI-1 & XI-2' : `Kelas ${classFilter}`}
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="monitoring-table-caption"
            className="table-wrapper rounded-2xl border border-[#eceef8]"
          >
            <table className="monitoring-table text-sm">
              <caption id="monitoring-table-caption" className="sr-only">
                Daftar monitoring hasil ujian remedial dan deteksi layar siswa kelas XI-1 dan XI-2
              </caption>
              <thead className="bg-[#f6f7fd] text-xs uppercase tracking-wide text-[#7c7f9d]">
                <tr>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Nama Siswa
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    No. Absen
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Kelas
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Nilai Tertinggi
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Percobaan
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Deteksi Layar
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Waktu Selesai
                  </th>
                  <th scope="col" className="border-b border-[#eceef8] px-4 py-3 text-left">
                    Status KKM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4fb]">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[#8a8da8]">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={`${row.className}-${row.absen}`} className="hover:bg-[#fafbff]">
                      <th scope="row" className="px-4 py-3 font-semibold text-[#262542]">
                        {row.name}
                      </th>
                      <td className="font-mono-math px-4 py-3 font-semibold text-[#6c6ce5]">
                        {row.absen}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.className === 'XI-1'
                              ? 'bg-[#fff2f6] text-[#c75479]'
                              : 'bg-[#eefbf5] text-[#28a870]'
                          }`}
                        >
                          {row.className}
                        </span>
                      </td>
                      <td className="font-mono-math px-4 py-3 font-bold text-[#262542]">
                        {row.bestScore}
                      </td>
                      <td className="px-4 py-3 text-[#7c7f9d]">{row.attemptsCount}×</td>
                      <td className="px-4 py-3">
                        {row.totalViolations === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f9f1] px-2.5 py-0.5 text-xs font-semibold text-[#28a870]">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Aman (0)
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row.autoSubmittedByViolation
                                ? 'bg-[#ffeff1] text-[#d94657]'
                                : 'bg-[#fff6e0] text-[#b37400]'
                            }`}
                          >
                            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                            {row.totalViolations}×
                            {row.autoSubmittedByViolation ? ' Auto-Submit' : ' Peringatan'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#8a8da8]">
                        {new Date(row.lastSubmittedAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.passed
                              ? 'bg-[#e6f9f1] text-[#28a870]'
                              : 'bg-[#ffeff1] text-[#d94657]'
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

      {/* TAB 2: LOG DETEKSI LAYAR / ANTI-MENCONTEK */}
      {activeTab === 'integrity' && (
        <section className="soft-card space-y-4 rounded-3xl p-4 sm:p-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#262542]">
              <ShieldAlert className="h-5 w-5 text-[#d94657]" aria-hidden="true" />
              <span>
                Monitoring Deteksi Layar &amp; Anti-Mencontek (
                {classFilter === 'ALL' ? 'XI-1 & XI-2' : `Kelas ${classFilter}`})
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-[#8a8da8]">
              Mencatat otomatis setiap kali siswa berpindah tab, keluar jendela browser, keluar
              layar penuh, atau mencoba menyalin soal selama Mode Ujian Remedial.
            </p>
          </div>

          {allViolationLogs.length === 0 ? (
            <div className="rounded-2xl border border-[#bcead5] bg-[#eefbf5] p-6 text-center">
              <ShieldCheck className="mx-auto h-7 w-7 text-[#28a870]" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-[#28a870]">
                Tidak ada pelanggaran layar terdeteksi
              </p>
              <p className="mt-0.5 text-xs text-[#5c536d]">
                Seluruh peserta mengerjakan ujian remedial dengan tertib di layar ujian.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {allViolationLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#eceef8] bg-[#fafbff] p-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#262542]">{log.studentName}</span>
                      <span className="rounded-full bg-[#f3f2ff] px-2 py-0.5 text-[11px] font-semibold text-[#6c6ce5]">
                        {log.className} · Absen {log.absen}
                      </span>
                      <span className="rounded-full bg-[#ffeff1] px-2.5 py-0.5 text-[11px] font-bold text-[#d94657]">
                        {getViolationLabel(log.type)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c536d]">{log.detail}</p>
                  </div>
                  <div className="font-mono-math text-[11px] font-medium text-[#8a8da8]">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: ANALITIK BUTIR SOAL */}
      {activeTab === 'analytics' && (
        <section className="soft-card space-y-4 rounded-3xl p-4 sm:p-5">
          <div>
            <h2 className="text-base font-bold text-[#262542]">
              Analisis Penguasaan 6 Kompetensi Matriks Kelas XI (
              {classFilter === 'ALL' ? 'XI-1 & XI-2' : `Kelas ${classFilter}`})
            </h2>
            <p className="text-xs text-[#8a8da8]">
              Rata-rata persentase skor per kompetensi untuk mengidentifikasi materi tersulit.
            </p>
          </div>

          <div className="space-y-3">
            {itemAnalytics.map((item) => {
              const barColor =
                item.masteryPct >= settings.kkm
                  ? 'bg-[#34c78a]'
                  : item.masteryPct >= 55
                    ? 'bg-[#ffb84d]'
                    : 'bg-[#ff6b72]';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#eceef8] bg-[#fafbff] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#6c6ce5]">
                        Kompetensi {item.id} · {item.reference}
                      </span>
                      <h3 className="text-sm font-bold text-[#262542]">{item.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-math text-lg font-extrabold text-[#262542]">
                        {item.masteryPct}%
                      </div>
                      <div className="text-xs text-[#8a8da8]">
                        Benar penuh: {item.fullPct}% ({item.attemptsCount} percobaan)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#eceef8]">
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

      {/* TAB 4: PENGATURAN REMEDIAL */}
      {activeTab === 'settings' && (
        <section className="soft-card rounded-3xl p-5 sm:p-6">
          <form onSubmit={handleSaveSettingsSubmit} className="max-w-xl space-y-4">
            <div>
              <label htmlFor="set-title" className="block text-sm font-bold text-[#262542]">
                Judul Sesi Remedial
              </label>
              <input
                id="set-title"
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="form-control mt-1 h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="set-kkm" className="block text-sm font-bold text-[#262542]">
                  Nilai KKM (1–100)
                </label>
                <span className="mb-1 block text-xs text-[#8a8da8]">Default saat ini: 78</span>
                <input
                  id="set-kkm"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={draft.kkm}
                  onChange={(e) => setDraft({ ...draft, kkm: Number(e.target.value) })}
                  className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                />
              </div>

              <div>
                <label
                  htmlFor="set-duration"
                  className="block text-sm font-bold text-[#262542]"
                >
                  Durasi Ujian (menit)
                </label>
                <span className="mb-1 block text-xs text-[#8a8da8]">Default saat ini: 90 menit</span>
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
                  className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                />
              </div>

              <div>
                <label
                  htmlFor="set-attempts"
                  className="block text-sm font-bold text-[#262542]"
                >
                  Maksimal Percobaan Ujian
                </label>
                <span className="mb-1 block text-xs text-[#8a8da8]">Default: 3 percobaan</span>
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
                  className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                />
              </div>

              <div>
                <label
                  htmlFor="set-violations"
                  className="block text-sm font-bold text-[#262542]"
                >
                  Batas Pelanggaran Layar
                </label>
                <span className="mb-1 block text-xs text-[#8a8da8]">
                  Auto-submit jika tercapai (default: 3×)
                </span>
                <input
                  id="set-violations"
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={draft.maxViolations}
                  onChange={(e) =>
                    setDraft({ ...draft, maxViolations: Number(e.target.value) })
                  }
                  className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#eceef8] bg-[#fafbff] p-3.5">
              <input
                type="checkbox"
                checked={draft.requirePractice}
                onChange={(e) => setDraft({ ...draft, requirePractice: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-[#cfd0f7] text-[#6c6ce5] focus:ring-[#6c6ce5]"
              />
              <span className="text-sm text-[#5c536d]">
                <strong className="block text-[#262542]">
                  Wajibkan Mode Latihan sebelum Ujian Remedial
                </strong>
                Siswa harus mencoba minimal 1 soal di Mode Latihan (jawaban tidak harus benar)
                sebelum tombol Mulai Ujian terbuka.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6c6ce5] px-5 text-sm font-semibold text-white shadow-sm shadow-[#6c6ce5]/25 transition hover:bg-[#5a5ad6]"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>Simpan Pengaturan</span>
              </button>

              {savedNotice && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#28a870]">
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
