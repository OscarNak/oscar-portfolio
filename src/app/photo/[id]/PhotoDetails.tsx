'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Photo } from '@/utils/photos'
import { useRouter } from 'next/navigation'

type PhotoDetailsProps = {
  photo: Photo
}

export default function PhotoDetails({ photo }: PhotoDetailsProps) {
  const router = useRouter()
  const title = photo.title
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')

  return (
    <main className="container mx-auto px-4 py-8">      
      <button
        onClick={() => router.back()}
        className="mb-8 inline-block text-accent2 hover:text-accent3 transition-colors font-space tracking-wide text-lg font-black"
      >
        &lsaquo; Retour à la galerie
      </button>
      
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
            <Image
              src={photo.optimizedSrc}
              alt={title}
              width={photo.width}
              height={photo.height}
              className="rounded-lg"
              quality={100}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              priority
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
            <Image
              src={photo.optimizedSrc}
              alt={title}
              width={photo.width}
              height={photo.height}
              className="rounded-lg"
              quality={100}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              priority
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
