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
    const fileName = path.basename(filePath)
    const safeFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
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
    const metadata = await image.metadata()

    if (!metadata.format) {
      throw new Error(`Could not detect format for image: ${fileName}`)
    }

    // Create optimized version
    if (!fs.existsSync(optimizedPath)) {
      await image
        .resize(OPTIMIZED_SIZE, OPTIMIZED_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ 
          quality: 75,
          effort: 6,
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
          quality: 60,
          effort: 4,
          force: true
        })
        .toFile(thumbnailPath)
    }

    // Get metadata for the processed files
    const optimizedMetadata = await sharp(optimizedPath).metadata()
    const thumbnailMetadata = await sharp(thumbnailPath).metadata()

    return {
      optimizedPath: `/optimized/${optimizedFileName}`,
      thumbnailPath: `/optimized/${thumbnailFileName}`,
      dimensions: {
        width: optimizedMetadata.width || metadata.width || 0,
        height: optimizedMetadata.height || metadata.height || 0,
      },
      thumbnailDimensions: {
        width: thumbnailMetadata.width || THUMBNAIL_SIZE,
        height: thumbnailMetadata.height || 0,
      },
    }
  } catch (error: any) {
    console.error(`Error processing image ${relativePath}:`, error)
    throw new Error(`Failed to process image ${relativePath}: ${error?.message || 'Unknown error'}`)
  }
}

export async function getPhotos(): Promise<Photo[]> {
  const photosDirectory = path.join(process.cwd(), 'public/photos')
  const filePaths = getAllPhotosRecursively(photosDirectory, "public/photos")

  const photos = await Promise.all(
    filePaths.map(async (relativePath) => {
      const absoluteFilePath = path.join(photosDirectory, relativePath)
      const { optimizedPath, thumbnailPath, dimensions, thumbnailDimensions } = 
        await optimizeImage(absoluteFilePath, relativePath)
      
      // Générer le placeholder flou depuis la miniature
      const thumbnailBuffer = await fs.promises.readFile(path.join(process.cwd(), 'public', thumbnailPath))
      const { base64 } = await getPlaiceholder(thumbnailBuffer)

      // Utiliser le chemin relatif complet comme ID, sans l'extension
      const id = relativePath.replace(/\.[^/.]+$/, '');

      return {
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
    })
  )

  return photos
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const photos = await getPhotos()
  return photos.find(p => p.id === id)
}
