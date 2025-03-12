import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: 'HypeAmplify - Hyper-Contextual X Growth and Engagement',
  description: 'Generate high-performing X suggestions for growth',
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
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
                  <Button asChild size="lg">
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full max-w-md border-0 bg-background/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Analytics-Driven Tweet Generation</CardTitle>
                    <CardDescription>
                      Our AI analyzes your Twitter presence and audience engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-56 w-full overflow-hidden rounded-lg">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-accent to-accent-light opacity-80 blur-2xl">
                        <div className="h-32 w-32 rounded-full bg-white dark:bg-black"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold">HypeAmplify</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      Generate tweets that boost your growth and engagement
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}