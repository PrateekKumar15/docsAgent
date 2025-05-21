import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-10 sm:py-12 bg-neutral-950 text-neutral-500 text-center border-t border-neutral-800/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row gap-6">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} AI Doc Agent. All rights reserved.
          </div>
          <div className="flex items-center space-x-5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary transition-colors duration-200"
            >
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary transition-colors duration-200"
            >
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary transition-colors duration-200"
            >
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary transition-colors duration-200"
            >
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-neutral-600">
          AI Doc Agent is a product aimed at simplifying documentation
          interaction. We are not affiliated with the official providers of the
          documented technologies.
        </p>
      </div>
    </footer>
  );
}
