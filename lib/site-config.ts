import { siteCopy } from "@/lib/content";

const productionUrl = "https://music.cloudcenter.vn";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? productionUrl;

export const siteConfig = {
  name: siteCopy.name,
  shortName: "Flip-Board",
  title: siteCopy.title,
  description: siteCopy.description,
  tagline: siteCopy.tagline,
  productionUrl,
  author: {
    name: "William Bond",
    url: "https://github.com/tranlap2412",
  },
  repository: "https://github.com/tranlap2412/text-flipping-board",
  url: siteUrl,
  locale: "en_US",
  keywords: [...siteCopy.keywords],
} as const;

export function getSiteUrl(): string {
  return siteConfig.url;
}
