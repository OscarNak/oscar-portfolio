import fs from 'fs'
import path from 'path'
import { Collection } from '@/types/collections'

const PHOTOS_DIR = path.join(process.cwd(), 'public/photos')

function isDirectory(path: string) {
  return fs.statSync(path).isDirectory()
}
/**
 * Récupère la liste des collections de photos.
 * @returns Un tableau d'objets Collection représentant les collections de photos.
 */
export function getCollections(): Collection[] {
  function scanDirectory(dirPath: string, relativePath: string = ''): Collection[] {
    const entries = fs.readdirSync(dirPath)
    const collections: Collection[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry)
      const relPath = path.join(relativePath, entry).replace(/\\/g, '/')
      
      if (isDirectory(fullPath)) {
        const children = scanDirectory(fullPath, relPath)
        if (children.length > 0) {
          collections.push({
            id: relPath,
            path: relPath,
            name: entry,
            children
          })
        } else {
          // C'est un dossier qui contient directement des photos
          const hasPhotos = fs.readdirSync(fullPath).some(file => 
            /\.(jpg|jpeg|png|webp)$/i.test(file)
          )
          if (hasPhotos) {
            collections.push({
              id: relPath,
              path: relPath,
              name: entry
            })
          }
        }
      }
    }

    return collections
  }

  return scanDirectory(PHOTOS_DIR)
}

/**
 * Récupère les photos d'une collection spécifique.
 * @param collectionPath Le chemin de la collection (par exemple, 'nature/forests').
 * @returns Un tableau de chemins de photos dans la collection.
 */
export function getPhotosForCollection(collectionPath: string) {
  const fullPath = path.join(PHOTOS_DIR, collectionPath)
  if (!fs.existsSync(fullPath)) return []

  return fs.readdirSync(fullPath)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .map(file => path.join(collectionPath, file).replace(/\\/g, '/'))
}
