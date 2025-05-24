'use client'

import { motion } from 'framer-motion'

export function MorphingBackground() {
  return (
    <motion.div
      className="morphing-background"
      animate={{
        background: [
          'radial-gradient(circle at 50% 50%, hsl(220, 10%, 25%) 0%, hsl(220, 10%, 20%) 25%, hsl(220, 10%, 15%) 50%, hsl(220, 10%, 10%) 100%)',
          'radial-gradient(circle at 30% 70%, hsl(220, 10%, 25%) 0%, hsl(220, 10%, 20%) 25%, hsl(220, 10%, 15%) 50%, hsl(220, 10%, 10%) 100%)',
          'radial-gradient(circle at 70% 30%, hsl(220, 10%, 25%) 0%, hsl(220, 10%, 20%) 25%, hsl(220, 10%, 15%) 50%, hsl(220, 10%, 10%) 100%)',
          'radial-gradient(circle at 50% 50%, hsl(220, 10%, 25%) 0%, hsl(220, 10%, 20%) 25%, hsl(220, 10%, 15%) 50%, hsl(220, 10%, 10%) 100%)',
        ],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}