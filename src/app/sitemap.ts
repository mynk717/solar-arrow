// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://sa.mktgdime.com',          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: 'https://sa.mktgdime.com/login',     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://sa.mktgdime.com/privacy',   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: 'https://sa.mktgdime.com/terms',     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
