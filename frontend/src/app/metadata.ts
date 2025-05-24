import type { Metadata } from "next";

const deployURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(deployURL),
  title: "AI Doc Agent | Instantly Ask Questions About Any Docs",
  description:
    "AI-powered SaaS to chat with any programming docs, libraries, or frameworks. Chat history, protected editor, and beautiful UI.",
  keywords: [
    "AI",
    "SaaS",
    "Gemini",
    "Docs Chatbot",
    "Programming Documentation",
    "Next.js",
    "FastAPI",
    "Clerk Auth",
    "Neon DB",
    "Prisma",
    "Tailwind",
    "Shadcn UI",
  ],
  openGraph: {
    title: "AI Doc Agent | Instantly Ask Questions About Any Docs",
    description:
      "AI-powered SaaS to chat with any programming docs, libraries, or frameworks. Chat history, protected editor, and beautiful UI.",
    url: deployURL,
    siteName: "AI Doc Agent",
    images: [
      {
        url: "/favicon.ico",
        width: 64,
        height: 64,
        alt: "AI Doc Agent Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Doc Agent | Instantly Ask Questions About Any Docs",
    description:
      "AI-powered SaaS to chat with any programming docs, libraries, or frameworks. Chat history, protected editor, and beautiful UI.",
    images: ["/favicon.ico"],
  },
};
