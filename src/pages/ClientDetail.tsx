import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import { Button, Card } from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";
import {
  RtmFilterBar,
  applyRtmFilter,
  defaultRtmFilter,
  type RtmFilter,
} from "@/components/RtmFilters";

export function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, rtms, employeeName } = useAppData();
  const client = clients.find((c) => c.id === id);
  const [filter, setFilter] = useState<RtmFilter>(defaultRtmFilter);

  const clientRtms = useMemo(
    () => (client ? rtms.filter((r) => r.clientId === client.id) : []),
    [rtms, client],
  );
  const list = useMemo(() => applyRtmFilter(clientRtms, filter), [clientRtms, filter]);

  if (!client) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <p className="text-lg font-black">הלקוח לא נמצא</p>
          <Button className="mt-3" variant="outline" onClick={() => navigate("/")}>
            חזרה
          </Button>
        </Card>
      </div>
    );
  }

  const activeCount = clientRtms.filter((r) => r.status !== "disqualified").length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        → חזרה
      </button>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--color-accent)]">לקוח</p>
          <h1 className="text-2xl font-black">{client.name}</h1>
        </div>
        <Link
          to={`/employee/${client.accountManagerId}`}
          className="rounded-xl bg-[var(--color-cloud)] px-4 py-2 text-sm font-bold hover:bg-[var(--color-line)]"
        >
          🎯 מנהל/ת הלקוח: {employeeName(client.accountManagerId)}
        </Link>
      </Card>

      <Card className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--color-ink-soft)]">RTMים פעילים</span>
        <span className="text-3xl font-black">{activeCount}</span>
      </Card>

      <div>
        <RtmFilterBar value={filter} onChange={setFilter} />
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-ink-soft)]">
            אין RTMים ללקוח הזה.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <RtmCard key={r.id} rtm={r} showUploader />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
