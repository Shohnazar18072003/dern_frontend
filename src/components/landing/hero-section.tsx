"use client"

import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 transform">
          <div className="h-[800px] w-[800px] rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Trusted by 10,000+ customers
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Expert Support
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}
              When You Need It
            </span>
          </h1>

          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            Connect with certified technicians and get professional support for all your technical needs. Fast,
            reliable, and available 24/7.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="group px-8 py-6 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/technicians">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Browse Experts
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-500" />
              Secure & encrypted
            </div>
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              24/7 availability
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
