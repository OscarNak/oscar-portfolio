import { PhotoGalleryWrapper } from "@/components/PhotoGalleryWrapper";
import { CollectionTree } from "@/components/CollectionTree";
import { getCollections, getPhotosForCollection } from "@/utils/collections";
import { getPhotos } from "@/utils/photos";
import path from "path";

// Mark the page as dynamic to ensure searchParams are available
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Récupération des données en parallèle d'abord
  const [collections] = await Promise.all([
    getCollections(),
  ]);

  // Traitement des paramètres de recherche après
  const defaultPath = 'voyage/coree/seoul';
  const rawPath = searchParams?.path;
  const currentPath = rawPath && typeof rawPath === 'string' 
    ? decodeURIComponent(rawPath)
    : defaultPath;
  
  const photoPaths = getPhotosForCollection(currentPath);
  
  // On ne récupère que les photos nécessaires pour la collection courante
  const allPhotos = await getPhotos();
  
  // Vérification et déduplication des photos basée sur l'ID
  const seenIds = new Set<string>();
  const uniquePhotos = allPhotos.filter(photo => {
    const isDuplicate = seenIds.has(photo.id);
    seenIds.add(photo.id);
    if (isDuplicate) {
      console.warn(`Duplicate photo ID found: ${photo.id}`);
    }
    return !isDuplicate;
  });

  // Filtrer les photos pour ne garder que celles de la collection courante
  const photos = uniquePhotos.filter(photo => {
    const normalizedPhotoPath = path.join(currentPath, path.basename(photo.id)).replace(/\\/g, '/');
    return photoPaths.some(p => p.startsWith(normalizedPhotoPath));
  });

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex gap-12 max-w-[2000px] mx-auto">
        <aside className="w-80 shrink-0">
          <nav className="sticky top-8">
            <h1 className="mb-8 text-3xl font-bold text-accent2 tracking-wide font-space">Oscar - Portfolio</h1>
            <div className="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
              <CollectionTree collections={collections} />
            </div>
          </nav>
        </aside>

        <main className="flex-grow min-w-0">
          <PhotoGalleryWrapper photos={photos} />
        </main>
      </div>
    </div>
  );
}