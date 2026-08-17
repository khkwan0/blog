import type { BlogEntryStatus } from "@/lib/posts";
import { isPostDeleted } from "@/lib/posts";

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
  status: BlogEntryStatus;
  totalLikes: number;
  totalReposts: number;
  createdAt: Date;
  ownerId: string;
  owner: { username: string; name: string; image: string | null };
  repostedFromId?: string | null;
  _count: { comments: number };
  blocks: FeedPostBlock[];
  repostedFrom?: {
    id: string;
    title: string | null;
    excerpt: string | null;
    status: BlogEntryStatus;
    totalLikes: number;
    totalReposts: number;
    createdAt: Date;
    ownerId: string;
    owner: { username: string; name: string; image: string | null };
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
  owner: { username: string; name: string; image: string | null };
  ownerId: string;
  targetId: string;
  targetOwnerId: string;
  targetOwner: { username: string; name: string; image: string | null };
  targetCreatedAt: Date;
  totalLikes: number;
  totalReposts: number;
  commentCount: number;
  likedByUser: boolean;
  repostedByUser: boolean;
  isRepost: boolean;
  isDeleted: boolean;
  reposterDisplayName?: string;
  reposterUsername?: string;
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
  const isDeleted = isPostDeleted(original.status);

  return {
    entryId: post.id,
    href: isRepost ? `/post/${original.id}` : `/post/${post.id}`,
    title: isDeleted ? null : original.title,
    excerpt: isDeleted ? null : original.excerpt,
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
    isDeleted,
    reposterDisplayName: isRepost ? post.owner.name : undefined,
    reposterUsername: isRepost ? post.owner.username : undefined,
    blocks: isDeleted ? [] : original.blocks,
    canDelete: options.viewerId === post.ownerId && !isPostDeleted(post.status),
    canEdit:
      Boolean(options.viewerId) &&
      options.viewerId === original.ownerId &&
      !isRepost &&
      !isDeleted,
  };
}

export function feedPostTargetIds(posts: FeedPostSource[]) {
  return posts.map((post) => (post.repostedFrom ?? post).id);
}
