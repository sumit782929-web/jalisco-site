import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminReservations() {
  const reservations = trpc.reservations.list.useQuery();
  const updateStatus = trpc.reservations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Reservation status updated");
      reservations.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Jalisco Brews &amp; Bites</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reservations</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage incoming rooftop bookings and confirm table status.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm" onClick={() => reservations.refetch()} disabled={reservations.isFetching}>
            <RefreshCw className={reservations.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
          </button>
        </header>

        <section className="overflow-hidden rounded-xl border bg-card">
          {reservations.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading reservations…</div>
          ) : reservations.error ? (
            <div className="p-8 text-sm text-destructive">{reservations.error.message}</div>
          ) : reservations.data?.length ? (
            <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Date &amp; time</th><th className="px-4 py-3">Guests</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y">{reservations.data.map((reservation) => <tr key={reservation.id}><td className="px-4 py-4"><div className="font-medium">{reservation.customerName}</div><div className="text-xs text-muted-foreground">{reservation.phoneNumber} · {reservation.email}</div></td><td className="px-4 py-4">{reservation.reservationDate}<div className="text-xs text-muted-foreground">{reservation.timeSlot}</div></td><td className="px-4 py-4">{reservation.guestCount}</td><td className="px-4 py-4 capitalize">{reservation.paymentStatus}<div className="text-xs text-muted-foreground">{reservation.paymentMethod}</div></td><td className="px-4 py-4 capitalize">{reservation.reservationStatus}</td><td className="px-4 py-4"><select className="rounded-md border bg-background px-2 py-1.5 text-xs" value={reservation.reservationStatus} onChange={(event) => updateStatus.mutate({ id: reservation.id, reservationStatus: event.target.value as "pending" | "confirmed" | "cancelled" | "rejected" })} disabled={updateStatus.isPending}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div>
          ) : <div className="p-12 text-center text-sm text-muted-foreground">No reservations yet.</div>}
        </section>
      </div>
    </DashboardLayout>
  );
}
