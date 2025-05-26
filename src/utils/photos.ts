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


// Création des dossiers nécessaires
if (!fs.existsSync(OPTIMIZED_DIR)) {
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true })
}



// Cache pour les métadonnées des photos
let photoCache: Photo[] | null = null;
let photoCacheExpiry = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

/**
 * Récupère toutes les photos optimisées avec mise en cache.
 * @returns une liste de toutes les photos optimisées
 */
export async function getPhotos(): Promise<Photo[]> {
  const now = Date.now();
  
  // Retourner le cache s'il est valide
  if (photoCache && now < photoCacheExpiry) {
    return photoCache;
  }

  const optimizedDirectory = path.join(process.cwd(), 'public/optimized');
  const files = fs.readdirSync(optimizedDirectory)
    .filter((file: string) => file.startsWith('opt_'))
    .sort();

  const photos: Photo[] = [];
  
  for (let i = 0; i < files.length; i += 10) {
    const batch = files.slice(i, i + 10);
    const batchResults = await Promise.all(
      batch.map(async (filename: string) => {
        try {
          const optimizedPath = `/optimized/${filename}`;
          const thumbnailPath = `/optimized/${filename.replace('opt_', 'thumb_')}`;
          
          // Obtenir les dimensions de l'image optimisée
          const optimizedFilePath = path.join(process.cwd(), 'public', optimizedPath);
          const optimizedMetadata = await sharp(optimizedFilePath).metadata();
          
          // Vérifier que le thumbnail existe
          const thumbnailFilePath = path.join(process.cwd(), 'public', thumbnailPath);
          if (!fs.existsSync(thumbnailFilePath)) {
            throw new Error(`Thumbnail not found: ${thumbnailPath}`);
          }
          
          // Générer le placeholder flou depuis la miniature
          const thumbnailBuffer = await fs.promises.readFile(thumbnailFilePath);
          const { base64 } = await getPlaiceholder(thumbnailBuffer);
          const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
          
          // Reconstruire l'ID en gardant la structure des dossiers
          const id = filename
            .replace('opt_', '')
            .replace(/\.[^/.]+$/, '')
            .replace(/_/g, '/'); // Convertir les underscores en slashes pour recréer la structure
          
          const photo: Photo = {
            id,
            title: path.basename(id)
              .split(/[-_]/)
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
              .replace(/\.(jpg|jpeg|png|webp)$/i, ''),
            src: optimizedPath,
            optimizedSrc: optimizedPath,
            thumbnailSrc: thumbnailPath,
            width: optimizedMetadata.width || 0,
            height: optimizedMetadata.height || 0,
            thumbnailWidth: thumbnailMetadata.width || THUMBNAIL_SIZE,
            thumbnailHeight: thumbnailMetadata.height || 0,
            blurDataURL: base64
          };

          return photo;
        } catch (error) {
          console.error(`Error processing photo ${filename}:`, error);
          return null;
        }
      })
    );

    photos.push(...batchResults.filter((photo: Photo | null): photo is Photo => photo !== null));
  }

  // Mettre à jour le cache
  photoCache = photos;
  photoCacheExpiry = now + CACHE_DURATION;

  return photos;
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const photos = await getPhotos()
  return photos.find(p => p.id === id)
}
