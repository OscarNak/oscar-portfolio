import fs from 'fs'
import path from 'path'
import { getPlaiceholder } from 'plaiceholder'
import sharp from 'sharp'

export type Photo = {
  id: string
  title: string
  src: string
  optimizedSrc: string
  thumbnailSrc: string
  width: number
  height: number
  thumbnailWidth: number
  thumbnailHeight: number
  blurDataURL?: string
}

const OPTIMIZED_DIR = path.join(process.cwd(), 'public/optimized')
const THUMBNAIL_SIZE = 400
const OPTIMIZED_SIZE = 1600
const OPTIMIZED_QUALITY = 85
const THUMBNAIL_QUALITY = 60
const COMPRESSION_EFFORT = 4

// Création des dossiers nécessaires
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true })
}

function getAllPhotosRecursively(dir: string, baseDir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllPhotosRecursively(fullPath, baseDir))
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Get path relative to base directory
        const relativePath = path.relative(baseDir, fullPath)
        files.push(relativePath)
      }
    }
  })

  return files
}

async function optimizeImage(filePath: string, relativePath: string): Promise<{
  optimizedPath: string
  thumbnailPath: string
  dimensions: { width: number; height: number }
  thumbnailDimensions: { width: number; height: number }
}> {
  try {
    const safeRelativePath = relativePath
      .replace(/\.[^/.]+$/, '')
      .split('/')
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '_')
    
    const optimizedFileName = `opt_${safeRelativePath}.webp`
    const thumbnailFileName = `thumb_${safeRelativePath}.webp`
    const optimizedPath = path.join(OPTIMIZED_DIR, optimizedFileName)
    const thumbnailPath = path.join(OPTIMIZED_DIR, thumbnailFileName)

    if (fs.existsSync(optimizedPath) && fs.existsSync(thumbnailPath)) {
      const optimizedMetadata = await sharp(optimizedPath).metadata()
      const thumbnailMetadata = await sharp(thumbnailPath).metadata()

      return {
        optimizedPath: `/optimized/${optimizedFileName}`,
        thumbnailPath: `/optimized/${thumbnailFileName}`,
        dimensions: {
          width: optimizedMetadata.width || 0,
          height: optimizedMetadata.height || 0,
        },
        thumbnailDimensions: {
          width: thumbnailMetadata.width || THUMBNAIL_SIZE,
          height: thumbnailMetadata.height || 0,
        },
      }
    }

    // Read and validate the source image
    console.log(`Processing image: ${relativePath}`)    
    const imageBuffer = await fs.promises.readFile(filePath)
    const image = sharp(imageBuffer, { failOnError: false })
    const { width, height, format } = await image.metadata()

    if (!format) {
      throw new Error(`Could not detect format for image: ${relativePath}`)
    }

    // Create optimized version
    if (!fs.existsSync(optimizedPath)) {
      await image
        .resize(OPTIMIZED_SIZE, OPTIMIZED_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ 
          quality: OPTIMIZED_QUALITY,
          effort: COMPRESSION_EFFORT,
          force: true
        })
        .toFile(optimizedPath)
    }

    // Create thumbnail with a fresh Sharp instance
    if (!fs.existsSync(thumbnailPath)) {
      const thumbnailImage = sharp(imageBuffer, { failOnError: false })
      await thumbnailImage
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ 
          quality: THUMBNAIL_QUALITY,
          effort: COMPRESSION_EFFORT,
          force: true
        })
        .toFile(thumbnailPath)
    }

    // Utiliser metadata directement au lieu de relire le fichier
    return {
      optimizedPath: `/optimized/${optimizedFileName}`,
      thumbnailPath: `/optimized/${thumbnailFileName}`,      dimensions: {
        width: width || 0,
        height: height || 0,
      },
      thumbnailDimensions: {
        width: THUMBNAIL_SIZE,
        height: height && width ? Math.round(THUMBNAIL_SIZE * (height / width)) : 0,
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error processing image ${relativePath}:`, error)
    throw new Error(`Failed to process image ${relativePath}: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Récupère toutes les photos optimisées.
 * @returns une liste de toutes les photos optimisées
 */
export async function getPhotos(): Promise<Photo[]> {
  const photosDirectory = path.join(process.cwd(), 'public/photos')
  const filePaths = getAllPhotosRecursively(photosDirectory, "public/photos")

  const photos = await Promise.all(
    filePaths.map(async (relativePath) => {
      try {
        const absoluteFilePath = path.join(photosDirectory, relativePath)
        const { optimizedPath, thumbnailPath, dimensions, thumbnailDimensions } = 
          await optimizeImage(absoluteFilePath, relativePath)
        
        // Générer le placeholder flou depuis la miniature
        const thumbnailBuffer = await fs.promises.readFile(path.join(process.cwd(), 'public', thumbnailPath))
        const { base64 } = await getPlaiceholder(thumbnailBuffer)

        // Utiliser le chemin relatif complet comme ID, sans l'extension
        const id = relativePath.replace(/\.[^/.]+$/, '');

        const photo: Photo = {
          id,
          title: path.basename(id).split(/[-_]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          src: `/photos/${relativePath}`,
          optimizedSrc: optimizedPath,
          thumbnailSrc: thumbnailPath,
          width: dimensions.width,
          height: dimensions.height,
          thumbnailWidth: thumbnailDimensions.width,
          thumbnailHeight: thumbnailDimensions.height,
          blurDataURL: base64
        }

        return photo
      } catch (error) {
        console.error(`Error processing photo ${relativePath}:`, error)
        return null
      }
    })
  )

  // Filter out any failed photos and assert the type
  return photos.filter((photo): photo is Photo => photo !== null)
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const photos = await getPhotos()
  return photos.find(p => p.id === id)
}
