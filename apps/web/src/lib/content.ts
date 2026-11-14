/**
 * Home-page editorial content: advertising banners, the video gallery and the
 * company YouTube channel.
 *
 * Content currently lives in code (the "config file" option) but every section
 * is modelled with stable ids, explicit ordering and an `active` flag so it can
 * later be served from the database / an admin panel without touching the
 * components — only `getHomeContent()` needs to change.
 */

export type AdBanner = {
  id: string;
  order: number;
  active: boolean;
  /** Small label shown above the title, e.g. "Publicidade". */
  sponsor: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  imageUrl: string;
  href: string;
};

export type VideoItem = {
  id: string;
  order: number;
  active: boolean;
  /** The 11-character id from the YouTube watch URL (watch?v=XXXXXXXXXXX). */
  youtubeId: string;
  title: string;
  description?: string;
  durationLabel?: string;
  /** Card aspect: "vertical" for Shorts (9:16), "horizontal" for regular videos (16:9). */
  orientation?: "horizontal" | "vertical";
};

export type YouTubeChannel = {
  name: string;
  /** Null until the real channel URL is configured — sections degrade gracefully. */
  url: string | null;
  handle?: string;
  description?: string;
  subscriberLabel?: string;
};

export type HomeContent = {
  ads: AdBanner[];
  videos: VideoItem[];
  youtube: YouTubeChannel;
};

/*
 * Placeholder advertising banners. Replace with the real advertisers' creatives
 * (image + destination) or hand the whole section over to the database later.
 * Photos reuse the licensed Unsplash assets listed in public/photos/CREDITS.txt.
 */
const ADS: AdBanner[] = [
  {
    id: "ad-1",
    order: 1,
    active: true,
    sponsor: "Publicidade",
    title: "Anuncie aqui",
    description: "Divulgue a sua marca num dos sites imobiliários de referência em Luanda.",
    ctaLabel: "Falar com a Regis",
    imageUrl: "/photos/city.jpg",
    href: "/contacto",
  },
  {
    id: "ad-2",
    order: 2,
    active: true,
    sponsor: "Publicidade",
    title: "Espaço publicitário",
    description: "Este espaço está disponível para o seu negócio. Fale connosco.",
    ctaLabel: "Reservar espaço",
    imageUrl: "/photos/interior.jpg",
    href: "/contacto",
  },
];

/*
 * Video gallery. Add a video by copying the id from its URL, e.g. for
 * https://www.youtube.com/shorts/rFBPGPCokaM the id is "rFBPGPCokaM".
 * Titles are normalised from the source (hashtags, prices and phone numbers
 * removed) — edit freely. While the list is empty the section shows a tasteful
 * empty state instead of an embed.
 */
const VIDEOS: VideoItem[] = [
  {
    id: "v1",
    order: 1,
    active: true,
    youtubeId: "rFBPGPCokaM",
    orientation: "vertical",
    title: "Vivenda V3 no Condomínio Real — Talatona, Luanda",
  },
  {
    id: "v2",
    order: 2,
    active: true,
    youtubeId: "XHnFB2CLon4",
    orientation: "vertical",
    title: "Vivenda T4 no Condomínio das Finanças — Lubango",
  },
  {
    id: "v3",
    order: 3,
    active: true,
    youtubeId: "OPXt5RoigDs",
    orientation: "vertical",
    title: "Vivenda T4 junto ao Estádio Tundavala — Lubango",
  },
  {
    id: "v4",
    order: 4,
    active: true,
    youtubeId: "c49GJbE_jL8",
    orientation: "vertical",
    title: "Moradia T6 de luxo na Mapunda — Lubango",
  },
];

const YOUTUBE: YouTubeChannel = {
  name: "Regis Properties",
  url: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL?.trim() || null,
  description:
    "Tours de imóveis, conselhos práticos e novidades do mercado imobiliário em Angola.",
};

/**
 * Single seam between the UI and wherever the content lives. Swap the return
 * value for a database / CMS call once the admin panel (step 3) exists.
 */
export async function getHomeContent(): Promise<HomeContent> {
  const byOrder = <T extends { active: boolean; order: number }>(items: T[]): T[] =>
    items.filter((item) => item.active).sort((a, b) => a.order - b.order);

  return {
    ads: byOrder(ADS),
    videos: byOrder(VIDEOS),
    youtube: YOUTUBE,
  };
}
