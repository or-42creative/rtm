import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { createRtm, updateRtm } from "@/lib/db";
import { fileToCompressedDataUrl } from "@/lib/image";
import { parseSocial } from "@/lib/social";
import { monthKeyOf } from "@/lib/scores";
import type { MediaType, Rtm } from "@/types";
import {
  Button,
  Card,
  Field,
  FullScreen,
  SectionTitle,
  cn,
  inputClass,
} from "@/components/ui";
import { MediaPreview } from "@/components/MediaPreview";

const today = () => new Date().toISOString().slice(0, 10);
const dateToInput = (rtm: Rtm): string => {
  const d = rtm.date?.toDate?.() ?? new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export function SubmitRtmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { activeClients, activeEmployees, employeeName, rtms, settings, t } = useAppData();
  const maxOwners = settings.maxIdeaOwners;

  const editing = Boolean(id);
  const existing = id ? rtms.find((r) => r.id === id) : null;
  const canEdit =
    !editing ||
    (existing != null &&
      (appUser?.role === "admin" || existing.createdByUid === appUser?.uid));

  const [name, setName] = useState(existing?.name ?? "");
  const [clientId, setClientId] = useState(existing?.clientId ?? "");
  const [ideaOwnerIds, setIdeaOwnerIds] = useState<string[]>(existing?.ideaOwnerIds ?? []);
  const [link, setLink] = useState(existing?.link ?? "");
  const [date, setDate] = useState(existing ? dateToInput(existing) : today());
  const [file, setFile] = useState<File | null>(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill when editing (once the RTM is available).
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setClientId(existing.clientId);
    setIdeaOwnerIds(existing.ideaOwnerIds);
    setLink(existing.link);
    setDate(dateToInput(existing));
    setFile(null);
    setRemoveMedia(false);
  }, [existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const client = activeClients.find((c) => c.id === clientId) ?? null;
  const social = useMemo(() => parseSocial(link), [link]);
  const keptImage =
    editing && !file && !removeMedia && existing?.mediaType === "image" && existing?.mediaUrl
      ? existing.mediaUrl
      : null;

  const addOwner = (ownerId: string) => {
    if (!ownerId || ideaOwnerIds.includes(ownerId) || ideaOwnerIds.length >= maxOwners) return;
    setIdeaOwnerIds((prev) => [...prev, ownerId]);
  };
  const removeOwner = (ownerId: string) =>
    setIdeaOwnerIds((prev) => prev.filter((x) => x !== ownerId));

  const canSubmit =
    name.trim() && clientId && ideaOwnerIds.length >= 1 && link.trim() && date;

  const submit = async () => {
    if (!canSubmit || !client || !appUser) return;
    setSaving(true);
    setError(null);
    try {
      let mediaType: MediaType = "none";
      let mediaUrl: string | null = null;
      let embedUrl: string | null = null;

      if (file) {
        mediaUrl = await fileToCompressedDataUrl(file);
        mediaType = "image";
      } else if (keptImage) {
        mediaType = "image";
        mediaUrl = keptImage;
      } else if (social?.iframeSrc) {
        mediaType = "embed";
        embedUrl = social.url;
      }

      const payload = {
        name: name.trim(),
        clientId: client.id,
        clientName: client.name,
        ideaOwnerIds,
        accountManagerId: client.accountManagerId,
        link: link.trim(),
        mediaType,
        mediaUrl,
        embedUrl,
        date: new Date(`${date}T12:00:00`),
      };

      if (editing && id) {
        await updateRtm(id, payload);
      } else {
        await createRtm({
          ...payload,
          createdByUid: appUser.uid,
          createdByEmployeeId: appUser.employeeId ?? null,
        });
      }
      navigate("/me");
    } catch (e) {
      console.error(e);
      setError(t("submit.error"));
      setSaving(false);
    }
  };

  if (editing && existing && !canEdit) {
    return (
      <FullScreen>
        <Card className="max-w-md text-center">
          <p className="text-lg font-black">אין לך הרשאה לערוך RTM זה</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            אפשר לערוך רק RTM שאת/ה העלית (או דרך מנהל המערכת).
          </p>
          <Link to="/me">
            <Button className="mt-4" variant="outline">
              חזרה ל‑RTMים שלי
            </Button>
          </Link>
        </Card>
      </FullScreen>
    );
  }

  const ownerOptions = activeEmployees.filter((e) => !ideaOwnerIds.includes(e.id));
  const previewType: MediaType = file ? "image" : keptImage ? "image" : "embed";
  const previewUrl = file ? URL.createObjectURL(file) : keptImage;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black">{editing ? "עריכת RTM" : t("submit.heading")}</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t("submit.intro")}</p>

      <Card className="mt-5 space-y-5">
        <Field label={t("submit.name")} required>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("submit.namePh")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("submit.client")} required>
            <select
              className={inputClass}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">{t("submit.clientPh")}</option>
              {activeClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("submit.date")} required hint={t("submit.dateHint")}>
            <input
              type="date"
              className={inputClass}
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        {client && (
          <p className="-mt-2 text-xs text-[var(--color-ink-soft)]">
            {t("submit.amNote", { name: employeeName(client.accountManagerId) })}
          </p>
        )}

        <Field label={t("submit.idea")} required hint={t("submit.ideaHint", { max: maxOwners })}>
          <div className="space-y-2">
            {ideaOwnerIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ideaOwnerIds.map((ownerId) => (
                  <span
                    key={ownerId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] py-1 pe-1 ps-3 text-sm font-bold text-white"
                  >
                    {employeeName(ownerId)}
                    <button
                      type="button"
                      onClick={() => removeOwner(ownerId)}
                      className="grid size-5 place-items-center rounded-full bg-white/20 hover:bg-white/30"
                      aria-label="הסרה"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            {ideaOwnerIds.length < maxOwners && (
              <select className={inputClass} value="" onChange={(e) => addOwner(e.target.value)}>
                <option value="">
                  {ideaOwnerIds.length === 0 ? t("submit.ideaPh") : t("submit.ideaPhMore")}
                </option>
                {ownerOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Field>

        <Field label={t("submit.link")} required hint={t("submit.linkHint")}>
          <input
            className={inputClass}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            dir="ltr"
          />
        </Field>

        <Field
          label={editing && keptImage ? "החלפת תמונה" : t("submit.media")}
          hint={
            social?.iframeSrc ? t("submit.mediaHintEmbed") : t("submit.mediaHintNone")
          }
        >
          <input
            type="file"
            accept="image/*"
            className={cn(
              inputClass,
              "file:me-3 file:rounded-lg file:border-0 file:bg-[var(--color-cloud)] file:px-3 file:py-1.5 file:font-bold",
            )}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {keptImage && (
            <button
              type="button"
              onClick={() => setRemoveMedia(true)}
              className="mt-2 text-xs font-bold text-red-600 hover:underline"
            >
              הסרת התמונה הקיימת
            </button>
          )}
        </Field>

        {(previewUrl || (previewType === "embed" && social?.iframeSrc)) && (
          <div>
            <SectionTitle>{t("submit.preview")}</SectionTitle>
            <div className="mx-auto max-w-sm">
              <MediaPreview mediaType={previewType} mediaUrl={previewUrl} link={link} />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-[var(--color-line)] pt-4">
          <Button onClick={() => void submit()} disabled={!canSubmit || saving}>
            {saving ? "שומר…" : editing ? "שמירת שינויים" : t("submit.button")}
          </Button>
          {!editing && (
            <span className="text-xs text-[var(--color-ink-soft)]">
              יתווסף לחודש {monthKeyOf(new Date(`${date}T12:00:00`))}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
