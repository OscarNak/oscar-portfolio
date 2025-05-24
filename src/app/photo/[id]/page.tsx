import { getPhotos } from '@/utils/photos'
import { notFound } from 'next/navigation'
import PhotoDetails from '@/app/photo/[id]/PhotoDetails'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const photos = await getPhotos()
  return photos.map((photo) => ({
    id: photo.id,
  }))
}

async function getPhotoData(photoId: string) {
  try {
    const photos = await getPhotos()
    return photos.find((p) => p.id === photoId)
  } catch (error) {
    console.error('Error fetching photo:', error)
    return null
  }
}

export default async function PhotoPage({ params }: Props) {
  const resolvedParams = await params
  const photoId = decodeURIComponent(resolvedParams.id)
  const photo = await getPhotoData(photoId)

  if (!photo) {
    notFound()
  }

  return <PhotoDetails photo={photo} />
}
