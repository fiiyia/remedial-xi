import { useState } from 'react';
import { BookOpen, GraduationCap, KeyRound, ShieldCheck } from 'lucide-react';
import type { RemedialSettings, StudentProfile } from '../lib/storage/repository';

interface LoginViewProps {
  settings: RemedialSettings;
  onStudentLogin: (student: StudentProfile) => void;
  onTeacherLogin: () => void;
}

const CLASS_OPTIONS = ['XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6'];

export function LoginView({ settings, onStudentLogin, onTeacherLogin }: LoginViewProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('XI-1');
  const [accessCode, setAccessCode] = useState('');
  const [teacherPin, setTeacherPin] = useState('');
  const [formError, setFormError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (accessCode.trim().toUpperCase() !== settings.accessCode.trim().toUpperCase()) {
      setFormError(`Kode remedial tidak cocok. Pastikan sesuai kode dari guru (demo: ${settings.accessCode}).`);
      return;
    }

    onStudentLogin({
      nis: nis.trim(),
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Panel Informasi */}
        <div className="space-y-5 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Matematika Tingkat Lanjut • Kelas XI</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Web Remedial Matriks <span className="text-indigo-600">PH XI.2</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Platform latihan mandiri dan ujian remedial interaktif dengan generator angka acak
            eksak, input matriks khusus (<span className="font-mono-math">2×2</span> &amp;{' '}
            <span className="font-mono-math">3×3</span>), petunjuk bertahap, serta penilaian
            otomatis instan.
          </p>

          <dl className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <dt className="text-xs font-medium text-slate-500">KKM Ketuntasan</dt>
              <dd className="mt-1 text-xl font-bold text-slate-900">{settings.kkm}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <dt className="text-xs font-medium text-slate-500">Durasi Ujian</dt>
              <dd className="mt-1 text-xl font-bold text-slate-900">
                {settings.durationMinutes} menit
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <dt className="text-xs font-medium text-slate-500">Batas Percobaan</dt>
              <dd className="mt-1 text-xl font-bold text-slate-900">
                {settings.maxAttempts}×
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <dt className="text-xs font-medium text-slate-500">Kompetensi</dt>
              <dd className="mt-1 text-xl font-bold text-slate-900">6 Topik PH</dd>
            </div>
          </dl>
        </div>

        {/* Kartu Login */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                role === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Admin Guru</span>
            </button>
          </div>

          {role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label htmlFor="student-nis" className="block text-sm font-semibold text-slate-800">
                  NIS (Nomor Induk Siswa)
                </label>
                <span id="nis-hint" className="mb-1 block text-xs text-slate-500">
                  Masukkan 4–12 digit angka NIS kamu.
                </span>
                <input
                  id="student-nis"
                  name="nis"
                  type="text"
                  inputMode="numeric"
                  required
                  pattern="\d{4,12}"
                  aria-describedby="nis-hint"
                  aria-invalid="false"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Contoh: 20250112"
                  className="form-control h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">⚠️</span> NIS harus berupa 4 hingga 12 digit angka.
                </div>
              </div>

              <div>
                <label htmlFor="student-name" className="block text-sm font-semibold text-slate-800">
                  Nama Lengkap
                </label>
                <span id="name-hint" className="mb-1 block text-xs text-slate-500">
                  Tulis nama lengkap sesuai daftar hadir kelas.
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
                  className="form-control h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">⚠️</span> Masukkan minimal 3 karakter untuk nama lengkap.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="student-class" className="block text-sm font-semibold text-slate-800">
                    Kelas
                  </label>
                  <span className="mb-1 block text-xs text-slate-500">Pilih kelas XI kamu.</span>
                  <select
                    id="student-class"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="access-code" className="block text-sm font-semibold text-slate-800">
                    Kode Remedial
                  </label>
                  <span id="code-hint" className="mb-1 block text-xs text-slate-500">
                    Demo: <code className="font-mono-math font-semibold text-indigo-700">{settings.accessCode}</code>
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
                    className="form-control font-mono-math h-11 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">⚠️</span> Kode remedial wajib diisi.
                  </div>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>Masuk ke Beranda Remedial</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label htmlFor="teacher-pin" className="block text-sm font-semibold text-slate-800">
                  PIN Admin Guru
                </label>
                <span id="pin-hint" className="mb-1 block text-xs text-slate-500">
                  Demo PIN default:{' '}
                  <code className="font-mono-math font-semibold text-indigo-700">
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
                  className="form-control h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">⚠️</span> PIN Admin wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800"
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
