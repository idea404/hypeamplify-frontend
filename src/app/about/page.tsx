"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar, NavbarItemProps } from '@/components/ui/navbar';
import { Logo } from '@/components/ui/logo';
import { motion } from "framer-motion";

export default function AboutPage() {
  // Navbar items: just a Home button for About page
  const navbarItems: NavbarItemProps[] = [
    {
      key: 'home',
      element: (
        <Button asChild variant="outline" className="w-full justify-start h-10">
        </Button>
      ),
      position: 'right',
      order: 1
    }
  ];
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Navbar at the top */}
      <Navbar items={navbarItems} />
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 mt-16">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 max-w-2xl w-full bg-white/80 dark:bg-black/80 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-border transition-all duration-300"
        >
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-center">About HypeAmplify</h1>
          <p className="text-md text-base text-gray-700 dark:text-gray-300 mb-6 text-center">
            <b>HypeAmplify</b> is your AI-powered platform for X (formerly Twitter) growth and engagement optimization. Effortlessly generate viral, on-brand tweets tailored to your favorite profiles, and maximize your impact on X with just a few clicks.
          </p>
          <ol className="mb-6 space-y-2 text-base text-gray-700 dark:text-gray-300 list-decimal list-inside">
            <li><b>Select a profile</b> — Choose from top X personalities or your own.</li>
            <li><b>AI-powered generation</b> — Instantly get tweet suggestions that match the account's style crafted for maximum engagement.</li>
            <li><b>Grow your audience</b> — Copy, edit, and post high-performing tweets to amplify your reach.</li>
          </ol>
          <p className="mb-8 text-base text-center text-gray-700 dark:text-gray-300">
            Built with cutting-edge AI, a modern WebGL background, and a sleek, responsive design. Whether you're a creator, brand, or just want to have fun, HypeAmplify helps you stand out on X.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg" variant="default" className="px-8 text-base font-semibold shadow-md cursor-pointer">Back to Home</Button>
            </Link>
          </div>
        </motion.div>
      </main>
      {/* Logo at the bottom left, only on desktop */}
      <motion.div
        className="absolute bottom-6 left-6 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <Logo width={200} height={60} />
        </Link>
      </motion.div>
    </div>
  );
} 