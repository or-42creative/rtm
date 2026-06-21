import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppData } from "@/lib/appData";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";
import {
  RtmFilterBar,
  applyRtmFilter,
  defaultRtmFilter,
  type RtmFilter,
} from "@/components/RtmFilters";

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, clients, rtms } = useAppData();
  const emp = employees.find((e) => e.id === id);
  const [filter, setFilter] = useState<RtmFilter>(defaultRtmFilter);

  const credited = useMemo(
    () =>
      emp
        ? rtms.filter(
            (r) => r.ideaOwnerIds.includes(emp.id) || r.accountManagerId === emp.id,
          )
        : [],
    [rtms, emp],
  );
  const list = useMemo(() => applyRtmFilter(credited, filter), [credited, filter]);

  if (!emp) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <p className="text-lg font-black">העובד/ת לא נמצא/ה</p>
          <Button className="mt-3" variant="outline" onClick={() => navigate("/")}>
            חזרה
          </Button>
        </Card>
      </div>
    );
  }

  const isAM = clients.some((c) => c.accountManagerId === emp.id);
  const ideaPoints = credited.filter(
    (r) => r.ideaOwnerIds.includes(emp.id) && r.status !== "disqualified",
  ).length;
  const amCount = credited.filter(
    (r) => r.accountManagerId === emp.id && r.status !== "disqualified",
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="text-sm font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
      >
        → חזרה
      </button>

      <Card className="flex items-center gap-4">
        <Avatar name={emp.name} size={56} />
        <div>
          <h1 className="text-2xl font-black">{emp.name}</h1>
          {isAM && <Badge tone="accent">מנהל/ת לקוח</Badge>}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="💡 נקודות רעיון" value={ideaPoints} />
        {isAM && <Stat label="🎯 RTM ללקוחות" value={amCount} />}
        <Stat label="סה״כ RTMים" value={credited.length} />
      </div>

      <div>
        <RtmFilterBar value={filter} onChange={setFilter} />
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-ink-soft)]">
            אין RTMים להצגה.
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex items-center justify-between">
      <span className="text-sm font-bold text-[var(--color-ink-soft)]">{label}</span>
      <span className="text-3xl font-black">{value}</span>
    </Card>
  );
}
