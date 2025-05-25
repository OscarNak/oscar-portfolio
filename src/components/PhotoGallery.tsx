'use client'

import { motion } from 'framer-motion'
import Masonry from 'react-masonry-css'
import Image from 'next/image'
import Link from 'next/link'
import { Photo } from '@/utils/photos'
import { useCallback, useEffect, useState, useRef } from 'react'

type PhotoGalleryProps = {
  photos: Photo[]
}

const breakpointColumns = {
  default: 3,
  1100: 2,
  768: 2,
  640: 1
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  // État de la galerie
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([])
  const [loadedOptimized, setLoadedOptimized] = useState(() => new Set<string>())
  const loadedPhotosCache = useRef(new Set<string>())
    // Configuration du chargement par lots
  const initialBatchSize = 12
  const subsequentBatchSize = 12
  // Préchargement optimisé des images
  const preloadImages = useCallback((imagesToPreload: Photo[]) => {
    if (typeof window === 'undefined') return

    const imageLoader = new window.Image()
    let currentIndex = 0

    const loadNext = () => {
      if (currentIndex >= imagesToPreload.length) return
      
      const photo = imagesToPreload[currentIndex]
      imageLoader.src = photo.optimizedSrc
      currentIndex++
      
      // Précharger la prochaine image une fois celle-ci chargée
      imageLoader.onload = loadNext
      imageLoader.onerror = loadNext
    }

    loadNext()
  }, [])

  // Gestion du chargement progressif des images
  const handlePhotoLoad = useCallback((photo: Photo) => {
    if (!loadedPhotosCache.current.has(photo.id)) {
      loadedPhotosCache.current.add(photo.id)
      
      // Charger la version optimisée en arrière-plan
      if (typeof window !== 'undefined') {
        const img = document.createElement('img')
        img.onload = () => {
          setLoadedOptimized(prev => {
            const next = new Set(prev)
            next.add(photo.id)
            return next
          })
        }
        img.src = photo.optimizedSrc
      }
    }
  }, [])

  // Gestion du scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && visiblePhotos.length < photos.length) {
            const nextBatch = photos.slice(
              visiblePhotos.length,
              visiblePhotos.length + subsequentBatchSize
            )
            setVisiblePhotos(prev => [...prev, ...nextBatch])
            
            // Précharger le prochain lot d'images
            const nextBatchToPreload = photos.slice(
              visiblePhotos.length + subsequentBatchSize,
              visiblePhotos.length + (subsequentBatchSize * 2)
            )
            preloadImages(nextBatchToPreload)
          }
        })
      },
      { rootMargin: '200px' }
    )

    const sentinel = document.getElementById('sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [photos, visiblePhotos.length, subsequentBatchSize, preloadImages])

  // Chargement initial
  useEffect(() => {
    const initialBatch = photos.slice(0, initialBatchSize)
    setVisiblePhotos(initialBatch)
    
    const nextBatch = photos.slice(initialBatchSize, initialBatchSize + subsequentBatchSize)
    preloadImages(nextBatch)
  }, [photos, initialBatchSize, subsequentBatchSize, preloadImages])

  if (visiblePhotos.length === 0) return null

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {visiblePhotos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1,
              y: 0 
            }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Link href={`/photo/${encodeURIComponent(photo.id)}`} className="block">
              <div 
                className="photo-card relative rounded-lg overflow-hidden"
                style={{
                  paddingBottom: `${(photo.height / photo.width) * 100}%`
                }}
              >
                <Image
                  src={loadedOptimized.has(photo.id) ? photo.optimizedSrc : photo.thumbnailSrc}
                  alt={photo.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg transition-all duration-300 hover:scale-105"
                  placeholder="blur"
                  blurDataURL={photo.blurDataURL}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  onLoad={() => handlePhotoLoad(photo)}
                  priority={visiblePhotos.indexOf(photo) < 3}
                  quality={loadedOptimized.has(photo.id) ? 85 : 60}
                />
                <div className="photo-overlay">
                  <h3 className="text-white text-xl font-medium">{photo.title}</h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </Masonry>
      <div id="sentinel" className="h-4" />
    </div>
  )
}
