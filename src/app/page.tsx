
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, Users, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary h-6 w-6"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="text-lg">DesignCost Pro</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <SignedOut>
              <Button asChild>
                <Link href="/dashboard">
                  Go to App
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Ultimate Costing & Quoting Tool for Interior Designers
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline your projects, create accurate quotes in minutes, and manage your clients—all in one place. Focus on design, we'll handle the numbers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/dashboard">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center p-8 bg-muted rounded-xl">
                 <Calculator className="h-48 w-48 text-primary/20" strokeWidth={1} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  DesignCost Pro is packed with powerful features to help you run a more profitable and efficient design business.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="text-primary"/>
                    Effortless Costing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Quickly build detailed project cost breakdowns. Add materials, labor, and operational costs with our intuitive calculator to see your profit margins in real-time.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary"/>
                    Professional Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate and publish polished, professional quotes from your costings. Impress your clients and win more projects with clear and accurate pricing.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-primary"/>
                    Streamlined Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Keep all your client, project, and property information organized in one central hub. Track communication and link everything together for a complete overview.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Take Control of Your Project Finances?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Start organizing your design business today. Sign up and begin creating your first quote in just a few minutes.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg">
                    <Link href="/dashboard">Start Costing Now</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} DesignCost Pro. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
