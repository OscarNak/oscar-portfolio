'use client'

import { Collection } from '@/types/collections'
import { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

type CollectionTreeProps = {
  collections: Collection[]
  level?: number
}

export function CollectionTree({ collections, level = 0 }: CollectionTreeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPath = searchParams.get('path') || 'voyage/coree/seoul'

  // Précharge les chemins des collections non-finales
  useEffect(() => {
    collections.forEach(collection => {
      if (!collection.children) {
        const url = new URL(window.location.href)
        url.searchParams.set('path', collection.path)
        router.prefetch(url.pathname + url.search)
      }
    })
  }, [collections, router])

  const handleCollectionClick = useCallback((path: string) => {
    const currentUrl = new URL(window.location.href)
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set('path', path)

    // Ne naviguer que si le chemin est différent
    if (currentUrl.search !== nextUrl.search) {
      router.replace(nextUrl.pathname + nextUrl.search, {
        scroll: false
      })
    }
  }, [router])

  return (
    <div className="space-y-2 font-mono tracking-wide">
      {collections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.3,
            delay: level ? index * 0.1 + level * 0.2 : index * 0.1 
          }}
        >
          <div 
            className={`
              flex items-center text-lg space-x-2 transition-colors duration-200 font-bold
              ${!collection.children ? 'cursor-pointer' : ''} 
              ${currentPath === collection.path 
                ? 'text-red-400' 
                : collection.children
                  ? 'text-stone-400'
                  : 'text-accent2 font-black hover:text-accent3'
              }
            `}
            onClick={() => !collection.children && handleCollectionClick(collection.path)}
            style={{ paddingLeft: `${level * 2}rem` }}
            role="button"
            tabIndex={!collection.children ? 0 : -1}
            onKeyDown={(e) => {
              if (!collection.children && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleCollectionClick(collection.path)
              }
            }}
          >
            <span className="w-6 inline-block">
              {level === 0 ? '$' : index === collections.length - 1 ? '└─' : '├─'}
            </span>
            <span>
              {collection.name}/
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