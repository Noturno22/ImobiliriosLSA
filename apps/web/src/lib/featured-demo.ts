import type { CarouselItem } from "@/components/property-carousel";

/**
 * Placeholder inventory used only when the database returns fewer than three
 * featured properties (e.g. before seeding). In production the section is fed
 * from the database; this array exists so the carousel component can be
 * reviewed and QA'd. Every photo is an Unsplash License asset — see
 * public/photos/CREDITS.txt.
 */
export const DEMO_FEATURED: CarouselItem[] = [
  {
    id: "demo-1",
    href: "/imoveis",
    badge: "Venda",
    price: "Kz 250.000.000",
    title: "Moradia T4 - Condomínio Fechado",
    location: "Talatona, Luanda",
    bedrooms: 4,
    bathrooms: 5,
    area: "450 m²",
    image: "/photos/prop-1.jpg",
  },
  {
    id: "demo-2",
    href: "/imoveis",
    badge: "Venda",
    price: "Kz 120.000.000",
    title: "Apartamento T3 - V. Branca",
    location: "Viana, Luanda",
    bedrooms: 3,
    bathrooms: 3,
    area: "180 m²",
    image: "/photos/prop-2.jpg",
  },
  {
    id: "demo-3",
    href: "/imoveis",
    badge: "Arrendamento",
    price: "Kz 2.500.000/mês",
    title: "Moradia T3 - Mobiliada",
    location: "Ingombota, Luanda",
    bedrooms: 3,
    bathrooms: 4,
    area: "300 m²",
    image: "/photos/prop-3.jpg",
  },
  {
    id: "demo-4",
    href: "/imoveis",
    badge: "Venda",
    price: "Kz 320.000.000",
    title: "Moradia T4 - Vista Mar",
    location: "Cacuaco, Luanda",
    bedrooms: 4,
    bathrooms: 4,
    area: "420 m²",
    image: "/photos/prop-4.jpg",
  },
  {
    id: "demo-5",
    href: "/imoveis",
    badge: "Venda",
    price: "Kz 180.000.000",
    title: "Moradia T3 - Jardim",
    location: "Belas, Luanda",
    bedrooms: 3,
    bathrooms: 3,
    area: "260 m²",
    image: "/photos/prop-5.jpg",
  },
];
