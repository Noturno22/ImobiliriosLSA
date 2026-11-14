import type { YouTubeChannel } from "@/lib/content";

/**
 * YouTube channel area. Renders only once a real channel URL is configured
 * (NEXT_PUBLIC_YOUTUBE_CHANNEL_URL) — never links to an unverified channel.
 */
export function YouTubeChannelSection({ channel }: { channel: YouTubeChannel }) {
  if (!channel.url) return null;

  return (
    <section aria-labelledby="canal-youtube" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-card bg-navy-deep shadow-card">
        <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:gap-12 lg:p-12">
          <span aria-hidden className="grid size-16 place-items-center rounded-2xl bg-[#ff0000] text-white">
            <svg viewBox="0 0 24 24" className="size-8" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
            </svg>
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Canal do YouTube</p>
            <h2
              id="canal-youtube"
              className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
            >
              {channel.name}
            </h2>
            {channel.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                {channel.description}
              </p>
            )}
            {channel.subscriberLabel && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold">
                {channel.subscriberLabel}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff0000] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#d90000]"
            >
              Subscrever canal
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
