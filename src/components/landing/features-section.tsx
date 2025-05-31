"use client"

import { Clock, Shield, Users, Zap, MessageSquare, Star, CheckCircle, Headphones } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock technical assistance whenever you need it most.",
    color: "text-blue-500",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security to protect your data and communications.",
    color: "text-green-500",
  },
  {
    icon: Users,
    title: "Expert Technicians",
    description: "Certified professionals with years of experience in their fields.",
    color: "text-purple-500",
  },
  {
    icon: Zap,
    title: "Fast Response",
    description: "Average response time under 5 minutes for urgent issues.",
    color: "text-yellow-500",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Instant messaging with screen sharing and file transfer capabilities.",
    color: "text-pink-500",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "100% satisfaction guarantee with our quality assurance program.",
    color: "text-orange-500",
  },
]

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Issues Resolved", value: "1M+", icon: CheckCircle },
  { label: "Expert Technicians", value: "2K+", icon: Headphones },
  { label: "Customer Satisfaction", value: "99.9%", icon: Star },
]

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Why Choose Dern Support?
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Everything you need for professional technical support in one platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-lg"
            >
              <CardHeader>
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>

              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
