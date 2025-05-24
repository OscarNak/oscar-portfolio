'use client'

import { Collection } from '@/types/collections'
import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

type CollectionTreeProps = {
  collections: Collection[]
  level?: number
}

export function CollectionTree({ collections, level = 0 }: CollectionTreeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPath = searchParams.get('path') || 'voyage/coree/seoul' // Ajout du chemin par défaut

  const handleCollectionClick = useCallback((path: string) => {
    router.push(`/?path=${encodeURIComponent(path)}`)
  }, [router])

  return (
    <div className="space-y-2 font-mono">
      {collections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: level ? index * 0.1 + level * 0.2 : index * 0.1 }}
        >
          <div 
            className={`flex items-center space-x-2 transition-colors
              ${!collection.children ? 'cursor-pointer' : ''} 
              ${currentPath === collection.path 
                ? 'text-white font-bold' 
                : collection.children
                  ? 'text-gray-500' // gris foncé pour les collections non finales
                  : 'text-accent2 hover:text-accent3'}`}
            onClick={() => !collection.children && handleCollectionClick(collection.path)}
            style={{ paddingLeft: `${level * 2}rem` }}
          >
            <span className="w-6 inline-block">
              {level === 0 ? '$' : index === collections.length - 1 ? '└─' : '├─'}
            </span>
            <span>
              {collection.name}
            </span>
          </div>
          {collection.children && (
            <CollectionTree 
              collections={collection.children} 
              level={level + 1} 
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}