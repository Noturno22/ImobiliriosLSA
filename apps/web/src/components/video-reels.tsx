"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { VideoComment, VideoReel } from "@/lib/videos";
import { whatsappLink } from "@/lib/site";

interface ReelLikeState {
  count: number;
  liked: boolean;
}

interface Reel extends VideoReel {
  likes: ReelLikeState;
  commentCount: number;
}

const ANON_KEY = "regis_anon_id";

function getAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = `a${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function Player({ reel, active, muted, onToggleMute }: {
  reel: Reel;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && !userPaused) {
      el.play().catch(() => {
        /* autoplay blocked — user can tap play */
      });
    } else {
      el.pause();
    }
  }, [active, userPaused]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  if (reel.playback.kind === "youtube") {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${reel.playback.id}?autoplay=${active ? 1 : 0}&mute=${muted ? 1 : 0}&rel=0&playsinline=1`}
        title={reel.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    );
  }

  if (reel.playback.kind === "tiktok") {
    // TikTok embeds require their block widget; fall back to open-in-new-tab card.
    return (
      <div className="absolute inset-0 grid place-items-center bg-navy-deep p-6 text-center">
        <div>
          <p className="text-sm text-white/80">Vídeo TikTok</p>
          <a
            href={reel.playback.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-10 items-center rounded-control bg-accent px-4 text-sm font-semibold text-white"
          >
            Ver no TikTok
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src={reel.playback.url}
        poster={reel.thumbnailUrl ?? undefined}
        loop
        playsInline
        muted={muted}
        controls={false}
        className="absolute inset-0 size-full object-cover"
        onClick={() => setUserPaused((p) => !p)}
      />
      {!active || userPaused ? (
        <button
          type="button"
          onClick={() => setUserPaused(false)}
          aria-label="Reproduzir"
          className="absolute inset-0 grid place-items-center bg-black/30"
        >
          <span className="grid size-16 place-items-center rounded-full bg-accent text-white">
            <svg viewBox="0 0 24 24" className="size-7 translate-x-[2px]" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      ) : null}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Ativar som" : "Silenciar"}
        className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/50 text-white"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M23 9l-6 6M17 9l6 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}

function CommentsPanel({
  videoId,
  open,
  onClose,
  onCountChange,
}: {
  videoId: string;
  open: boolean;
  onClose: () => void;
  onCountChange: (n: number) => void;
}) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(`/api/videos/${encodeURIComponent(videoId)}/comments`)
      .then((r) => r.json())
      .then((data: { items?: VideoComment[] }) => {
        if (!cancelled && data.items) setComments(data.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, videoId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(videoId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          content: content.trim(),
          anonId: getAnonId() || undefined,
        }),
      });
      const data = (await res.json()) as { item?: VideoComment; error?: string };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Não foi possível publicar.");
        return;
      }
      setComments((prev) => [data.item!, ...prev]);
      onCountChange(comments.length + 1);
      setContent("");
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setPosting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Comentários"
      className="absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-line bg-canvas/98 backdrop-blur"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-bold text-navy">Comentários</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar comentários"
          className="grid size-8 place-items-center rounded-full border border-line text-ink hover:border-accent"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && <p className="text-sm text-ink-muted">A carregar…</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-ink-muted">Ainda não há comentários. Seja o primeiro!</p>
        )}
        {comments.map((c) => (
          <article key={c.id} className="rounded-control border border-line bg-canvas-soft p-3">
            <p className="text-xs font-semibold text-navy">{c.author}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{c.content}</p>
            <time className="mt-1 block text-[11px] text-ink-subtle" dateTime={c.createdAt}>
              {new Date(c.createdAt).toLocaleString("pt-AO")}
            </time>
          </article>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-line p-3 space-y-2">
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="O seu nome"
          maxLength={60}
          required
          className="h-10 w-full rounded-control border border-line bg-canvas px-3 text-sm outline-none focus:border-accent"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário…"
          rows={2}
          maxLength={800}
          required
          className="w-full rounded-control border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={posting}
          className="h-10 w-full rounded-control bg-accent text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {posting ? "A publicar…" : "Publicar"}
        </button>
      </form>
    </div>
  );
}

function ActionButton({
  label,
  count,
  active,
  onClick,
  children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count != null ? `${label} (${count})` : label}
      aria-pressed={active}
      className="flex flex-col items-center gap-1 text-white drop-shadow"
    >
      <span
        className={`grid size-12 place-items-center rounded-full bg-black/45 backdrop-blur transition-colors ${
          active ? "text-danger" : "text-white"
        }`}
      >
        {children}
      </span>
      {count != null && (
        <span className="text-xs font-semibold tabular-nums">{count}</span>
      )}
    </button>
  );
}

export function VideoReels({ initialReels }: { initialReels: Reel[] }) {
  const [reels, setReels] = useState(initialReels);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevInitialReels, setPrevInitialReels] = useState(initialReels);

  // Sync state during render if the server re-renders with new props.
  if (initialReels !== prevInitialReels) {
    setPrevInitialReels(initialReels);
    setReels(initialReels);
  }

  const scrollTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(i, reels.length - 1));
    const container = containerRef.current;
    const child = container?.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIndex(clamped);
  }, [reels.length]);

  // IntersectionObserver → active index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const i = Array.from(container.children).indexOf(entry.target);
            if (i >= 0) setIndex(i);
          }
        }
      },
      { root: container, threshold: [0.6] },
    );
    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [reels.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollTo(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollTo(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, scrollTo]);

  const toggleLike = async (reel: Reel) => {
    const prev = reels;
    setReels((list) =>
      list.map((r) =>
        r.id === reel.id
          ? {
              ...r,
              likes: {
                count: r.likes.liked ? r.likes.count - 1 : r.likes.count + 1,
                liked: !r.likes.liked,
              },
            }
          : r,
      ),
    );
    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(reel.id)}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId: getAnonId() }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { count: number; liked: boolean };
      setReels((list) =>
        list.map((r) => (r.id === reel.id ? { ...r, likes: { count: data.count, liked: data.liked } } : r)),
      );
    } catch {
      setReels(prev); // rollback
    }
  };

  const current = reels[index];

  if (reels.length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center rounded-card border border-dashed border-line-strong bg-canvas-soft p-10 text-center">
        <div>
          <p className="font-display text-lg font-bold text-navy">Ainda não há vídeos</p>
          <p className="mt-2 text-sm text-ink-muted">
            Assim que publicarmos tours em vídeo, eles aparecem aqui.
          </p>
          <Link
            href="/imoveis"
            className="mt-5 inline-flex h-10 items-center rounded-control bg-accent px-5 text-sm font-semibold text-white"
          >
            Ver imóveis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Position indicator + prev/next */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-semibold text-ink-muted">
          {index + 1} / {reels.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            disabled={index === 0}
            aria-label="Vídeo anterior"
            className="grid size-9 place-items-center rounded-full border border-line bg-canvas text-ink hover:border-accent disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            disabled={index >= reels.length - 1}
            aria-label="Vídeo seguinte"
            className="grid size-9 place-items-center rounded-full border border-line bg-canvas text-ink hover:border-accent disabled:opacity-40"
          >
            ↓
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[70vh] snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-card border border-line bg-navy-deep sm:h-[75vh]"
        tabIndex={0}
        aria-label="Feed de vídeos"
      >
        {reels.map((reel, i) => {
          const active = i === index;
          return (
            <section
              key={reel.id}
              aria-label={reel.title}
              aria-hidden={!active}
              className="relative h-full w-full snap-start overflow-hidden"
            >
              <Player
                reel={reel}
                active={active}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
              />

              {/* Overlay content */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pb-6 pr-20">
                <div className="pointer-events-auto max-w-md space-y-2">
                  {reel.propertyTitle ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                        {reel.propertyRef ? `Ref. ${reel.propertyRef}` : "Imóvel"}
                      </p>
                      <h2 className="font-display text-lg font-bold leading-snug text-white">
                        {reel.propertyTitle}
                      </h2>
                      {reel.propertyLocation && (
                        <p className="text-sm text-white/80">{reel.propertyLocation}</p>
                      )}
                      {reel.propertyPriceLabel && (
                        <p className="font-display text-xl font-extrabold text-white">
                          {reel.propertyPriceLabel}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {reel.propertySlug && (
                          <Link
                            href={`/imoveis/${reel.propertySlug}`}
                            className="inline-flex h-9 items-center rounded-control bg-accent px-4 text-xs font-semibold text-white hover:bg-accent-hover"
                          >
                            Ver imóvel
                          </Link>
                        )}
                        <ContactLink reel={reel} />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display text-lg font-bold leading-snug text-white">
                        {reel.title}
                      </h2>
                      {reel.description && (
                        <p className="text-sm text-white/75">{reel.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <ContactLink reel={reel} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right action rail */}
              <div className="absolute bottom-24 right-3 z-10 flex flex-col gap-4">
                <ActionButton
                  label="Curtir"
                  count={reel.likes.count}
                  active={reel.likes.liked}
                  onClick={() => toggleLike(reel)}
                >
                  <svg viewBox="0 0 24 24" className="size-6" fill={reel.likes.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ActionButton>
                <ActionButton
                  label="Comentários"
                  count={reel.commentCount}
                  onClick={() => setCommentsOpen(true)}
                >
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ActionButton>
              </div>

              {/* Comments drawer for active reel */}
              {active && commentsOpen && (
                <CommentsPanel
                  videoId={reel.id}
                  open={commentsOpen}
                  onClose={() => setCommentsOpen(false)}
                  onCountChange={(n) =>
                    setReels((list) =>
                      list.map((r) => (r.id === reel.id ? { ...r, commentCount: n } : r)),
                    )
                  }
                />
              )}
            </section>
          );
        })}
      </div>

      {current && (
        <p className="sr-only">
          Vídeo {index + 1} de {reels.length}: {current.title}
        </p>
      )}
    </div>
  );
}

function ContactLink({ reel }: { reel: Reel }) {
  if (reel.propertySlug) {
    return (
      <Link
        href={`/imoveis/${reel.propertySlug}#pedido`}
        className="inline-flex h-9 items-center rounded-control border border-white/40 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
      >
        Contactar
      </Link>
    );
  }
  const wa = whatsappLink(
    `Olá! Gostaria de saber mais sobre: ${reel.title}`,
  );
  if (wa) {
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center rounded-control border border-white/40 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
      >
        Contactar
      </a>
    );
  }
  return (
    <Link
      href="/contacto"
      className="inline-flex h-9 items-center rounded-control border border-white/40 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
    >
      Contactar
    </Link>
  );
}
