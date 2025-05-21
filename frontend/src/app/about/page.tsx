"use client"; // Required for framer-motion

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, Brain, SearchCode, Rocket } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-purple-400 mb-4" />,
      title: "Instant Answers",
      description:
        "Get immediate, AI-driven responses from any technical documentation.",
    },
    {
      icon: <Brain className="h-10 w-10 text-pink-500 mb-4" />,
      title: "Smart Search",
      description:
        "Leverage state-of-the-art AI to understand your queries and find relevant information.",
    },
    {
      icon: <SearchCode className="h-10 w-10 text-orange-400 mb-4" />,
      title: "Focus on Coding",
      description:
        "Eliminate tedious searching and spend more time building great software.",
    },
    {
      icon: <Rocket className="h-10 w-10 text-teal-400 mb-4" />,
      title: "Boost Productivity",
      description:
        "Streamline your workflow and accelerate your development process.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-1 py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-3xl p-8 sm:p-10 md:p-12 bg-neutral-900/80 border-neutral-700/60 shadow-xl rounded-xl flex flex-col items-center text-center">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400"
            >
              About AI Doc Agent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-2xl text-center text-neutral-400 text-lg sm:text-xl mb-6"
            >
              AI Doc Agent is a cutting-edge SaaS platform designed to
              revolutionize how developers interact with programming
              documentation. Our mission is to provide instant, AI-driven
              answers from any library, framework, or technical guide.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-4 max-w-2xl text-center text-neutral-400 text-lg sm:text-xl mb-12"
            >
              We leverage state-of-the-art AI models to understand your queries
              and extract the most relevant information, allowing you to focus
              on what matters most: building great software and boosting your
              productivity.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                  className="flex flex-col items-center p-6 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
                >
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-neutral-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-400 text-sm text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
