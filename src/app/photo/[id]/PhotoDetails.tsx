'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Photo } from '@/utils/photos'
import { useState, useEffect } from 'react'
import { p } from 'framer-motion/client'

type PhotoDetailsProps = {
  photo: Photo
}

export default function PhotoDetails({ photo }: PhotoDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const title = photo.title
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')

  useEffect(() => {
    // Reset loading state when photo changes
    setIsLoading(true)
  }, [photo.id])

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="mb-8 inline-block text-accent2 hover:text-accent3 transition-colors font-space tracking-wide "
      >
        ← Retour à la galerie
      </Link>
      
      {/* Affichage conditionnel selon l'orientation */}
      {photo.width > photo.height ? (
        // Paysage : d'abord les infos, puis l'image en dessous
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <div className="text-foreground/80 space-y-4">
                <p>
                  Dimensions: {photo.width} × {photo.height} px
                </p>
                <p className="italic">
                  Capturé avec passion et précision pour révéler la beauté unique de chaque moment.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="relative aspect-auto overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/20 backdrop-blur-sm"
                >
                  <Image
                    src={photo.thumbnailSrc}
                    alt={title}
                    width={photo.thumbnailWidth}
                    height={photo.thumbnailHeight}
                    className="rounded-lg blur-sm"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <Image
              src={photo.optimizedSrc}
              alt={title}
              width={photo.width}
              height={photo.height}
              className="rounded-lg"
              quality={85}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </motion.div>
      ) : (
        // Portrait ou carré : infos à droite de l'image
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 md:grid-cols-2"
        >
          <div className="relative aspect-auto overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/20 backdrop-blur-sm"
                >
                  <Image
                    src={photo.thumbnailSrc}
                    alt={title}
                    width={photo.thumbnailWidth}
                    height={photo.thumbnailHeight}
                    className="rounded-lg blur-sm"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <Image
              src={photo.optimizedSrc}
              alt={title}
              width={photo.width}
              height={photo.height}
              className="rounded-lg"
              quality={85}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              onLoad={() => setIsLoading(false)}
            />
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <div className="text-foreground/80 space-y-4">
                <p>
                  Dimensions: {photo.width} × {photo.height} px
                </p>
                <p className="italic">
                  Capturé avec passion et précision pour révéler la beauté unique de chaque moment.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </main>
  )
}
