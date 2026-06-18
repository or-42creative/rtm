import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { createRtm } from "@/lib/db";
import { fileToCompressedDataUrl } from "@/lib/image";
import { parseSocial } from "@/lib/social";
import { monthKeyOf } from "@/lib/scores";
import type { MediaType } from "@/types";
import {
  Button,
  Card,
  Field,
  SectionTitle,
  cn,
  inputClass,
} from "@/components/ui";
import { MediaPreview } from "@/components/MediaPreview";

const today = () => new Date().toISOString().slice(0, 10);

export function SubmitRtmPage() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { activeClients, activeEmployees, employeeName, settings, t } = useAppData();
  const maxOwners = settings.maxIdeaOwners;

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [ideaOwnerIds, setIdeaOwnerIds] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [date, setDate] = useState(today());
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = activeClients.find((c) => c.id === clientId) ?? null;
  const social = useMemo(() => parseSocial(link), [link]);

  const addOwner = (id: string) => {
    if (!id || ideaOwnerIds.includes(id) || ideaOwnerIds.length >= maxOwners) return;
    setIdeaOwnerIds((prev) => [...prev, id]);
  };
  const removeOwner = (id: string) =>
    setIdeaOwnerIds((prev) => prev.filter((x) => x !== id));

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
      } else if (social?.iframeSrc) {
        mediaType = "embed";
        embedUrl = social.url;
      }

      await createRtm({
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
        createdByUid: appUser.uid,
        createdByEmployeeId: appUser.employeeId ?? null,
      });
      navigate("/me");
    } catch (e) {
      console.error(e);
      setError(t("submit.error"));
      setSaving(false);
    }
  };

  const ownerOptions = activeEmployees.filter((e) => !ideaOwnerIds.includes(e.id));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black">{t("submit.heading")}</h1>
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
                {ideaOwnerIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] py-1 pe-1 ps-3 text-sm font-bold text-white"
                  >
                    {employeeName(id)}
                    <button
                      type="button"
                      onClick={() => removeOwner(id)}
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
              <select
                className={inputClass}
                value=""
                onChange={(e) => addOwner(e.target.value)}
              >
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
          label={t("submit.media")}
          hint={social?.iframeSrc ? t("submit.mediaHintEmbed") : t("submit.mediaHintNone")}
        >
          <input
            type="file"
            accept="image/*"
            className={cn(inputClass, "file:me-3 file:rounded-lg file:border-0 file:bg-[var(--color-cloud)] file:px-3 file:py-1.5 file:font-bold")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>

        {(file || social?.iframeSrc) && (
          <div>
            <SectionTitle>{t("submit.preview")}</SectionTitle>
            <div className="mx-auto max-w-sm">
              <MediaPreview
                mediaType={file ? "image" : "embed"}
                mediaUrl={file ? URL.createObjectURL(file) : null}
                link={link}
              />
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
            {saving ? "שומר…" : t("submit.button")}
          </Button>
          <span className="text-xs text-[var(--color-ink-soft)]">
            יתווסף לחודש {monthKeyOf(new Date(`${date}T12:00:00`))}
          </span>
        </div>
      </Card>
    </div>
  );
}
