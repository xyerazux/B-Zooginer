import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi')
    .email('Format alamat email tidak valid'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await signIn(data.email, data.password);

      // Determine redirect path
      const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;

      if (stateFrom) {
        navigate(stateFrom, { replace: true });
        return;
      }

      if (result.profile?.role === 'master_admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-surface-canvas py-12 sm:px-6 lg:px-8">
      {/* Top Brand & Back to Storefront */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Storefront Publik</span>
          </Link>
          <span className="text-[10px] font-semibold text-primary-800 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
            Portal Admin
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary-800 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
            B
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Portal Administrator
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Khusus Master Admin sekolah dan Administrator Stan Kelompok yang terdaftar.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-800">Gagal Masuk</p>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@sekolah.sch.id"
                  {...register('email')}
                  className={`w-full h-10 pl-9 pr-3 bg-white border rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Visibility Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full h-10 pl-9 pr-10 bg-white border rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary-800 hover:bg-primary-700 active:bg-primary-900 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[11px] justify-center">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Autentikasi terenkripsi & hak akses berbasis database profiles.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
