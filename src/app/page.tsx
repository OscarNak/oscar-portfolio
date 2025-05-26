import { PhotoGalleryWrapper } from "@/components/PhotoGalleryWrapper";
import { CollectionTree } from "@/components/CollectionTree";
import { TerminalTitle } from "@/components/TerminalTitle";
import { getCollections, getPhotosForCollection } from "@/utils/collections";
import { getPhotos } from "@/utils/photos";
import path from "path";

export const revalidate = 3600; // Revalidate every hour

type SearchParams = {
  path?: string | string[];
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function Home({ searchParams }: PageProps) {
  const defaultPath = 'voyage/coree/seoul';
  
  const resolvedParams = await (searchParams ?? Promise.resolve({ path: defaultPath }));
  const currentPath = typeof resolvedParams.path === 'string' 
    ? decodeURIComponent(resolvedParams.path)
    : Array.isArray(resolvedParams.path) && resolvedParams.path.length > 0
    ? decodeURIComponent(resolvedParams.path[0])
    : defaultPath;

  // Récupération des collections
  const collections = await getCollections();
  
  const photoPaths = getPhotosForCollection(currentPath);
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