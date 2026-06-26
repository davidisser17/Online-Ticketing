import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConcertById,
  createConcert,
  updateConcert,
  type ConcertPayload,
} from '@/services/concertService';
import { useUiStore } from '@/store/uiStore';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import type { Concert } from '@/types';

// ── Schema ────────────────────────────────────────────────────────────────
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
});

const concertSchema = z.object({
  artistName: z.string().min(1, 'Nama artis wajib diisi'),
  description: z.string().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  venueName: z.string().min(1, 'Nama venue wajib diisi'),
  venueAddress: z.string().min(1, 'Alamat venue wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  jastipFee: z.coerce.number().min(0),
  quota: z.coerce.number().min(1, 'Kuota minimal 1'),
  maxTicketsPerOrder: z.coerce.number().min(1).max(10),
  status: z.enum(['Akan Datang', 'Berlangsung', 'Selesai']),
  terms: z.string().optional(),
  posterUrlsRaw: z.string().optional(), // newline-separated URLs
  ticketCategories: z.array(categorySchema).min(1, 'Minimal 1 kategori tiket'),
});
type ConcertFormValues = z.infer<typeof concertSchema>;

const statusOptions = [
  { value: 'Akan Datang', label: 'Akan Datang' },
  { value: 'Berlangsung', label: 'Berlangsung' },
  { value: 'Selesai', label: 'Selesai' },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function CmsConcertFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const { data: existing, isLoading: loadingConcert } = useQuery({
    queryKey: ['concert', id],
    queryFn: () => getConcertById(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ConcertFormValues>({
    resolver: zodResolver(concertSchema),
    defaultValues: {
      status: 'Akan Datang',
      jastipFee: 0,
      quota: 50,
      maxTicketsPerOrder: 4,
      posterUrlsRaw: '',
      ticketCategories: [{ name: '', price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketCategories',
  });

  // Populate form when editing
  useEffect(() => {
    const c: Concert | undefined = existing?.data.data;
    if (c) {
      reset({
        artistName: c.artistName,
        description: c.description ?? '',
        date: toDatetimeLocal(c.date),
        venueName: c.venueName,
        venueAddress: c.venueAddress,
        city: c.city,
        jastipFee: c.jastipFee,
        quota: c.quota,
        maxTicketsPerOrder: c.maxTicketsPerOrder,
        status: c.status,
        terms: c.terms ?? '',
        posterUrlsRaw: (c.posterUrls ?? []).join('\n'),
        ticketCategories: c.ticketCategories.map((tc) => ({
          id: tc.id,
          name: tc.name,
          price: tc.price,
        })),
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (payload: ConcertFormValues) => {
      // Buat payload sesuai tipe ConcertPayload (tanpa id, timestamps, dll)
      const posterUrls = (payload.posterUrlsRaw ?? '')
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

      const data: ConcertPayload = {
        artistName: payload.artistName,
        description: payload.description,
        date: new Date(payload.date).toISOString(),
        venueName: payload.venueName,
        venueAddress: payload.venueAddress,
        city: payload.city,
        jastipFee: payload.jastipFee,
        quota: payload.quota,
        maxTicketsPerOrder: payload.maxTicketsPerOrder,
        status: payload.status,
        terms: payload.terms,
        posterUrls,
        ticketCategories: payload.ticketCategories.map((tc, i) => ({
          id: tc.id ?? `cat-${Date.now()}-${i}`,
          name: tc.name,
          price: tc.price,
        })),
      };
      return isEdit ? updateConcert(id!, data) : createConcert(data);
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        message: isEdit
          ? 'Konser berhasil diperbarui.'
          : 'Konser berhasil ditambahkan.',
      });
      void qc.invalidateQueries({ queryKey: ['cms-concerts'] });
      navigate('/cms/concerts');
    },
    onError: () =>
      addToast({ type: 'error', message: 'Gagal menyimpan konser.' }),
  });

  if (isEdit && loadingConcert) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="space-y-6 max-w-3xl"
    >
      <h1 className="text-lg font-semibold text-gray-900">
        {isEdit ? 'Edit Konser' : 'Tambah Konser'}
      </h1>

      {/* Info dasar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-gray-700 text-sm">Informasi Konser</h2>
        <Input
          label="Nama Artis / Konser"
          error={errors.artistName?.message}
          {...register('artistName')}
        />
        <Textarea
          label="Deskripsi"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tanggal & Waktu"
            type="datetime-local"
            error={errors.date?.message}
            {...register('date')}
          />
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
        <Input
          label="Nama Venue"
          error={errors.venueName?.message}
          {...register('venueName')}
        />
        <Input
          label="Alamat Venue"
          error={errors.venueAddress?.message}
          {...register('venueAddress')}
        />
        <Input
          label="Kota"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>

      {/* Jastip & kuota */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-gray-700 text-sm">Kuota & Jastip</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Kuota Total"
            type="number"
            min={1}
            error={errors.quota?.message}
            {...register('quota')}
          />
          <Input
            label="Biaya Jastip (per tiket)"
            type="number"
            min={0}
            error={errors.jastipFee?.message}
            {...register('jastipFee')}
          />
          <Input
            label="Maks Tiket per Pesanan"
            type="number"
            min={1}
            max={10}
            error={errors.maxTicketsPerOrder?.message}
            {...register('maxTicketsPerOrder')}
          />
        </div>
      </div>

      {/* Kategori tiket */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-700 text-sm">Kategori Tiket</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ name: '', price: 0 })}
          >
            + Tambah Kategori
          </Button>
        </div>
        {errors.ticketCategories?.root && (
          <p className="text-sm text-red-500">
            {errors.ticketCategories.root.message}
          </p>
        )}
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-end gap-3">
            <Input
              label={`Nama Kategori ${idx + 1}`}
              wrapperClassName="flex-1"
              error={errors.ticketCategories?.[idx]?.name?.message}
              {...register(`ticketCategories.${idx}.name`)}
            />
            <Input
              label="Harga (Rp)"
              type="number"
              min={0}
              wrapperClassName="w-36"
              error={errors.ticketCategories?.[idx]?.price?.message}
              {...register(`ticketCategories.${idx}.price`)}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="mb-0.5"
                onClick={() => remove(idx)}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Gambar & Cover */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-medium text-gray-700 text-sm">Gambar & Cover</h2>
        <Textarea
          label="URL Gambar / Poster"
          rows={3}
          helperText="Masukkan satu URL per baris. Gambar pertama akan digunakan sebagai cover di landing page."
          placeholder={'https://example.com/poster1.jpg\nhttps://example.com/poster2.jpg'}
          {...register('posterUrlsRaw')}
        />
        {/* Preview gambar pertama */}
        {watch('posterUrlsRaw')?.split('\n')[0]?.trim() && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1.5">Preview cover:</p>
            <img
              src={watch('posterUrlsRaw')!.split('\n')[0].trim()}
              alt="Preview poster"
              className="w-32 h-44 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Syarat */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <Textarea
          label="Syarat & Ketentuan (opsional)"
          rows={3}
          {...register('terms')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={mutation.isPending}
        >
          {isEdit ? 'Simpan Perubahan' : 'Tambah Konser'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => navigate('/cms/concerts')}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
