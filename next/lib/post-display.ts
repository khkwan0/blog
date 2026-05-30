export type FeedPostBlock = {
  id: string;
  format: "HTML" | "VIDEO" | "TEXT" | "AUDIO" | "MARKDOWN";
  content: string;
  sortOrder: number;
};

export type FeedPostSource = {
  id: string;
  title: string | null;
  slug?: string;
  excerpt: string | null;
  totalLikes: number;
  totalReposts: number;
  createdAt: Date;
  ownerId: string;
  owner: { name: string };
  repostedFromId?: string | null;
  _count: { comments: number };
  blocks: FeedPostBlock[];
  repostedFrom?: {
    id: string;
    title: string | null;
    excerpt: string | null;
    totalLikes: number;
    totalReposts: number;
    createdAt: Date;
    ownerId: string;
    owner: { name: string };
    _count: { comments: number };
    blocks: FeedPostBlock[];
  } | null;
};

export type FeedPostView = {
  entryId: string;
  href: string;
  title: string | null;
  excerpt: string | null;
  createdAt: Date;
  owner: { name: string };
  ownerId: string;
  targetId: string;
  targetOwnerId: string;
  targetOwner: { name: string };
  targetCreatedAt: Date;
  totalLikes: number;
  totalReposts: number;
  commentCount: number;
  likedByUser: boolean;
  repostedByUser: boolean;
  isRepost: boolean;
  reposterName?: string;
  blocks: FeedPostBlock[];
  canDelete: boolean;
  canEdit: boolean;
};

export function toFeedPostView(
  post: FeedPostSource,
  options: {
    viewerId?: string;
    likedPostIds: Set<string>;
    repostedPostIds: Set<string>;
  },
): FeedPostView {
  const original = post.repostedFrom ?? post;
  const isRepost = Boolean(post.repostedFromId && post.repostedFrom);

  return {
    entryId: post.id,
    href: isRepost ? `/blog/${original.id}` : `/blog/${post.id}`,
    title: original.title,
    excerpt: original.excerpt,
    createdAt: post.createdAt,
    owner: post.owner,
    ownerId: post.ownerId,
    targetId: original.id,
    targetOwnerId: original.ownerId,
    targetOwner: original.owner,
    targetCreatedAt: original.createdAt,
    totalLikes: original.totalLikes,
    totalReposts: original.totalReposts,
    commentCount: original._count.comments,
    likedByUser: options.likedPostIds.has(original.id),
    repostedByUser: options.repostedPostIds.has(original.id),
    isRepost,
    reposterName: isRepost ? post.owner.name : undefined,
    blocks: original.blocks,
    canDelete: options.viewerId === post.ownerId,
    canEdit:
      Boolean(options.viewerId) &&
      options.viewerId === original.ownerId &&
      !isRepost,
  };
}

export function feedPostTargetIds(posts: FeedPostSource[]) {
  return posts.map((post) => (post.repostedFrom ?? post).id);
}
