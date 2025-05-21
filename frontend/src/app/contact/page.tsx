"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquareText, HelpCircle, Send } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-1 py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="p-8 sm:p-10 bg-neutral-900/80 border-neutral-700/60 shadow-xl rounded-xl flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              <Send size={50} className="text-purple-400 opacity-90" />
            </motion.div>
            <motion.h1
              className="text-3xl sm:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                type: "spring",
                stiffness: 100,
              }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="max-w-md text-center text-neutral-400 mb-8 text-base sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Have questions, feedback, or need support? We&apos;d love to hear
              from you! Reach out to us using your preferred method below.
            </motion.p>

            <motion.div
              className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, staggerChildren: 0.1 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 rounded-lg px-6 py-3 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ring-offset-neutral-950"
                >
                  <a
                    href="mailto:support@aidocagent.com"
                    className="flex items-center"
                  >
                    <Mail className="mr-2 h-5 w-5" /> Email Support
                  </a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  disabled
                  className="w-full sm:w-auto bg-transparent border-pink-500 hover:bg-pink-500/10 text-pink-400 hover:text-pink-300 rounded-lg px-6 py-3 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <a href="#" className="flex items-center">
                    <MessageSquareText className="mr-2 h-5 w-5" /> Live Chat
                    (Soon)
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-6 text-center border-t border-neutral-700/60 pt-6 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <h2 className="text-xl font-semibold text-neutral-200 mb-3 flex items-center justify-center">
                <HelpCircle className="mr-2 h-6 w-6 text-orange-400" />{" "}
                Frequently Asked Questions
              </h2>
              <p className="text-neutral-400 text-sm">
                Check out our{" "}
                <a
                  href="/how-to-use"
                  className="text-orange-400 hover:text-orange-300 underline transition-colors"
                >
                  How to Use
                </a>{" "}
                page for common queries.
              </p>
            </motion.div>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
