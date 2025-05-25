'use client'

import { Suspense } from 'react'
import { PhotoGallery } from './PhotoGallery'
import { Photo } from '@/utils/photos'

// Type qui définit les props attendues par le composant
type PhotoGalleryWrapperProps = {
  photos: Photo[]
}

// Composant de chargement qui s'affiche pendant le chargement de PhotoGallery
function LoadingGallery() {
  return (
    <div className="w-full min-h-[200px] animate-pulse">
      {/* Grille de 3 colonnes avec un espacement de 4 entre les éléments */}
      <div className="grid grid-cols-3 gap-4">
        {/* Crée un tableau de 6 éléments vides pour le skeleton loading */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="aspect-[3/2] bg-white/5 rounded-lg" // Rectangle gris clair avec ratio 3:2
          />
        ))}
      </div>
    </div>
  )
}

// Composant principal qui wrap PhotoGallery avec Suspense pour la gestion du chargement
export function PhotoGalleryWrapper({ photos }: PhotoGalleryWrapperProps) {
  return (
    <Suspense fallback={<LoadingGallery />}>
      {/* PhotoGallery est rendu une fois les données chargées */}
      <PhotoGallery photos={photos} />
    </Suspense>
  )
}
