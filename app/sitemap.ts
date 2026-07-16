import { MetadataRoute } from 'next'
import { imageTools, textTools, devTools, efficiencyTools, fileTools, dataTools } from '@/src/data/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://snapkits.app'
  const locales = ['zh', 'en'] as const
  const today = new Date()

  const staticPages: { path: string; priority: number }[] = [
    { path: '', priority: 1.0 },
    { path: 'about', priority: 0.6 },
    { path: 'tools', priority: 0.9 },
  ]

  const allToolKeys = [
    ...imageTools,
    ...textTools,
    ...devTools,
    ...efficiencyTools,
    ...fileTools,
    ...dataTools,
  ].map((t) => t.key)

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    const otherLocale = locales.find((l) => l !== locale)!

    for (const { path, priority } of staticPages) {
      const localePath = path ? `/${locale}/${path}` : `/${locale}`
      const otherPath = path ? `/${otherLocale}/${path}` : `/${otherLocale}`

      entries.push({
        url: `${baseUrl}${localePath}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority,
        alternates: {
          languages: {
            [otherLocale]: `${baseUrl}${otherPath}`,
          },
        },
      })
    }

    for (const key of allToolKeys) {
      entries.push({
        url: `${baseUrl}/${locale}/tools/${key}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            [otherLocale]: `${baseUrl}/${otherLocale}/tools/${key}`,
          },
        },
      })
    }
  }

  return entries
}
