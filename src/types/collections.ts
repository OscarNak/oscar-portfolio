export type Collection = {
  id: string
  path: string
  name: string
  children?: Collection[]
}

export type CollectionPath = string[]
