import { useState } from 'react';
import { BookOpen, Clock, GraduationCap, ShieldCheck, Target } from 'lucide-react';
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
        `Kode remedial belum sesuai. Cek lagi kode dari guru ya (demo: ${settings.accessCode}).`
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
      setFormError(`PIN Guru belum sesuai (demo: ${settings.teacherPin}).`);
      return;
    }

    onTeacherLogin();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Bagian Kiri: Pengantar yang hangat & simpel */}
        <div className="space-y-6 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f3ecfb] px-3.5 py-1 text-xs font-semibold text-[#6d4c9e]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Matematika Tingkat Lanjut · Kelas XI</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2c243b] sm:text-4xl sm:leading-tight">
              Web Remedial Matriks Kelas XI
            </h1>
            <p className="text-sm leading-relaxed text-[#5c536d] sm:text-base">
              Halo! Kamu bisa berlatih dulu per topik sebelum mengerjakan ujian remedial.
              Paket soal untuk <strong>Kelas XI-1</strong> dan <strong>Kelas XI-2</strong>{' '}
              sudah dibedakan, jadi pastikan kamu memilih kelas yang benar ya.
            </p>
          </div>

          {/* Info Ringkas Tanpa Kotak Ramai */}
          <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-semibold text-[#563f7a]">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dff4] bg-white px-3.5 py-2">
              <Target className="h-3.5 w-3.5 text-[#6d4c9e]" aria-hidden="true" />
              KKM {settings.kkm}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dff4] bg-white px-3.5 py-2">
              <Clock className="h-3.5 w-3.5 text-[#6d4c9e]" aria-hidden="true" />
              Waktu {settings.durationMinutes} menit
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8dff4] bg-white px-3.5 py-2">
              6 Soal · Maks. {settings.maxAttempts}× percobaan
            </span>
          </div>

          <div className="rounded-2xl border border-[#ebe4f4] bg-[#f6f2fb]/70 p-4 text-xs leading-relaxed text-[#5c536d]">
            <p className="font-semibold text-[#473366]">Catatan singkat:</p>
            <p className="mt-1">
              • <strong>Kelas XI-1</strong> mengerjakan Paket A (kesamaan matriks,{' '}
              <span className="font-mono-math">2A − Bᵀ</span>, persamaan{' '}
              <span className="font-mono-math">A·M = B</span>, invers{' '}
              <span className="font-mono-math">3×3</span>, soal Koperasi &amp; Toko Kue).
              <br />• <strong>Kelas XI-2</strong> mengerjakan Paket B (penjumlahan matriks,{' '}
              <span className="font-mono-math">A⁻¹ × B</span>, sifat determinan, invers{' '}
              <span className="font-mono-math">3×3</span>, soal Tiket Pentas &amp; Toko Kue).
            </p>
          </div>
        </div>

        {/* Bagian Kanan: Form Masuk */}
        <div className="soft-card rounded-3xl p-6 sm:p-8 lg:col-span-6">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f4effa] p-1">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                role === 'student'
                  ? 'bg-white text-[#4d3475] shadow-2xs'
                  : 'text-[#75668f] hover:text-[#4d3475]'
              }`}
            >
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setFormError('');
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                role === 'teacher'
                  ? 'bg-white text-[#4d3475] shadow-2xs'
                  : 'text-[#75668f] hover:text-[#4d3475]'
              }`}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Guru</span>
            </button>
          </div>

          {role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {/* Pilih Kelas: XI-1 atau XI-2 */}
              <div>
                <span className="block text-sm font-semibold text-[#2c243b]">Kelas</span>
                <span className="mb-2 block text-xs text-[#6f6680]">
                  Soal latihan &amp; ujian akan menyesuaikan kelas yang dipilih.
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
                        className={`flex h-12 flex-col items-center justify-center rounded-xl border text-sm font-bold transition ${
                          selected
                            ? 'border-[#7a5ca8] bg-[#f3ecfb] text-[#4d3475]'
                            : 'border-[#e6def2] bg-white text-[#6f6680] hover:border-[#cbbbe6] hover:bg-[#faf8fc]'
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
                    className="block text-sm font-semibold text-[#2c243b]"
                  >
                    No. Absen
                  </label>
                  <span id="absen-hint" className="mb-1 block text-xs text-[#6f6680]">
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
                    className="form-control font-mono-math h-11 w-full rounded-xl border border-[#e3d9f0] bg-[#fcfbfe] px-3 text-sm text-[#2c243b] outline-none focus:border-[#7a5ca8] focus:bg-white focus:ring-2 focus:ring-[#e8dff7]"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">!</span> Isi 1–45.
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-semibold text-[#2c243b]"
                  >
                    Nama Lengkap
                  </label>
                  <span id="name-hint" className="mb-1 block text-xs text-[#6f6680]">
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
                    className="form-control h-11 w-full rounded-xl border border-[#e3d9f0] bg-[#fcfbfe] px-3 text-sm text-[#2c243b] outline-none focus:border-[#7a5ca8] focus:bg-white focus:ring-2 focus:ring-[#e8dff7]"
                  />
                  <div className="field-error-msg">
                    <span role="img" aria-label="Error">!</span> Minimal 3 karakter.
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="access-code"
                  className="block text-sm font-semibold text-[#2c243b]"
                >
                  Kode Remedial
                </label>
                <span id="code-hint" className="mb-1 block text-xs text-[#6f6680]">
                  Masukkan kode dari guru (demo:{' '}
                  <code className="font-mono-math font-semibold text-[#6d4c9e]">
                    {settings.accessCode}
                  </code>
                  ).
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
                  className="form-control font-mono-math h-11 w-full rounded-xl border border-[#e3d9f0] bg-[#fcfbfe] px-3 text-sm uppercase text-[#2c243b] outline-none focus:border-[#7a5ca8] focus:bg-white focus:ring-2 focus:ring-[#e8dff7]"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">!</span> Kode remedial wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#f2ccd5] bg-[#fdf0f3] px-3.5 py-2.5 text-xs font-medium text-[#a33b56]"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#6d4c9e] px-4 text-sm font-semibold text-white transition hover:bg-[#5b3d8a]"
              >
                Masuk Sekarang
              </button>
            </form>
          ) : (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="teacher-pin"
                  className="block text-sm font-semibold text-[#2c243b]"
                >
                  PIN Guru
                </label>
                <span id="pin-hint" className="mb-1 block text-xs text-[#6f6680]">
                  Demo PIN default:{' '}
                  <code className="font-mono-math font-semibold text-[#6d4c9e]">
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
                  className="form-control h-11 w-full rounded-xl border border-[#e3d9f0] bg-[#fcfbfe] px-3 text-sm text-[#2c243b] outline-none focus:border-[#7a5ca8] focus:bg-white focus:ring-2 focus:ring-[#e8dff7]"
                />
                <div className="field-error-msg">
                  <span role="img" aria-label="Error">!</span> PIN Guru wajib diisi.
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#f2ccd5] bg-[#fdf0f3] px-3.5 py-2.5 text-xs font-medium text-[#a33b56]"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[#3d2c59] px-4 text-sm font-semibold text-white transition hover:bg-[#2c1f42]"
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
