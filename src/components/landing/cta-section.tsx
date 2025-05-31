"use client"

import { ArrowRight, CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const benefits = [
  "Free account setup",
  "No monthly fees",
  "24/7 expert support",
  "Secure platform",
  "Money-back guarantee",
]

export function CTASection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardContent className="p-12 sm:p-16 lg:p-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mb-8 text-xl text-muted-foreground">
                Join thousands of satisfied customers who trust Dern Support for their technical needs.
              </p>

              <div className="mb-8 flex flex-wrap justify-center gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to="/register">
                  <Button size="lg" className="group px-8 py-6 text-lg">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required • Free forever plan available
              </p>
            </div>
          </CardContent>

          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        </Card>
      </div>
    </section>
  )
}
