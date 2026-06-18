import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { Button, Card, FullScreen } from "@/components/ui";
import { Logo } from "@/components/Logo";

/** Shown when a signed-in account's email isn't matched to any employee. */
export function NotLinkedPage() {
  const { firebaseUser, signOut } = useAuth();
  const { t } = useAppData();
  return (
    <FullScreen>
      <Card className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo size={48} withWordmark={false} />
        </div>
        <h1 className="mt-5 text-2xl font-black">{t("link.notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          {t("link.notFoundBody", { email: firebaseUser?.email ?? "" })}
        </p>
        <Button
          block
          variant="outline"
          className="mt-6"
          onClick={() => void signOut()}
        >
          {t("link.other")}
        </Button>
      </Card>
    </FullScreen>
  );
}
