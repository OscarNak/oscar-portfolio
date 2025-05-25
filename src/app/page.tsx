import { PhotoGalleryWrapper } from "@/components/PhotoGalleryWrapper";
import { CollectionTree } from "@/components/CollectionTree";
import { TerminalTitle } from "@/components/TerminalTitle";
import { getCollections, getPhotosForCollection } from "@/utils/collections";
import { getPhotos } from "@/utils/photos";
import path from "path";

// Mark the page as dynamic to ensure searchParams are available
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Home({ searchParams }: any) {

  // Récupération des données et des paramètres en parallèle
  const [collections, resolvedParams] = await Promise.all([
    getCollections(),
    Promise.resolve(searchParams) // Attendre que searchParams soit résolu
  ]);

  // Traitement des paramètres de recherche
  const defaultPath = 'voyage/coree/seoul';
  const rawPath = resolvedParams?.path;
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
    <div className="min-h-screen p-4 pb-20 sm:p-8 lg:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 max-w-[2000px] mx-auto">
        <aside className="w-full lg:w-80 lg:shrink-0">
          <nav className="lg:sticky lg:top-8">
            <div className="mb-4 lg:mb-8">
              <TerminalTitle text="cd portfolio/" speed={80} />
            </div>
            <div className="p-4 lg:p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
              <CollectionTree collections={collections} />
            </div>
          </nav>
        </aside>

        <main className="flex-grow min-w-0 mt-6 lg:mt-0">
          <PhotoGalleryWrapper photos={photos} />
        </main>
      </div>
    </div>
  );
}