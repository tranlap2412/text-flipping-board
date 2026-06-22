import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05080c",
    theme_color: "#0a0f14",
    lang: "en",
    orientation: "any",
    categories: ["entertainment", "utilities"],
  };
}
