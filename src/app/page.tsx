import { PhotoGallery } from "@/components/PhotoGallery";
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
  const [allPhotos, collections] = await Promise.all([
    getPhotos(),
    getCollections(),
  ]);

  // Traitement des paramètres de recherche après
  const defaultPath = 'voyage/coree/seoul';
  const rawPath = searchParams?.path;
  const currentPath = rawPath && typeof rawPath === 'string' 
    ? decodeURIComponent(rawPath)
    : defaultPath;
  
  const photoPaths = getPhotosForCollection(currentPath);
  
  const photos = allPhotos.filter(photo => 
    photoPaths.includes(`${currentPath}/${path.basename(photo.id)}.jpg`)
  );

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
          <PhotoGallery photos={photos} />
        </main>
      </div>
    </div>
  );
}