"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useAnimation, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Zap, Brain, MessageSquare, History, ShieldCheck, Users, ChevronRight, Star, Code, Cloud } from "lucide-react";
import Marquee from "react-fast-marquee";

function HeroAnimatedIcon() {
  return (
    <motion.div 
      className="relative w-24 h-24 sm:w-32 sm:h-32"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-purple-500/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-pink-500/50"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 0.5 }}
      />
      <Zap className="absolute inset-0 m-auto h-1/2 w-1/2 text-orange-400" />
    </motion.div>
  );
}

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  extraClasses?: string;
}

function ScrollReveal({ children, delay = 0, extraClasses = "" }: ScrollRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();
  useEffect(() => {
    if (inView) controls.start({ opacity: 1, y: 0 });
  }, [inView, controls]);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
      transition={{ duration: 0.7, delay }}
      className={extraClasses}
    >
      {children}
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <div className="flex flex-col items-center p-6 text-center bg-neutral-900/70 border border-neutral-700/50 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:border-primary/40 h-full">
        <div className="p-3 mb-4 text-primary/900 bg-primary/10 rounded-full ">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-neutral-100">{title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
      </div>
    </ScrollReveal>
  );
}

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
  delay?: number;
}

function TestimonialCard({ quote, name, role, avatar, delay = 0 }: TestimonialCardProps) {
  return (
    <div className="w-full sm:w-[350px] flex-shrink-0">
      <Card className="p-6 bg-background border-neutral-700/40 rounded-lg shadow-md h-full flex flex-col justify-between hover:shadow-primary/30 transition-shadow duration-300">
        <div className="flex items-start mb-4">
          {avatar ? (
            <motion.img 
              src={avatar} 
              alt={name} 
              className="w-12 h-12 rounded-full mr-4 border-2 border-primary/50 object-cover"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full mr-4 bg-primary/20 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground/90">{name}</p>
            <p className="text-xs text-neutral-500">{role}</p>
          </div>
        </div>
        <blockquote className="italic text-foreground mb-4 text-sm leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="mr-0.5" />)}
        </div>
      </Card>
    </div>
  );
}

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export default function Home() {
  const heroTexts = [
    "Instant Answers.",
    "Smarter Searching.",
    "Peak Productivity.",
  ];
  const [currentHeroTextIndex, setCurrentHeroTextIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentHeroTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [heroTexts.length]);

  const techLogos = [
    { id: 1, content: <div className="flex items-center px-4 py-2 mx-2 text-neutral-300"><Zap size={20} className="mr-2 text-yellow-400"/> FastAPI</div> },
    { id: 2, content: <div className="flex items-center px-4 py-2 mx-2 text-neutral-300"><Code size={20} className="mr-2 text-blue-400"/> Next.js</div> },
    { id: 3, content: <div className="flex items-center px-4 py-2 mx-2 text-neutral-300"><Brain size={20} className="mr-2 text-green-400"/> Gemini AI</div> },
    { id: 4, content: <div className="flex items-center px-4 py-2 mx-2 text-neutral-300"><Cloud size={20} className="mr-2 text-sky-400"/> Neon DB</div> },
    { id: 5, content: <div className="flex items-center px-4 py-2 mx-2 text-neutral-300"><ShieldCheck size={20} className="mr-2 text-purple-400"/> Clerk Auth</div> },
  ];

  const testimonialsRef = useRef<HTMLDivElement>(null);
  const horizontalScrollContainerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollContentRef = useRef<HTMLDivElement>(null);
  const [horizontalScrollAmount, setHorizontalScrollAmount] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const calculateScrollAmount = () => {
      if (horizontalScrollContentRef.current && horizontalScrollContainerRef.current) {
        const contentWidth = horizontalScrollContentRef.current.scrollWidth;
        const containerWidth = horizontalScrollContainerRef.current.clientWidth;
        const scrollAmount = Math.max(0, contentWidth - containerWidth);
        setHorizontalScrollAmount(scrollAmount);
        setCanScroll(scrollAmount > 0);
      }
    };

    calculateScrollAmount();
    const handleResize = () => calculateScrollAmount();
    window.addEventListener('resize', handleResize);
    const timeoutId = setTimeout(calculateScrollAmount, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: testimonialsRef,
    offset: ["start center", "end center"]
  });

  const x = useTransform(
    scrollYProgress,
    [0.2, 0.8],
    [0, canScroll ? -horizontalScrollAmount : 0]
  );

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center flex-1 bg-neutral-950 text-neutral-100 min-h-screen overflow-x-hidden">
        <section className="w-full flex justify-center items-center py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
            initial={{ scale: 0.5, opacity: 0}}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, delay: 0.5}}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slower"
            initial={{ scale: 0.5, opacity: 0}}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, delay: 0.8}}
          />
          
          <div className="w-full max-w-5xl p-8 flex flex-col md:flex-row items-center text-center md:text-left z-10">
            <div className="md:w-1/2 md:pr-10">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
              >
                AI Doc Agent: <br className="sm:hidden"/>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={heroTexts[currentHeroTextIndex]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block  h-36"
                  >
                    {heroTexts[currentHeroTextIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                Paste any documentation link, ask your question, and let our AI
                provide clear, concise answers. Streamline your development
                workflow.
              </motion.p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                className="flex justify-center md:justify-start"
              >
                <Link href="/editor">
                  <Button
                    size="lg"
                    variant="default"
                    className="text-lg font-semibold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-3 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ring-offset-neutral-950 group"
                  >
                    Go to Editor <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="md:w-1/2 mt-10 md:mt-0 flex justify-center items-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              <Marquee speed={30} gradient={false} direction="left">
                <div 
                  className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-lg flex items-center justify-center mx-4 hero-visual-clip"
                >
                  <HeroAnimatedIcon />
                </div>
              </Marquee>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 bg-neutral-900">
          <ScrollReveal delay={0.2}>
            <h3 className="text-center text-xl font-semibold text-neutral-400 mb-6">Powered by Leading Technologies</h3>
            <Marquee speed={60} gradient={true} gradientColor={[23, 23, 23]} gradientWidth={100} pauseOnHover={true}>
              {techLogos.map(logo => (
                <div key={logo.id} className="mx-4">
                  {logo.content}
                </div>
              ))}
            </Marquee>
          </ScrollReveal>
        </section>

        <section className="w-full py-16 sm:py-24 bg-neutral-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-neutral-100">
                Unlock Superpowers for Your Docs
              </h2>
              <p className="text-center text-neutral-400 mb-12 sm:mb-16 max-w-2xl mx-auto">
                AI Doc Agent is packed with features to make your interaction with technical documentation faster, smarter, and more efficient.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Brain size={32} />} 
                title="Intelligent Understanding"
                description="Leverages advanced AI to comprehend context and provide relevant answers, not just keyword matches."
                delay={0.1}
              />
              <FeatureCard 
                icon={<MessageSquare size={32} />} 
                title="Conversational Interface"
                description="Ask questions naturally. Our chat interface makes getting information intuitive and easy."
                delay={0.2}
              />
              <FeatureCard 
                icon={<History size={32} />} 
                title="Chat History"
                description="Never lose track of your queries. Revisit past conversations and insights anytime."
                delay={0.3}
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} />} 
                title="Secure & Private"
                description="Your data is protected. Interact with documents in a secure, authenticated environment."
                delay={0.4}
              />
              <FeatureCard 
                icon={<Zap size={32} />} 
                title="Lightning Fast"
                description="Get the information you need in seconds, not minutes. Boost your productivity significantly."
                delay={0.5}
              />
              <FeatureCard 
                icon={<Users size={32} />} 
                title="Multi-User Ready (Soon)"
                description="Designed for individuals now, with team collaboration features on the horizon."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        <section ref={testimonialsRef} className="w-full py-16 sm:py-24 bg-neutral-900/70 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-neutral-100">
                Loved by Developers
              </h2>
              <p className="text-center text-neutral-400 mb-12 sm:mb-16 max-w-xl mx-auto">
                See what our users are saying about how AI Doc Agent has transformed their workflow.
              </p>
            </ScrollReveal>
            <div ref={horizontalScrollContainerRef} className="relative scrollbar-hide">
              <motion.div ref={horizontalScrollContentRef} style={{ x }} className="flex space-x-8 pb-8">
                <TestimonialCard 
                  quote="This tool is a game-changer! I used to spend hours sifting through docs. Now I get answers in seconds."
                  name="Alex P."
                  role="Senior Software Engineer"
                  avatar="https://randomuser.me/api/portraits/men/32.jpg"
                  delay={0.1}
                />
                <TestimonialCard 
                  quote="The accuracy of the AI is impressive. It understands context surprisingly well. Highly recommended!"
                  name="Sarah K."
                  role="Full-Stack Developer"
                  avatar="https://randomuser.me/api/portraits/women/44.jpg"
                  delay={0.2}
                />
                <TestimonialCard 
                  quote="AI Doc Agent has become an indispensable part of my toolkit. It saves me so much time and frustration."
                  name="Mike B."
                  role="DevOps Specialist"
                  avatar="https://randomuser.me/api/portraits/men/36.jpg"
                  delay={0.3}
                />
                <TestimonialCard 
                  quote="Finally, a documentation tool that feels like it was built for the 21st century. Intuitive and powerful."
                  name="Jessica L."
                  role="UX Designer & Developer"
                  avatar="https://randomuser.me/api/portraits/women/60.jpg" 
                  delay={0.4}
                />
                <TestimonialCard 
                  quote="The ability to just paste a URL and ask questions is incredibly efficient. My productivity has skyrocketed."
                  name="David R."
                  role="Backend Engineer"
                  avatar="https://randomuser.me/api/portraits/men/75.jpg"
                  delay={0.5}
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 sm:py-24 bg-gradient-to-r from-primary/20 via-purple-500/10 to-pink-500/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-neutral-100">
                Ready to Supercharge Your Documentation Workflow?
              </h2>
              <p className="text-neutral-300 mb-10 max-w-xl mx-auto text-lg">
                Stop wasting time and start getting instant, AI-powered answers. Try AI Doc Agent today and experience the difference.
              </p>
              <Link href="/editor">
                <Button
                  size="lg"
                  variant="default"
                  className="text-xl font-semibold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-10 py-4 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ring-offset-neutral-950 transform hover:-translate-y-1 group"
                >
                  Get Started for Free
                  <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
