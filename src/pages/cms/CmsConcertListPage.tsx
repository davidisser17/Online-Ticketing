import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConcerts, deleteConcert } from '@/services/concertService';
import { useUiStore } from '@/store/uiStore';
import { formatDate, formatCurrency } from '@/utils/formatters';
import Button from '@/components/common/Button';
import StatusLabel from '@/components/common/StatusLabel';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import type { Concert } from '@/types';

export default function CmsConcertListPage() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cms-concerts'],
    queryFn: () => getConcerts(),
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConcert(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      addToast({ type: 'success', message: 'Konser berhasil dihapus.' });
      void qc.invalidateQueries({ queryKey: ['cms-concerts'] });
    },
    onError: () => addToast({ type: 'error', message: 'Gagal menghapus konser.' }),
    onSettled: () => { setDeletingId(null); setConfirmId(null); },
  });

  const concerts: Concert[] = data?.data.data ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Daftar Konser</h1>
        <Link to="/cms/concerts/new">
          <Button variant="primary" size="sm">+ Tambah Konser</Button>
        </Link>
      </div>

      {/* States */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}
      {isError && <ErrorState message="Gagal memuat konser." onRetry={() => void refetch()} />}
      {!isLoading && !isError && concerts.length === 0 && (
        <EmptyState
          title="Belum ada konser"
          message="Mulai tambahkan konser pertama Anda."
          actionLabel="+ Tambah Konser"
          onAction={() => navigate('/cms/concerts/new')}
        />
      )}

      {/* Table */}
      {!isLoading && concerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Konser</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Harga</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kuota</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {concerts.map((concert) => (
                <tr key={concert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{concert.artistName}</p>
                    <p className="text-xs text-gray-400">{concert.city}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(concert.date)}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                    {concert.ticketCategories.length > 0
                      ? formatCurrency(Math.min(...concert.ticketCategories.map((t) => t.price)))
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={concert.remainingQuota === 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {concert.remainingQuota}/{concert.quota}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel status={concert.status} />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link to={`/cms/concerts/${concert.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                    {confirmId === concert.id ? (
                      <span className="inline-flex gap-1">
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={deletingId === concert.id}
                          onClick={() => deleteMutation.mutate(concert.id)}
                        >
                          Hapus
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>Batal</Button>
                      </span>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => setConfirmId(concert.id)}>Hapus</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
