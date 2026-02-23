import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Wallet,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PriceTicker from '@/components/common/PriceTicker';

const features = [
  {
    icon: Shield,
    title: 'Secure Trading',
    description: 'Your funds are protected with industry-leading security measures and escrow system.',
  },
  {
    icon: Zap,
    title: 'Instant Transactions',
    description: 'Complete trades in minutes with our fast and efficient P2P trading platform.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock to assist you.',
  },
  {
    icon: Users,
    title: 'Active Community',
    description: 'Join thousands of traders who trust our platform for their crypto needs.',
  },
  {
    icon: TrendingUp,
    title: 'Best Rates',
    description: 'Get competitive rates with zero hidden fees on all transactions.',
  },
  {
    icon: Wallet,
    title: 'Multiple Payment Methods',
    description: 'Support for UPI, Bank Transfer, Paytm, and more payment options.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up in seconds with your email and complete KYC verification.',
  },
  {
    number: '02',
    title: 'Add Payment Method',
    description: 'Link your UPI ID or bank account for seamless transactions.',
  },
  {
    number: '03',
    title: 'Start Trading',
    description: 'Buy or sell USDT with INR at the best market rates.',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Trader',
    content: 'The best P2P platform I have used. Fast, secure, and great customer support!',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Investor',
    content: 'Amazing rates and instant transactions. Highly recommended for crypto trading.',
    rating: 5,
  },
  {
    name: 'Amit Kumar',
    role: 'Day Trader',
    content: 'The referral program is fantastic. I have earned significant passive income!',
    rating: 5,
  },
];

const stats = [
  { label: 'Active Users', value: '50K+' },
  { label: 'Daily Volume', value: '₹10Cr+' },
  { label: 'Success Rate', value: '99.9%' },
  { label: 'Support Rating', value: '4.9/5' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4">
                India's #1 USDT P2P Platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Buy & Sell USDT
                <span className="text-primary"> Instantly</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Secure, fast, and reliable P2P trading platform. Trade USDT with INR using your preferred payment method with zero hidden fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No KYC for small trades
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  0% Trading Fee
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <PriceTicker showChange />
                  </div>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-background p-4">
                      <p className="text-sm text-muted-foreground">Buy Orders</p>
                      <p className="text-2xl font-bold text-green-500">1,234</p>
                    </div>
                    <div className="rounded-lg bg-background p-4">
                      <p className="text-sm text-muted-foreground">Sell Orders</p>
                      <p className="text-2xl font-bold text-red-500">987</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose CryptoP2P?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the best P2P trading platform with features designed for security, speed, and convenience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with CryptoP2P in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied traders who trust CryptoP2P
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join CryptoP2P today and experience the future of P2P crypto trading. Sign up in seconds and start trading immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
