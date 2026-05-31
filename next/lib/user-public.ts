export const publicUserSelect = {
  id: true,
  username: true,
  name: true,
  image: true,
} as const;

export type PublicUser = {
  id: string;
  username: string;
  name: string;
  image: string | null;
};

export const ownerPublicSelect = {
  username: true,
  name: true,
} as const;

export type OwnerPublic = {
  username: string;
  name: string;
};
