import { useState } from 'react';
import { Clock, GraduationCap, ShieldCheck, Target } from 'lucide-react';
import {
  AVAILABLE_CLASSES,
  formatAbsen,
  type ClassName,
  type RemedialSettings,
  type StudentProfile,
} from '../lib/storage/repository';
import { HeroBooksLeft, HeroBooksRight } from './TopicIllustration';

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
      setFormError('PIN Guru tidak sesuai. Silakan periksa kembali.');
      return;
    }

    onTeacherLogin();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-8">
      {/* Main Centered SkillSet-style Window Frame */}
      <div className="soft-card overflow-hidden rounded-[28px]">
        {/* Top Periwinkle Illustrated Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#7372F3] via-[#7E7AF6] to-[#6866E6] px-6 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-14 right-12 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative flex items-center justify-between gap-4">
            <HeroBooksLeft />

            <div className="mx-auto flex flex-col items-center text-center">
              <div className="flex items-center gap-2.5 rounded-full bg-white/15 px-3.5 py-1.5 backdrop-blur-xs">
                <img
                  src="/logo-don-bosco.png"
                  alt="Logo SMA Don Bosco II"
                  className="h-7 w-7 rounded-full bg-white/90 object-contain p-0.5"
                />
                <span className="text-xs font-bold tracking-wide">SMA Don Bosco II</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Web Remedial Matriks Kelas XI
              </h1>
              <p className="mt-1 text-xs text-white/85 sm:text-sm">
                Matematika Tingkat Lanjut · Paket Khusus Kelas XI-1 &amp; XI-2
              </p>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1">
                  <Target className="h-3 w-3" aria-hidden="true" />
                  KKM {settings.kkm}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {settings.durationMinutes} Menit
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1">
                  6 Soal · {settings.maxAttempts}× Kesempatan
                </span>
              </div>
            </div>

            <HeroBooksRight />
          </div>
        </div>

        {/* Form Body */}
        <div className="mx-auto max-w-lg px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f3f4fb] p-1">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                role === 'student'
                  ? 'bg-white text-[#6c6ce5] shadow-xs'
                  : 'text-[#7c7f9d] hover:text-[#262542]'
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
                  ? 'bg-white text-[#6c6ce5] shadow-xs'
                  : 'text-[#7c7f9d] hover:text-[#262542]'
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
                <span className="block text-sm font-bold text-[#262542]">Pilih Kelas</span>
                <span className="mb-2 block text-xs text-[#8a8da8]">
                  Paket soal kelas XI-1 dan XI-2 berbeda, pilih sesuai kelasmu.
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
                        className={`flex h-13 flex-col items-center justify-center rounded-2xl border text-sm font-bold transition ${
                          selected
                            ? 'border-[#6c6ce5] bg-[#f3f2ff] text-[#6c6ce5]'
                            : 'border-[#eceef8] bg-[#fafbff] text-[#7c7f9d] hover:border-[#cfd0f7]'
                        }`}
                      >
                        <span>Kelas {cls}</span>
                        <span className="text-[11px] font-medium opacity-75">
                          {cls === 'XI-1' ? 'Paket A' : 'Paket B'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="student-absen"
                    className="block text-sm font-bold text-[#262542]"
                  >
                    No. Absen
                  </label>
                  <span id="absen-hint" className="mb-1 block text-xs text-[#8a8da8]">
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
                    placeholder="12"
                    className="form-control font-mono-math h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm text-[#262542] outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">!</span> Isi 1–45.
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-bold text-[#262542]"
                  >
                    Nama Lengkap
                  </label>
                  <span id="name-hint" className="mb-1 block text-xs text-[#8a8da8]">
                    Sesuai absen kelas {className}.
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
                    placeholder="Nama lengkap kamu"
                    className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm text-[#262542] outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">!</span> Minimal 3 karakter.
                  </div>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#ffd0d6] bg-[#fff3f5] px-3.5 py-2.5 text-xs font-medium text-[#d94657]"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#6c6ce5] px-4 text-sm font-semibold text-white shadow-sm shadow-[#6c6ce5]/30 transition hover:bg-[#5a5ad6]"
              >
                Masuk ke Beranda
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="teacher-pin"
                  className="block text-sm font-bold text-[#262542]"
                >
                  PIN Guru
                </label>
                <span id="pin-hint" className="mb-1 block text-xs text-[#8a8da8]">
                  Masukkan PIN khusus guru pengampu.
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
                  className="form-control h-11 w-full rounded-xl border border-[#e5e7f5] bg-[#fafbff] px-3 text-sm text-[#262542] outline-none focus:border-[#6c6ce5] focus:bg-white focus:ring-2 focus:ring-[#e8e8ff]"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">!</span> PIN Guru wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#ffd0d6] bg-[#fff3f5] px-3.5 py-2.5 text-xs font-medium text-[#d94657]"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#262542] px-4 text-sm font-semibold text-white transition hover:bg-[#1a1930]"
              >
                Buka Dashboard Guru
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
