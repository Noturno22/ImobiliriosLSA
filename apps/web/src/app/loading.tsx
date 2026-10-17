import Image from "next/image";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-canvas px-6"
    >
      <div className="flex flex-col items-center">
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={1391}
          height={984}
          priority
          className="sr-load-logo h-20 w-auto sm:h-24"
        />
        <p className="mt-6 font-display text-[0.7rem] font-bold uppercase tracking-[0.32em] text-ink-subtle">
          Serrote Imobiliária
        </p>
        <span
          aria-hidden
          className="relative mt-5 block h-1 w-40 overflow-hidden rounded-full bg-canvas-muted"
        >
          <span className="sr-load-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-orange" />
        </span>
        <span className="sr-only">A carregar…</span>
      </div>
    </div>
  );
}
