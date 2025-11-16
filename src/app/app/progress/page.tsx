'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from '@/lib/app-state';
import { BranchProgress } from '@/components/progress/branch-progress';
import { cn } from '@/lib/utils';
import { RadialIntro } from '@/components/animate-ui/components/community/radial-intro';
import ShareButton from '@/components/animate-ui/components/community/share-button';

export default function ProgressPage() {
  const { dailyEntries } = useAppState();
  const [isPlanted, setIsPlanted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Streak-Logik bleibt unverändert
  const getStreakData = () => {
    const last10Days = dailyEntries.slice(0, 10);
    const completed = last10Days.filter((e) => e.adherence === 'yes').length;
    return { completed, total: 10 };
  };

  const { completed } = getStreakData();

  // Streak ist komplett bei 10/10
  const isComplete = completed === 10;

  const handlePlantTree = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsPlanted(true);
      setIsAnimating(false);
    }, 1000); // Animation-Dauer
  };

  // Für Animation - window height nur im Client
  const [windowHeight, setWindowHeight] = React.useState(800);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight);
    }
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 pb-24 bg-background relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-10 relative z-10">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Progress
          </h1>
          <p className="text-sm text-muted-foreground">
            Your 10-day habit streak visualized as a living health branch.
          </p>
        </div>

        {/* Card mit Animation - klickbar bei 10/10 Streak */}
        <AnimatePresence>
          {!isPlanted && (
            <motion.div
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={
                isAnimating
                  ? {
                      opacity: 0,
                      scale: 0.3,
                      y: windowHeight * 0.7,
                      rotate: -5,
                    }
                  : { opacity: 1, scale: 1, y: 0, rotate: 0 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className={cn(
                'mb-16 relative z-0',
                isComplete && !isAnimating && 'cursor-pointer'
              )}
              onClick={isComplete && !isAnimating ? handlePlantTree : undefined}
              whileHover={
                isComplete && !isAnimating
                  ? { scale: 1.02, transition: { duration: 0.2 } }
                  : undefined
              }
            >
              <BranchProgress streak={completed} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message nach dem Pflanzen */}
        {isPlanted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-6"
          >
            {/* Grid mit 3 Cards */}
            <div className="flex gap-4 justify-center items-start">
              {/* Card 1: Baum */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <div className="bg-card border border-border/40 rounded-xl px-3 py-6 shadow-lg w-fit">
                  {/* Animierter Baum – stilisiert wie im Icon, aber lebendig */}
                  <motion.svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: [0.95, 1, 0.97, 0.95] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Baumstamm – einfarbig dunkelbraun */}
                    <path
                      d="M36 50 L34 72 Q38 74 42 72 L40 50 Z"
                      fill="#5A3410"
                    />

                    {/* Kronen-Gruppe mit leichtem „Wackeln" */}
                    <motion.g
                      initial={{ y: 0, rotate: 0 }}
                      animate={{
                        y: [0, -1.5, 0, 1.5, 0],
                        rotate: [0, -1.5, 0, 1.5, 0],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ transformOrigin: '40px 34px' }}
                    >
                      {/* Untere Schicht – breite, einheitlich grüne Krone */}
                      <ellipse cx="38" cy="42" rx="18" ry="12" fill="#22c55e" />
                      {/* zusätzliche Blätter unten links/rechts – gleicher Grünton */}
                      <ellipse cx="26" cy="44" rx="8" ry="9" fill="#22c55e" />
                      <ellipse cx="50" cy="44" rx="8" ry="9" fill="#22c55e" />

                      {/* Mittlere Schicht – etwas kleiner, gleiches Grün leicht variiert */}
                      <ellipse cx="30" cy="32" rx="11" ry="10" fill="#16a34a" />
                      <ellipse cx="46" cy="32" rx="11" ry="10" fill="#16a34a" />

                      {/* Obere Schicht – Kuppe, etwas heller aber klar grün */}
                      <ellipse cx="36" cy="22" rx="8" ry="8" fill="#22c55e" />
                      <ellipse cx="42" cy="22" rx="8" ry="8" fill="#22c55e" />
                    </motion.g>
                  </motion.svg>
                </div>
              </motion.div>

              {/* Card 2: Platzhalter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                <div className="bg-card border border-border/40 rounded-xl px-3 py-6 shadow-lg w-fit">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-2xl text-muted-foreground/40">🌱</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Platzhalter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              >
                <div className="bg-card border border-border/40 rounded-xl px-3 py-6 shadow-lg w-fit">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-2xl text-muted-foreground/40">🌱</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-emerald-600">
                Tree Planted!
              </h2>
              <p className="text-muted-foreground">
                Your 10-day streak has grown into a beautiful tree. Keep going to
                grow your forest!
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Hero Section - erscheint beim Scrollen */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pt-20 pb-16 space-y-8"
        >
          {/* Hero Content */}
          <div className="text-center space-y-6">
            {/* Erster Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground"
            >
              Complete your set of 10 cards
            </motion.h2>
            
            {/* Animierter Pfeil nach unten */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center"
            >
              <motion.svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </motion.svg>
            </motion.div>
            
            {/* Zweiter Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-emerald-500"
            >
              Once you do, we'll plant a real tree for you out in the world.
            </motion.h2>

            {/* Community Teil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="pt-12 space-y-4"
            >
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Join our Community and Share your Progress
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                Inspire others and watch your forest grow together with people around the world
              </p>
            </motion.div>

            {/* Share Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.05 }}
              className="flex justify-center pt-4"
            >
              <ShareButton 
                size="lg" 
                icon="prefix"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Share
              </ShareButton>
            </motion.div>

            {/* Radial Intro Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex justify-center items-center py-8"
            >
              <RadialIntro orbitItems={COMMUNITY_ITEMS} stageSize={320} imageSize={60} />
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

// Community Items für Radial Intro
const COMMUNITY_ITEMS = [
  {
    id: 1,
    name: 'User 1',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  },
  {
    id: 2,
    name: 'User 2',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
  },
  {
    id: 3,
    name: 'User 3',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
  },
  {
    id: 4,
    name: 'User 4',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
  },
  {
    id: 5,
    name: 'User 5',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
  },
  {
    id: 6,
    name: 'User 6',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6',
  },
  {
    id: 7,
    name: 'User 7',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7',
  },
  {
    id: 8,
    name: 'User 8',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8',
  },
  {
    id: 9,
    name: 'User 9',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9',
  },
];