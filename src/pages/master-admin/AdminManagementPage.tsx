import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, ShieldCheck, Mail, Lock, User, Store, X, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAccounts, useCreateGroupAdmin, useAllGroups } from '@/hooks/useAdmin';

const createAdminSchema = z.object({
  full_name: z.string().min(2, 'Nama administrator minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  group_id: z.string().min(1, 'Pilih stan kelompok yang akan ditugaskan'),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export function AdminManagementPage() {
  const { data: accounts, isLoading } = useAdminAccounts();
  const { data: groups } = useAllGroups();
  const createAdminMutation = useCreateGroupAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmitCreateAdmin = async (data: CreateAdminFormData) => {
    try {
      await createAdminMutation.mutateAsync({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        group_id: data.group_id,
      });

      toast.success('Akun Group Admin berhasil dibuat secara aman di server!');
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat akun admin kelompok.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Akun Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provisi akun Group Admin untuk perwakilan stan kelas melalui mekanisme server-side yang aman.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 active:bg-primary-900 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Tambah Admin Stan Baru</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="p-4 bg-primary-50/70 border border-primary-200 rounded-lg text-xs text-primary-900 flex items-start gap-3">
        <KeyRound size={18} className="text-primary-800 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Proteksi Keamanan:</strong> Pembuatan akun Group Admin diproses melalui Supabase Edge Function terproteksi tanpa mengekspos Service Role Key ke peramban. Registrasi akun publik dimatikan untuk mencegah pendaftaran admin tidak sah.
        </p>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat daftar akun administrator...
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada akun administrator yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Administrator</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Stan yang Ditugaskan</th>
                  <th className="py-3 px-4">Tanggal Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-slate-900">{acc.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          acc.role === 'master_admin'
                            ? 'bg-primary-50 text-primary-800 border border-primary-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <ShieldCheck size={11} />
                        {acc.role === 'master_admin' ? 'Master Admin' : 'Admin Stan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {acc.group ? (
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Store size={13} className="text-primary-800" />
                          {acc.group.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Semua Stan (Platform Wide)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                      {new Date(acc.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Group Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-primary-800" />
                <span>Buat Akun Admin Stan Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitCreateAdmin)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa / Admin <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Fauzi"
                    {...register('full_name')}
                    className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                {errors.full_name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Email Akun <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="fauzi@sekolah.sch.id"
                    {...register('email')}
                    className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Awal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    {...register('password')}
                    className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tugaskan ke Stan Kelompok <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('group_id')}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">-- Pilih Stan Kelompok --</option>
                  {(groups || []).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {errors.group_id && (
                  <p className="text-xs text-rose-600 mt-1">{errors.group_id.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Buat Akun Administrator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
