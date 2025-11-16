/**
 * GraphQL Queries for Product Hunt API
 *
 * Contains all GraphQL queries used by the Product Hunt MCP server
 */

// ============================================
// Post Queries
// ============================================

export const POST_QUERY = `
query Post($id: ID, $slug: String) {
  post(id: $id, slug: $slug) {
    id
    name
    slug
    tagline
    description
    url
    votesCount
    commentsCount
    createdAt
    featuredAt
    website
    thumbnail {
      url
      videoUrl
    }
    user {
      id
      name
      username
      headline
      profileImage
      url
      twitterUsername
    }
    topics {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    media {
      url
      videoUrl
      type
    }
    makers {
      id
      name
      username
      profileImage
      url
    }
  }
}
`;

export const POSTS_QUERY = `
query Posts(
  $first: Int
  $after: String
  $order: PostsOrder
  $topic: String
  $featured: Boolean
  $url: String
  $twitterUrl: String
  $postedBefore: DateTime
  $postedAfter: DateTime
) {
  posts(
    first: $first
    after: $after
    order: $order
    topic: $topic
    featured: $featured
    url: $url
    twitterUrl: $twitterUrl
    postedBefore: $postedBefore
    postedAfter: $postedAfter
  ) {
    edges {
      node {
        id
        name
        slug
        tagline
        description
        url
        votesCount
        commentsCount
        createdAt
        featuredAt
        website
        thumbnail {
          url
          videoUrl
        }
        user {
          id
          name
          username
          headline
          profileImage
          url
          twitterUsername
        }
        topics {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
        makers {
          id
          name
          username
          profileImage
          url
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

// ============================================
// Comment Queries
// ============================================

export const COMMENT_QUERY = `
query Comment($id: ID!) {
  comment(id: $id) {
    id
    body
    createdAt
    votesCount
    user {
      id
      name
      username
      headline
      profileImage
    }
  }
}
`;

export const COMMENTS_QUERY = `
query PostComments($id: ID, $slug: String, $first: Int, $after: String, $order: CommentsOrder) {
  post(id: $id, slug: $slug) {
    id
    name
    comments(first: $first, after: $after, order: $order) {
      edges {
        node {
          id
          body
          createdAt
          votesCount
          user {
            id
            name
            username
            headline
            profileImage
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;

// ============================================
// Collection Queries
// ============================================

export const COLLECTION_QUERY = `
query Collection($id: ID, $slug: String) {
  collection(id: $id, slug: $slug) {
    id
    name
    description
    tagline
    posts {
      edges {
        node {
          id
          name
          slug
          tagline
          votesCount
          commentsCount
        }
      }
    }
  }
}
`;

export const COLLECTIONS_QUERY = `
query Collections(
  $first: Int
  $after: String
  $order: CollectionsOrder
  $featured: Boolean
  $userId: ID
  $postId: ID
) {
  collections(
    first: $first
    after: $after
    order: $order
    featured: $featured
    userId: $userId
    postId: $postId
  ) {
    edges {
      node {
        id
        name
        description
        tagline
        followersCount
        user {
          id
          name
          username
          headline
          profileImage
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

// ============================================
// Topic Queries
// ============================================

export const TOPIC_QUERY = `
query Topic($id: ID, $slug: String) {
  topic(id: $id, slug: $slug) {
    id
    name
    slug
    description
    followersCount
    postsCount
    image
  }
}
`;

export const TOPICS_QUERY = `
query Topics(
  $first: Int
  $after: String
  $order: TopicsOrder
  $query: String
  $followedByUserId: ID
) {
  topics(
    first: $first
    after: $after
    order: $order
    query: $query
    followedByUserId: $followedByUserId
  ) {
    edges {
      node {
        id
        name
        slug
        description
        followersCount
        postsCount
        image
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

// ============================================
// User Queries
// ============================================

export const USER_QUERY = `
query User($id: ID, $username: String) {
  user(id: $id, username: $username) {
    id
    name
    username
    headline
    createdAt
    twitterUsername
    websiteUrl
    profileImage
    coverImage
    isMaker
    isFollowing
    url
  }
}
`;

export const VIEWER_QUERY = `
query {
  viewer {
    user {
      id
      name
      username
      headline
      coverImage
      createdAt
      isFollowing
      isMaker
      isViewer
      madePosts {
        totalCount
      }
      profileImage
      twitterUsername
      url
      websiteUrl
      votedPosts {
        totalCount
      }
    }
  }
}
`;
