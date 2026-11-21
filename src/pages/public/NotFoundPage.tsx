import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-primary-800 flex items-center justify-center mx-auto text-2xl font-extrabold font-mono">
        404
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Halaman yang Anda tuju mungkin telah dipindahkan, dinonaktifkan, atau alamat URL yang Anda masukkan salah.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto h-10 px-5 text-sm font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors inline-flex items-center justify-center gap-2"
        >
          <Home size={15} />
          <span>Kembali ke Beranda</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto h-10 px-5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft size={15} />
          <span>Halaman Sebelumnya</span>
        </button>
      </div>
    </div>
  );
}
