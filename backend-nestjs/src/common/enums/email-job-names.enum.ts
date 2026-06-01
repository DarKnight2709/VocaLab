/**
 * Standard job names for the email-notification queue
 */
export enum EmailJobNames {
  SEND_DIRECT_MESSAGE_EMAIL = 'send-direct-message-email',
  SEND_GROUP_MESSAGE_EMAIL = 'send-group-message-email',
  COMMENT_ON_POST_EMAIL = 'comment-on-post-email',
  REPLY_ON_COMMENT_EMAIL = 'reply-on-comment-email',
  UPVOTE_ON_POST_EMAIL = 'upvote-on-post-email',
  UPVOTE_ON_COMMENT_EMAIL = 'upvote-on-comment-email',
  NEW_FOLLOWER_EMAIL = 'new-follower-email',
  NEW_BLOG_POST_EMAIL = 'new-blog-post-email',
}
