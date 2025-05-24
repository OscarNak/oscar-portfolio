'use client'

import { motion } from 'framer-motion'
import Masonry from 'react-masonry-css'
import Image from 'next/image'
import Link from 'next/link'
import { Photo } from '@/utils/photos'
import { useCallback, useEffect, useState, useMemo } from 'react'

type PhotoGalleryProps = {
  photos: Photo[]
}

const breakpointColumns = {
  default: 3,
  1100: 2,
  700: 1
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const photosWithUniqueIds = useMemo(() => 
    photos.map(photo => ({
      ...photo,
      uniqueId: `${photo.id}-${Math.random().toString(36).substr(2, 9)}`
    })), 
    [photos]
  )
  
  const [loadedPhotos, setLoadedPhotos] = useState<string[]>([])
  const [visiblePhotos, setVisiblePhotos] = useState<typeof photosWithUniqueIds[0][]>([])
  const initialBatchSize = 9
  const subsequentBatchSize = 6    
  const preloadImages = useCallback((imagesToPreload: typeof photosWithUniqueIds[0][]) => {
    imagesToPreload.forEach(photo => {
      const img = document.createElement('img')
      img.src = photo.optimizedSrc
    })
  }, [])

  const loadMorePhotos = useCallback(() => {
    const nextBatch = photosWithUniqueIds.slice(
      visiblePhotos.length,
      visiblePhotos.length + subsequentBatchSize
    )
    setVisiblePhotos(prev => [...prev, ...nextBatch])
    
    const nextBatchToPreload = photosWithUniqueIds.slice(
      visiblePhotos.length + subsequentBatchSize,
      visiblePhotos.length + (subsequentBatchSize * 2)
    )
    preloadImages(nextBatchToPreload)
  }, [photosWithUniqueIds, visiblePhotos.length, preloadImages])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && visiblePhotos.length < photosWithUniqueIds.length) {
            loadMorePhotos()
          }
        })
      },
      { rootMargin: '200px' }
    )

    const sentinel = document.getElementById('sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadMorePhotos, visiblePhotos.length, photosWithUniqueIds.length])

  useEffect(() => {
    const initialBatch = photosWithUniqueIds.slice(0, initialBatchSize)
    setVisiblePhotos(initialBatch)
    setLoadedPhotos([])
    
    const nextBatch = photosWithUniqueIds.slice(initialBatchSize, initialBatchSize + subsequentBatchSize)
    preloadImages(nextBatch)
  }, [photosWithUniqueIds, initialBatchSize, subsequentBatchSize, preloadImages])

  const handlePhotoLoad = useCallback((uniqueId: string) => {
    setLoadedPhotos(prev => [...prev, uniqueId])
  }, [])

  if (visiblePhotos.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {visiblePhotos.map((photo) => (
          <motion.div
            key={photo.uniqueId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: loadedPhotos.includes(photo.uniqueId) ? 1 : 0,
              y: loadedPhotos.includes(photo.uniqueId) ? 0 : 20 
            }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Link href={`/photo/${encodeURIComponent(photo.id)}`} className="block">              <div 
                className="relative rounded-lg overflow-hidden"
                style={{
                  paddingBottom: `${(photo.height / photo.width) * 100}%`
                }}
              >                <Image
                  src={photo.optimizedSrc}
                  alt={photo.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg transition-all duration-300 hover:scale-105"
                  placeholder="blur"
                  blurDataURL={photo.blurDataURL}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  onLoad={() => handlePhotoLoad(photo.uniqueId)}
                  priority={visiblePhotos.indexOf(photo) < 3}
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
