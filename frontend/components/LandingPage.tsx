"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoginModal } from "@/components/auth/LoginModal"
import { RegisterModal } from "@/components/auth/RegisterModal"
import { FileText, Zap, Shield, Clock, CheckCircle, ArrowRight, Sparkles } from "lucide-react"

export const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: "One-Click Form Filling",
      description: "Automatically fill government forms with your saved information in seconds.",
    },
    {
      icon: <Shield className="h-8 w-8 text-accent" />,
      title: "Secure & Compliant",
      description: "Bank-level security ensures your sensitive data is always protected.",
    },
    {
      icon: <Clock className="h-8 w-8 text-accent" />,
      title: "Save Time",
      description: "Reduce form filling time from hours to minutes with intelligent automation.",
    },
    {
      icon: <FileText className="h-8 w-8 text-accent" />,
      title: "Government Forms",
      description: "Specialized for official government forms and applications.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Formulated Pro</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowLoginModal(true)}
              className="text-foreground hover:text-accent transition-colors"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setShowRegisterModal(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse-glow"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Automate Your
              <span className="text-accent"> Government Forms</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Stop wasting hours on repetitive form filling. Formulated Pro fills government forms automatically with
              one click, saving you time and reducing errors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowRegisterModal(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3 transition-all duration-200 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-card text-lg px-8 py-3 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Formulated Pro?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for government forms with enterprise-grade security and automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-border hover:border-accent/50 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-accent/20 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Form Filling?
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who have saved countless hours with Formulated Pro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3"
                >
                  Start Your Free Trial
                </Button>
                <div className="flex items-center justify-center text-muted-foreground">
                  <CheckCircle className="h-5 w-5 mr-2 text-accent" />
                  No credit card required
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </div>
  )
}
