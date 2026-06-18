import { useAppData } from "@/lib/appData";
import { DEFAULT_RULES_MD } from "@/data/content";
import { Card } from "@/components/ui";
import { Markdownish } from "@/components/Markdownish";

export function RulesPage() {
  const { settings } = useAppData();
  const rules = settings.content.rules.trim()
    ? settings.content.rules
    : DEFAULT_RULES_MD;
  const prize = settings.content.monthlyPrize.trim();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <div className="animate-fade-up rounded-3xl bg-gradient-to-l from-[var(--c-purple)] via-[var(--c-pink)] to-[var(--c-orange)] p-8 text-white shadow-lg">
        <p className="text-sm font-black text-white/90">תקנון רשמי 📜</p>
        <h1 className="mt-1 text-4xl font-black">תחרות ה‑RTM של 42</h1>
        <p className="mt-2 max-w-xl font-medium text-white/90">
          כאן עושים סושיאל — ומי שתופס את הרגע בזמן אמת, מקבל נקודות.
        </p>
      </div>

      {prize && (
        <Card className="flex items-center gap-3 border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10">
          <span className="text-3xl">🎁</span>
          <div>
            <p className="text-xs font-black text-[#9a7b00]">הפרס של החודש</p>
            <p className="text-lg font-black">{prize}</p>
          </div>
        </Card>
      )}

      <Card>
        <Markdownish text={rules} />
      </Card>

      <p className="pb-4 text-center text-xs text-[var(--color-ink-soft)]">
        התקנון עשוי להתעדכן · ניתן לערוך אותו ממסך הניהול.
      </p>
    </div>
  );
}
