import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regis Properties",
    short_name: "Regis",
    description:
      "Casas, apartamentos e terrenos em Angola — compra, venda, arrendamento e consultoria imobiliária.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0F2B4C",
    lang: "pt",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
