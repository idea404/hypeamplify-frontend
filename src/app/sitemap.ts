// src/app/sitemap.ts
import { MetadataRoute } from 'next'

const URL = 'https://hypeamplify.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core public pages
    {
      url: `${URL}/`, // Homepage
      lastModified: new Date(),
      changeFrequency: 'weekly', // Adjust if your homepage content changes more/less often
      priority: 1.0, // Highest priority
    },
    {
      url: `${URL}/payments`, // Payments page
      lastModified: new Date(),
      changeFrequency: 'monthly', // Adjust if packages change often
      priority: 0.8, // High priority
    },
    {
      url: `${URL}/auth/login`, // Login page
      lastModified: new Date(),
      changeFrequency: 'monthly', // Unlikely to change often
      priority: 0.7, // Medium priority
    },
    {
      url: `${URL}/auth/register`, // Register page
      lastModified: new Date(),
      changeFrequency: 'monthly', // Unlikely to change often
      priority: 0.7, // Medium priority
    },
    // Payment result pages (lower priority, less important for SEO)
    {
      url: `${URL}/payment/success`, // Payment success page
      lastModified: new Date(),
      changeFrequency: 'yearly', // Very unlikely to change
      priority: 0.5, // Low priority
    },
    {
      url: `${URL}/payment/cancel`, // Payment cancel page
      lastModified: new Date(),
      changeFrequency: 'yearly', // Very unlikely to change
      priority: 0.5, // Low priority
    },
    // --- Add any other PUBLIC static pages here ---
    // Example:
    // {
    //   url: `${URL}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'yearly',
    //   priority: 0.6,
    // },
  ]
}