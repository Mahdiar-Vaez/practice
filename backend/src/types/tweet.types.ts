export interface Tweet {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  views: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  tweetId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface CreateTweetDTO {
  authorId: string;
  content: string;
  mediaUrl?: string;
}

export interface CreateCommentDTO {
  authorId: string;
  content: string;
}

export interface PopulatedTweet extends Omit<Tweet, 'authorId'> {
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  time: string;
  isLiked?: boolean;
}

export interface PopulatedComment extends Omit<Comment, 'authorId'> {
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  time: string;
}
