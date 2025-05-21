import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Zap } from "lucide-react"; // Using Zap as a placeholder for a sleek logo icon

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 sm:px-8 md:px-12 py-4 bg-neutral-950/90 backdrop-blur-lg text-neutral-200 shadow-md border-b border-neutral-800/70">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl sm:text-2xl hover:text-primary transition-colors duration-200"
        >
          <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <span>AI Doc Agent</span>
        </Link>
      </div>
      {/* Navigation links - hidden on small screens, visible on medium and up */}
      <div className="hidden md:flex items-center gap-4 sm:gap-5 text-sm sm:text-base">
        <Link
          href="/about"
          className="text-neutral-400 hover:text-neutral-100 hover:underline underline-offset-4 transition-colors duration-200"
        >
          About
        </Link>
        <Link
          href="/how-to-use"
          className="text-neutral-400 hover:text-neutral-100 hover:underline underline-offset-4 transition-colors duration-200"
        >
          How to Use
        </Link>
        <Link
          href="/contact"
          className="text-neutral-400 hover:text-neutral-100 hover:underline underline-offset-4 transition-colors duration-200"
        >
          Contact
        </Link>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/editor">
          <button className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-neutral-950">
            Open Editor
          </button>
        </Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-neutral-800 hover:bg-neutral-700/90 text-neutral-200 px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-neutral-950">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
