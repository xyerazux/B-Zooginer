import { History, ShieldCheck, Activity } from 'lucide-react';
import { useActivityLogs } from '@/hooks/useAdmin';

export function ActivityLogsPage() {
  const { data: logs, isLoading } = useActivityLogs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Log Riwayat Aktivitas Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Catatan audit trail untuk memantau perubahan status pesanan, pembayaran, dan tindakan administratif.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat catatan log aktivitas...
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History size={36} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Aktivitas Tercatat</h3>
            <p className="text-xs text-slate-500">
              Aktivitas perubahan sistem akan tercatat secara otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu Kejadian</th>
                  <th className="py-3 px-4">Tindakan (Action)</th>
                  <th className="py-3 px-4">Tipe Entitas</th>
                  <th className="py-3 px-4">ID Entitas</th>
                  <th className="py-3 px-4">Detail Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-primary-900 uppercase tracking-wide bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
