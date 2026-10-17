import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Serrote Imobiliária",
    short_name: "Serrote",
    description:
      "Casas, apartamentos e terrenos em Angola — compra, venda, arrendamento e consultoria imobiliária.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#20334B",
    lang: "pt",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
