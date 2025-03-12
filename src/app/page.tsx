import Link from 'next/link'
import { Metadata } from 'next'
import MainNav from '@/components/layout/MainNav'

export const metadata: Metadata = {
  title: 'HypeAmplify - Hyper-Contextual X Growth and Engagement',
  description: 'Generate high-performing X suggestions for growth',
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Supercharge Your Twitter Presence
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Get AI-powered tweet suggestions based on your Twitter profile and audience. 
                    HypeAmplify analyzes your content and generates high-performing tweets.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/auth/register"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-primary dark:text-gray-50 dark:hover:bg-primary/90 dark:focus-visible:ring-gray-300"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-[450px]">
                  {/* Placeholder for a custom image or animation */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-light opacity-80 blur-2xl">
                    <div className="h-64 w-64 rounded-full bg-white dark:bg-black"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-4 text-center">
                    <div className="text-lg font-bold">Analytics-Driven Tweet Generation</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Our AI analyzes your Twitter presence and audience engagement to generate tweets that boost your growth
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-gray-500 dark:text-gray-400 md:text-left">
              © 2023 HypeAmplify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}