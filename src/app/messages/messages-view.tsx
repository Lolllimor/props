"use client";

import { MessageSquareIcon, SendIcon, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ListingPhoto } from "@/components/listing-photo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useMessages, useSendMessage, useThreads } from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Off-platform payment phrases we warn about inside the chat. */
const RISKY = /(transfer|account number|pay (me|first)|registration fee|inspection fee|whatsapp|send money)/i;

export function MessagesView() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: threads, isPending } = useThreads();
  const activeId = params.get("thread") ?? threads?.[0]?.id ?? "";
  const active = threads?.find((t) => t.id === activeId);

  return (
    <div className="container py-6">
      <h1 className="mb-4 font-semibold text-2xl">Messages</h1>
      <Card className="grid min-h-[60vh] grid-cols-1 gap-0 overflow-hidden p-0 md:grid-cols-[300px_1fr]">
        <nav aria-label="Conversations" className={cn("border-e", activeId && "hidden md:block")}>
          {isPending ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            threads?.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => router.replace(`/messages?thread=${t.id}`, { scroll: false })}
                aria-current={t.id === activeId ? "true" : undefined}
                className="flex w-full items-center gap-3 border-b p-3 text-left hover:bg-accent aria-[current=true]:bg-accent"
              >
                <ListingPhoto hue={t.listing.hue} className="size-11 shrink-0 rounded-lg" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-sm">{t.withName}</span>
                  <span className="truncate text-muted-foreground text-xs">{t.last?.body ?? t.listing.title}</span>
                </span>
              </button>
            ))
          )}
        </nav>
        {active ? (
          <Conversation
            key={active.id}
            threadId={active.id}
            withName={active.withName}
            listingId={active.listing.id}
            listingTitle={active.listing.title}
            onBack={() => router.replace("/messages?thread=", { scroll: false })}
          />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><MessageSquareIcon /></EmptyMedia>
              <EmptyTitle>Pick a conversation</EmptyTitle>
              <EmptyDescription>Every chat is tied to a listing, so there’s a record if anything goes wrong.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card>
    </div>
  );
}

function Conversation({
  threadId,
  withName,
  listingId,
  listingTitle,
  onBack,
}: {
  threadId: string;
  withName: string;
  listingId: string;
  listingTitle: string;
  onBack: () => void;
}) {
  const { data: messages, refetch } = useMessages(threadId);
  const send = useSendMessage(threadId);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const risky = messages?.some((m) => m.from === "them" && RISKY.test(m.body)) || RISKY.test(draft);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    send.mutate(body, { onSuccess: () => { setDraft(""); refetch(); } });
  }

  return (
    <section className="flex min-h-[60vh] flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={onBack}>Back</Button>
        <div className="flex min-w-0 flex-col">
          <span className="font-medium">{withName}</span>
          <Link href={`/listings/${listingId}`} className="truncate text-muted-foreground text-xs hover:underline">{listingTitle}</Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
        {messages?.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
              m.from === "me" ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted",
            )}
          >
            <p>{m.body}</p>
            <p className={cn("mt-1 text-[11px]", m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>
              {formatDateTime(m.sentAt)}
            </p>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      {risky && (
        <div className="px-4 pb-2">
          <Alert variant="warning">
            <ShieldAlertIcon />
            <AlertDescription>
              Keep payments in the app. Never transfer money to inspect or “hold” a home — we can’t protect payments made outside the app.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()} loading={send.isPending}>
          <SendIcon />
        </Button>
      </form>
    </section>
  );
}
