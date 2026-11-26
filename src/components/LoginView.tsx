import { useState } from 'react';
import { BookOpen, GraduationCap, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  formatAbsen,
  type ClassName,
  type RemedialSettings,
  type StudentProfile,
} from '../lib/storage/repository';

interface LoginViewProps {
  settings: RemedialSettings;
  onStudentLogin: (student: StudentProfile) => void;
  onTeacherLogin: () => void;
}

export function LoginView({ settings, onStudentLogin, onTeacherLogin }: LoginViewProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [absen, setAbsen] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState<ClassName>('XI-1');
  const [accessCode, setAccessCode] = useState('');
  const [teacherPin, setTeacherPin] = useState('');
  const [formError, setFormError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const absenNum = Number.parseInt(absen, 10);
    if (Number.isNaN(absenNum) || absenNum < 1 || absenNum > 45) {
      setFormError('No. Absen harus berupa angka antara 1 sampai 45.');
      return;
    }

    if (accessCode.trim().toUpperCase() !== settings.accessCode.trim().toUpperCase()) {
      setFormError(
        `Kode remedial tidak cocok. Pastikan sesuai kode dari guru (demo: ${settings.accessCode}).`
      );
      return;
    }

    onStudentLogin({
      absen: formatAbsen(absen),
      name: name.trim(),
      className,
    });
  };

  const handleTeacherSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (teacherPin.trim() !== settings.teacherPin) {
      setFormError(`PIN Guru salah (demo: ${settings.teacherPin}).`);
      return;
    }

    onTeacherLogin();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Panel Informasi */}
        <div className="space-y-5 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/80 px-3.5 py-1.5 text-xs font-semibold text-violet-800 shadow-2xs">
            <BookOpen className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
            <span>Matematika Tingkat Lanjut • Kelas XI-1 &amp; XI-2</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-violet-950 sm:text-4xl">
            Web Remedial Matriks{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              PH XI.2
            </span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Platform latihan mandiri dan ujian remedial interaktif dengan generator angka acak
            eksak, input matriks khusus (<span className="font-mono-math text-violet-700">2×2</span>{' '}
            &amp; <span className="font-mono-math text-violet-700">3×3</span>), petunjuk bertahap,
            serta penilaian otomatis instan.
          </p>

          <dl className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl border border-violet-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs">
              <dt className="text-xs font-medium text-violet-600">KKM Ketuntasan</dt>
              <dd className="mt-1 text-2xl font-extrabold text-violet-950">{settings.kkm}</dd>
            </div>
            <div className="rounded-2xl border border-pink-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs">
              <dt className="text-xs font-medium text-pink-600">Durasi Ujian</dt>
              <dd className="mt-1 text-2xl font-extrabold text-violet-950">
                {settings.durationMinutes} menit
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs">
              <dt className="text-xs font-medium text-emerald-700">Batas Percobaan</dt>
              <dd className="mt-1 text-2xl font-extrabold text-violet-950">
                {settings.maxAttempts}×
              </dd>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs">
              <dt className="text-xs font-medium text-amber-700">Kompetensi</dt>
              <dd className="mt-1 text-2xl font-extrabold text-violet-950">6 Topik PH</dd>
            </div>
          </dl>
        </div>

        {/* Kartu Login */}
        <div className="rounded-3xl border border-violet-200/80 bg-white/90 p-6 shadow-lg shadow-violet-200/40 backdrop-blur sm:p-7 lg:col-span-6">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-violet-100/70 p-1.5">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                role === 'student'
                  ? 'bg-white text-violet-800 shadow-xs'
                  : 'text-violet-700/70 hover:text-violet-900'
              }`}
            >
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              <span>Masuk Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'bg-white text-violet-800 shadow-xs'
                  : 'text-violet-700/70 hover:text-violet-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Admin Guru</span>
            </button>
          </div>

          {role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {/* Pilih Kelas: XI-1 atau XI-2 */}
              <div>
                <span className="block text-sm font-semibold text-violet-950">Pilih Kelas</span>
                <span className="mb-2 block text-xs text-slate-500">
                  Pilih kelas asal kamu sebelum mengisi No. Absen.
                </span>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pilih Kelas">
                  {AVAILABLE_CLASSES.map((cls) => {
                    const selected = className === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setClassName(cls)}
                        className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
                          selected
                            ? 'border-violet-500 bg-violet-100/80 text-violet-900 ring-2 ring-violet-300/70'
                            : 'border-violet-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/50'
                        }`}
                      >
                        <Sparkles
                          className={`h-4 w-4 ${selected ? 'text-violet-600' : 'text-slate-400'}`}
                          aria-hidden="true"
                        />
                        <span>Kelas {cls}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="student-absen"
                    className="block text-sm font-semibold text-violet-950"
                  >
                    No. Absen
                  </label>
                  <span id="absen-hint" className="mb-1 block text-xs text-slate-500">
                    Angka 1–45
                  </span>
                  <input
                    id="student-absen"
                    name="absen"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={45}
                    required
                    aria-describedby="absen-hint"
                    aria-invalid="false"
                    value={absen}
                    onChange={(e) => setAbsen(e.target.value)}
                    placeholder="Contoh: 12"
                    className="form-control font-mono-math h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">⚠️</span> Isi angka 1–45.
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-semibold text-violet-950"
                  >
                    Nama Lengkap
                  </label>
                  <span id="name-hint" className="mb-1 block text-xs text-slate-500">
                    Sesuai daftar hadir kelas {className}.
                  </span>
                  <input
                    id="student-name"
                    name="name"
                    type="text"
                    required
                    minLength={3}
                    autoComplete="name"
                    aria-describedby="name-hint"
                    aria-invalid="false"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nabila Zahra"
                    className="form-control h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">⚠️</span> Minimal 3 karakter.
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="access-code"
                  className="block text-sm font-semibold text-violet-950"
                >
                  Kode Remedial
                </label>
                <span id="code-hint" className="mb-1 block text-xs text-slate-500">
                  Demo kode:{' '}
                  <code className="font-mono-math font-semibold text-violet-700">
                    {settings.accessCode}
                  </code>
                </span>
                <input
                  id="access-code"
                  name="accessCode"
                  type="text"
                  required
                  aria-describedby="code-hint"
                  aria-invalid="false"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder={settings.accessCode}
                  className="form-control font-mono-math h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm uppercase text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">⚠️</span> Kode remedial wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-300/60 transition hover:from-violet-700 hover:to-fuchsia-600"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>Masuk ke Beranda Remedial</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="teacher-pin"
                  className="block text-sm font-semibold text-violet-950"
                >
                  PIN Admin Guru
                </label>
                <span id="pin-hint" className="mb-1 block text-xs text-slate-500">
                  Demo PIN default:{' '}
                  <code className="font-mono-math font-semibold text-violet-700">
                    {settings.teacherPin}
                  </code>
                </span>
                <input
                  id="teacher-pin"
                  name="teacherPin"
                  type="password"
                  required
                  aria-describedby="pin-hint"
                  aria-invalid="false"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value)}
                  placeholder="Masukkan PIN Guru"
                  className="form-control h-11 w-full rounded-xl border border-violet-200 bg-violet-50/30 px-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">⚠️</span> PIN Admin wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-900"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Buka Dashboard Guru</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
