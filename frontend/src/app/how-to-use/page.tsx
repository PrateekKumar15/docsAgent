"use client"; // Required for framer-motion

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  LogIn,
  Edit3,
  Search,
  MessageSquare,
  Settings,
  Zap,
} from "lucide-react"; // Added icons

export default function HowToUse() {
  const steps = [
    {
      icon: <LogIn className="h-8 w-8 text-purple-400 mb-3" />,
      title: "Sign Up/Log In",
      description:
        "Start by creating an account or logging in using the button in the navigation bar. This gives you access to all features.",
    },
    {
      icon: <Edit3 className="h-8 w-8 text-pink-500 mb-3" />,
      title: "Navigate to Editor",
      description:
        "Once logged in, go to the protected Editor page from the navigation menu or homepage link. This is where the magic happens!",
    },
    {
      icon: <Search className="h-8 w-8 text-orange-400 mb-3" />,
      title: "Input URL & Question",
      description:
        "In the editor, paste the URL of the documentation you want to query. Then, type your specific question into the chat interface.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-teal-400 mb-3" />,
      title: "Get Instant Answers",
      description:
        "Our AI will process the documentation and your question to provide a concise, relevant answer directly in the chat window.",
    },
    {
      icon: <Settings className="h-8 w-8 text-indigo-400 mb-3" />,
      title: "Manage Chats",
      description:
        "Your conversations are saved. You can revisit, rename, or delete chat sessions from the collapsible sidebar in the editor.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-400 mb-3" />,
      title: "Explore & Discover",
      description:
        "Try different URLs and questions to explore the full power of AI Doc Agent. Discover new insights and speed up your learning!",
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
          className="w-full max-w-3xl"
        >
          <Card className="p-8 sm:p-10 md:p-12 bg-neutral-900/80 border-neutral-700/60 shadow-xl rounded-xl flex flex-col items-center text-center">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400"
            >
              How to Use AI Doc Agent
            </motion.h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 w-full">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                  className="flex flex-col items-start text-left p-6 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    {step.icon}
                    <h3 className="text-xl font-semibold text-neutral-100 ml-3">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-neutral-400 text-sm">{step.description}</p>
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
