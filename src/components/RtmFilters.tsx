import type { Rtm } from "@/types";
import { cn, inputClass, selectInline } from "./ui";

export interface RtmFilter {
  search: string;
  status: "all" | "active" | "disqualified";
  sort: "newest" | "oldest";
}

export const defaultRtmFilter: RtmFilter = {
  search: "",
  status: "all",
  sort: "newest",
};

const time = (r: Rtm) => r.date?.toDate?.()?.getTime?.() ?? 0;

/** Pure search + status filter + date sort. */
export function applyRtmFilter(rtms: Rtm[], f: RtmFilter): Rtm[] {
  const q = f.search.trim().toLowerCase();
  const out = rtms.filter((r) => {
    const dq = r.status === "disqualified";
    if (f.status === "active" && dq) return false;
    if (f.status === "disqualified" && !dq) return false;
    if (q && !`${r.name} ${r.clientName}`.toLowerCase().includes(q)) return false;
    return true;
  });
  return out.sort((a, b) => (f.sort === "newest" ? time(b) - time(a) : time(a) - time(b)));
}

export function RtmFilterBar({
  value,
  onChange,
}: {
  value: RtmFilter;
  onChange: (f: RtmFilter) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        className={cn(inputClass, "max-w-xs")}
        placeholder="חיפוש לפי שם RTM או לקוח…"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
      <select
        className={cn(selectInline, "w-36")}
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as RtmFilter["status"] })}
      >
        <option value="all">כל הסטטוסים</option>
        <option value="active">פעילים בלבד</option>
        <option value="disqualified">שנפסלו בלבד</option>
      </select>
      <select
        className={cn(selectInline, "w-36")}
        value={value.sort}
        onChange={(e) => onChange({ ...value, sort: e.target.value as RtmFilter["sort"] })}
      >
        <option value="newest">מהחדש לישן</option>
        <option value="oldest">מהישן לחדש</option>
      </select>
    </div>
  );
}
