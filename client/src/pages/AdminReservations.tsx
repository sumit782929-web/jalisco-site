import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "rejected";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const reservationStatusStyles: Record<ReservationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  cancelled: "bg-zinc-500/15 text-zinc-600 border-zinc-500/30 dark:text-zinc-400",
  rejected: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  failed: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400",
  refunded: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400",
};

function StatusBadge({ status, kind }: { status: string; kind: "reservation" | "payment" }) {
  const styles = kind === "reservation" ? reservationStatusStyles : paymentStatusStyles;
  const cls = styles[status as keyof typeof styles] ?? "bg-muted text-muted-foreground border-transparent";
  return <Badge variant="outline" className={`capitalize ${cls}`}>{status}</Badge>;
}

function formatDateTime(date: string, time: string) {
  try {
    const parsed = new Date(`${date}T${time}:00`);
    const dateLabel = parsed.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const timeLabel = parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return { dateLabel, timeLabel };
  } catch {
    return { dateLabel: date, timeLabel: time };
  }
}

function toCsvValue(value: string | number) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function AdminReservations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");

  const reservations = trpc.reservations.list.useQuery();

  const updateStatus = trpc.reservations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Reservation status updated");
      reservations.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePayment = trpc.payments.markPendingFailure.useMutation({
    onSuccess: () => {
      toast.success("Payment status updated");
      reservations.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const allRows = reservations.data ?? [];

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = allRows.filter((r) => r.reservationDate === today).length;
    const confirmed = allRows.filter((r) => r.reservationStatus === "confirmed").length;
    const pending = allRows.filter((r) => r.reservationStatus === "pending").length;
    const collected = allRows.filter((r) => r.paymentStatus === "paid").reduce((sum, r) => sum + (r.depositAmount || 0), 0);
    return { total: allRows.length, todayCount, confirmed, pending, collected };
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRows.filter((r) => {
      const matchesQuery =
        !query ||
        r.customerName.toLowerCase().includes(query) ||
        r.phoneNumber.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || r.reservationStatus === statusFilter;
      const matchesPayment = paymentFilter === "all" || r.paymentStatus === paymentFilter;
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [allRows, search, statusFilter, paymentFilter]);

  function exportCsv() {
    if (!filteredRows.length) {
      toast.error("No reservations to export");
      return;
    }
    const headers = ["Guest", "Phone", "Email", "Date", "Time", "Guests", "Payment Method", "Deposit", "Payment Status", "Reservation Status", "Special Requests"];
    const lines = filteredRows.map((r) =>
      [r.customerName, r.phoneNumber, r.email, r.reservationDate, r.timeSlot, r.guestCount, r.paymentMethod, r.depositAmount, r.paymentStatus, r.reservationStatus, r.specialRequests ?? ""]
        .map(toCsvValue)
        .join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jalisco-reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Jalisco Brews &amp; Bites</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reservations</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage incoming rooftop bookings and confirm table status.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={exportCsv}
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => reservations.refetch()}
              disabled={reservations.isFetching}
            >
              <RefreshCw className={reservations.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
            </button>
          </div>
        </header>

        {reservations.isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total bookings</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold">{stats.total}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Today</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold">{stats.todayCount}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Confirmed</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.confirmed}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p></CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Deposits collected</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-semibold">₹{stats.collected.toLocaleString("en-IN")}</p></CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="All payments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <section className="overflow-hidden rounded-xl border bg-card">
          {reservations.isLoading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading reservations…</div>
          ) : reservations.error ? (
            <div className="p-8 text-sm text-destructive">{reservations.error.message}</div>
          ) : !allRows.length ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No reservations yet — bookings from your website will show up here.</div>
          ) : !filteredRows.length ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No reservations match your search or filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Date &amp; time</th>
                    <th className="px-4 py-3">Guests</th>
                    <th className="px-4 py-3">Special requests</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRows.map((reservation) => {
                    const { dateLabel, timeLabel } = formatDateTime(reservation.reservationDate, reservation.timeSlot);
                    return (
                      <tr key={reservation.id} className="align-top hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            <a className="hover:underline" href={`tel:${reservation.phoneNumber}`}>{reservation.phoneNumber}</a>
                            {" · "}
                            <a className="hover:underline" href={`mailto:${reservation.email}`}>{reservation.email}</a>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium">{dateLabel}</div>
                          <div className="text-xs text-muted-foreground">{timeLabel}</div>
                        </td>
                        <td className="px-4 py-4">{reservation.guestCount}</td>
                        <td className="px-4 py-4 max-w-[220px]">
                          {reservation.specialRequests ? (
                            <span className="text-xs text-muted-foreground line-clamp-2" title={reservation.specialRequests}>{reservation.specialRequests}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="mb-2 text-xs capitalize text-muted-foreground">{reservation.paymentMethod} · ₹{reservation.depositAmount}</div>
                          <Select
                            value={reservation.paymentStatus}
                            onValueChange={(value) => updatePayment.mutate({ id: reservation.id, paymentStatus: value as PaymentStatus })}
                            disabled={updatePayment.isPending}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="mb-2"><StatusBadge status={reservation.reservationStatus} kind="reservation" /></div>
                          <Select
                            value={reservation.reservationStatus}
                            onValueChange={(value) => updateStatus.mutate({ id: reservation.id, reservationStatus: value as ReservationStatus })}
                            disabled={updateStatus.isPending}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {allRows.length > 0 && (
          <p className="text-xs text-muted-foreground">Showing {filteredRows.length} of {allRows.length} reservations.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
