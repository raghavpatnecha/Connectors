/**
 * Reddit Unified MCP - Utility Tools
 *
 * Utility tools for Reddit MCP:
 * - reddit_explain: Explains Reddit concepts and terminology
 *
 * @module tools/utility-tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerTool, formatToolResponse } from '../utils/tool-registry-helper';
import { logger } from '../utils/logger';

export function registerUtilityTools(server: Server): void {
  logger.info('Registering utility tools');

  // Reddit Explain Tool
  registerTool(server, {
    name: 'reddit_explain',
    description: 'Get explanations of Reddit concepts, terminology, and features. Useful for understanding Reddit-specific terms like karma, gilding, subreddits, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        concept: {
          type: 'string',
          description: 'Reddit concept to explain (e.g., "karma", "gilding", "subreddit", "crosspost", "flair")',
          minLength: 1
        }
      },
      required: ['concept']
    },
    handler: async (params: { concept: string }) => {
      const concept = params.concept.toLowerCase().trim();

      const explanations: Record<string, { title: string; explanation: string; related?: string[] }> = {
        karma: {
          title: 'Reddit Karma',
          explanation: 'Karma is Reddit\'s voting system that measures user contributions. Users earn karma when their posts or comments receive upvotes. There are two types: Link Karma (from posts) and Comment Karma (from comments). Karma serves as a reputation score but has no monetary value. Higher karma generally indicates active, quality participation in Reddit communities.',
          related: ['upvote', 'downvote', 'post', 'comment']
        },
        upvote: {
          title: 'Upvote',
          explanation: 'An upvote is a positive vote given to a post or comment. Upvoting indicates that content is valuable, interesting, or contributes to the discussion. Upvotes increase the post\'s/comment\'s score and visibility, and give karma to the author. Reddit uses upvotes (and downvotes) to determine content ranking and visibility.',
          related: ['downvote', 'karma', 'score']
        },
        downvote: {
          title: 'Downvote',
          explanation: 'A downvote is a negative vote given to a post or comment. Downvoting indicates that content is low-quality, off-topic, or doesn\'t contribute to the discussion. Downvotes decrease the post\'s/comment\'s score and visibility, and reduce the author\'s karma. Reddiquette suggests downvoting should be used for off-topic or rule-breaking content, not just disagreement.',
          related: ['upvote', 'karma', 'score', 'reddiquette']
        },
        subreddit: {
          title: 'Subreddit',
          explanation: 'A subreddit is a specific community or forum dedicated to a particular topic. Subreddits are denoted by r/name (e.g., r/technology, r/AskReddit). Each subreddit has its own rules, moderators, and culture. Users can subscribe to subreddits to see their content on their homepage. There are over 100,000 active subreddits covering virtually every topic imaginable.',
          related: ['moderator', 'subscribe', 'community']
        },
        gilding: {
          title: 'Gilding / Reddit Awards',
          explanation: 'Gilding (now called Awards) is a way to recognize exceptional content by giving virtual awards. Awards cost real money and provide benefits to recipients (like Reddit Premium). Common awards include Silver, Gold, and Platinum. Gold gives the recipient 1 week of Reddit Premium and 100 coins. Platinum gives 1 month of Premium and 700 coins. Awards appear as badges on posts/comments.',
          related: ['reddit premium', 'coins', 'award']
        },
        flair: {
          title: 'User and Post Flair',
          explanation: 'Flair is a tag or badge displayed next to usernames or posts within a subreddit. User flair shows a user\'s role, interests, or achievements in that community. Post flair categorizes posts (e.g., "Discussion", "Question", "Meme"). Flair is subreddit-specific and set by moderators or users (if allowed). It helps organize content and identify users.',
          related: ['subreddit', 'moderator', 'tag']
        },
        crosspost: {
          title: 'Crosspost',
          explanation: 'A crosspost (or x-post) is sharing a post from one subreddit to another. Crossposting creates a new post that links back to the original, giving credit to the original author. It\'s a way to share relevant content across communities. The original post\'s score and comments are not affected by the crosspost. Crossposting is allowed in most subreddits unless restricted by rules.',
          related: ['repost', 'share', 'subreddit']
        },
        moderator: {
          title: 'Moderator (Mod)',
          explanation: 'Moderators (mods) are volunteers who manage subreddits. They enforce rules, remove rule-breaking content, ban users, and shape community culture. Mods have special permissions like removing posts, banning users, and editing subreddit settings. They are identified by a green "M" badge. Each subreddit has its own mod team, independent of Reddit\'s admin staff.',
          related: ['subreddit', 'admin', 'rules', 'ban']
        },
        admin: {
          title: 'Reddit Admin',
          explanation: 'Admins are Reddit employees who manage the entire platform. Unlike moderators (who manage individual subreddits), admins have site-wide authority. They can intervene in any subreddit, suspend users site-wide, and make platform-level decisions. Admins are identified by a red "A" badge. They rarely intervene in subreddit matters unless site-wide rules are violated.',
          related: ['moderator', 'reddit', 'employee']
        },
        ama: {
          title: 'AMA (Ask Me Anything)',
          explanation: 'AMA stands for "Ask Me Anything" - a Q&A format where a person answers questions from the community. AMAs often feature celebrities, experts, or people with interesting experiences. They\'re popular in r/IAmA. The format typically involves the host making a post introducing themselves, then users ask questions in comments, which the host answers.',
          related: ['r/iama', 'post', 'comment', 'community']
        },
        op: {
          title: 'OP (Original Poster)',
          explanation: 'OP refers to the person who created the original post being discussed. In comments, OP might be used to ask questions or refer to the author. For example: "OP, can you provide more details?" OP is distinguished in comment threads, making it easy to identify the post author\'s responses.',
          related: ['post', 'author', 'comment']
        },
        reddiquette: {
          title: 'Reddiquette',
          explanation: 'Reddiquette is Reddit\'s informal code of conduct and etiquette guidelines. It includes suggestions like: remember the human, search before posting, vote based on quality (not opinion), don\'t ask for upvotes, and follow subreddit rules. While not enforced like rules, following reddiquette creates a better community experience.',
          related: ['rules', 'community', 'upvote', 'downvote']
        },
        'reddit premium': {
          title: 'Reddit Premium',
          explanation: 'Reddit Premium (formerly Reddit Gold) is a paid subscription service. Benefits include: ad-free browsing, access to r/lounge (exclusive subreddit), 700 coins per month for giving awards, and premium avatar features. It costs $5.99/month or $49.99/year. Users can also receive Premium temporarily by receiving certain awards like Gold or Platinum.',
          related: ['gilding', 'coins', 'award', 'r/lounge']
        },
        cake_day: {
          title: 'Cake Day',
          explanation: 'Cake Day is the anniversary of when a user created their Reddit account. On this day, a cake icon appears next to the user\'s username. It\'s a Reddit tradition to wish users "Happy Cake Day" and some users make special posts to celebrate. Cake Day is account-specific, not related to real birthdays.',
          related: ['account', 'anniversary', 'tradition']
        },
        nsfw: {
          title: 'NSFW (Not Safe For Work)',
          explanation: 'NSFW stands for "Not Safe For Work" - content that\'s inappropriate for viewing in public or professional settings. This includes adult content, gore, or disturbing material. NSFW posts are blurred by default and require confirmation to view. Users must mark NSFW content appropriately, and some subreddits are entirely NSFW. Reddit requires users to be 18+ to view NSFW content.',
          related: ['spoiler', 'content warning', 'adult']
        },
        spoiler: {
          title: 'Spoiler Tag',
          explanation: 'Spoiler tags hide content that might reveal plot details or surprises. Spoiler-tagged content is blurred and requires a click to view. Users should mark spoilers to avoid ruining experiences for others, especially for new releases. Spoiler tags are commonly used in entertainment subreddits (movies, TV shows, games).',
          related: ['nsfw', 'tag', 'content']
        },
        archive: {
          title: 'Archived Post',
          explanation: 'Posts are automatically archived after 6 months, making them read-only. Archived posts can\'t receive new votes, comments, or awards. The content remains visible and searchable. Archiving keeps old discussions from being revived and prevents necroposting. Moderators can still remove archived content if needed.',
          related: ['post', 'comment', 'locked']
        },
        locked: {
          title: 'Locked Post',
          explanation: 'A locked post prevents new comments but can still be voted on and viewed. Moderators lock posts when discussions become toxic, rule-breaking, or off-topic. Locking is a moderation tool to stop problematic discussions while keeping the content visible. Locked posts display a lock icon.',
          related: ['moderator', 'archive', 'removed']
        },
        removed: {
          title: 'Removed Content',
          explanation: 'Removed posts or comments are deleted by moderators (or admins) for breaking rules. Removed content is hidden from public view but remains visible to moderators and appears as "[removed]" to others. This differs from user-deleted content which shows as "[deleted]". Moderators can provide removal reasons.',
          related: ['moderator', 'deleted', 'banned']
        },
        shadowban: {
          title: 'Shadowban',
          explanation: 'A shadowban makes a user\'s posts and comments invisible to everyone except the user and moderators, without notifying the user. It\'s used against spammers and rule-breakers. Shadowbanned users can still vote and browse, but their contributions don\'t appear. Shadowbans are controversial and Reddit has largely moved to account suspensions instead.',
          related: ['ban', 'spam', 'suspended']
        },
        karma_farming: {
          title: 'Karma Farming',
          explanation: 'Karma farming is posting or commenting primarily to gain karma points, often through low-effort, repetitive, or manipulative content. Common tactics include reposting popular content, copying top comments, or posting in high-traffic subreddits. While not explicitly against rules, excessive karma farming is frowned upon and some subreddits have karma requirements to prevent it.',
          related: ['karma', 'repost', 'spam']
        },
        throwaway: {
          title: 'Throwaway Account',
          explanation: 'A throwaway account is a temporary account created for a specific purpose, often to maintain anonymity when sharing sensitive information. Users create throwaways for AMAs, personal stories, or asking embarrassing questions. Throwaway usernames often include "throwaway" in the name. They\'re acceptable on Reddit for privacy reasons.',
          related: ['account', 'privacy', 'ama', 'anonymous']
        }
      };

      // Try to find the explanation
      const result = explanations[concept];

      if (!result) {
        // Try fuzzy matching
        const similarConcepts = Object.keys(explanations).filter(key =>
          key.includes(concept) || concept.includes(key)
        );

        if (similarConcepts.length > 0) {
          const match = explanations[similarConcepts[0]];
          return formatToolResponse({
            concept: similarConcepts[0],
            title: match.title,
            explanation: match.explanation,
            related_concepts: match.related || [],
            note: `Did you mean "${similarConcepts[0]}"? Showing closest match.`
          });
        }

        // No match found
        return formatToolResponse({
          concept: params.concept,
          title: 'Concept Not Found',
          explanation: `No explanation found for "${params.concept}". Available concepts: ${Object.keys(explanations).join(', ')}`,
          available_concepts: Object.keys(explanations).sort()
        });
      }

      return formatToolResponse({
        concept,
        title: result.title,
        explanation: result.explanation,
        related_concepts: result.related || []
      });
    }
  });

  logger.info('Utility tools registered successfully', { count: 1 });
}
