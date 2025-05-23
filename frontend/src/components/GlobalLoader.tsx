"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2Icon } from "lucide-react";

const GlobalLoader: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.ui.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm"
        >
          <Loader2Icon className="h-12 w-12 text-purple-500 animate-spin mb-4" />
          <p className="text-neutral-300 text-lg font-medium">Loading...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
