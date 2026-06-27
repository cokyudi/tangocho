'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PhoneFrame from '@/components/about/PhoneFrame';

const screens = [
  { src: '/screenshots/capture.png', alt: 'Capture screen' },
  { src: '/screenshots/practice.png', alt: 'Practice flashcard' },
  { src: '/screenshots/browse.png', alt: 'Browse list' },
];

export default function HeroMockup() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % screens.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[230px]">
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <PhoneFrame src={screens[i].src} alt={screens[i].alt} priority={i === 0} />
      </motion.div>
    </div>
  );
}
