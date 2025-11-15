import { google, chat_v1 } from 'googleapis';
import { logger } from '../utils/logger.js';

export type Space = chat_v1.Schema$Space;
export type Message = chat_v1.Schema$Message;
export type Membership = chat_v1.Schema$Membership;
export type Attachment = chat_v1.Schema$Attachment;
export type Reaction = chat_v1.Schema$Reaction;
export type User = chat_v1.Schema$User;

export class ChatClient {
  private _chat: chat_v1.Chat;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this._chat = google.chat({ version: 'v1', auth: oauth2Client });
  }

  get api(): chat_v1.Chat {
    return this._chat;
  }

  /**
   * Helper to extract space name from various formats
   */
  normalizeSpaceName(spaceName: string): string {
    if (spaceName.startsWith('spaces/')) {
      return spaceName;
    }
    return `spaces/${spaceName}`;
  }

  /**
   * Helper to extract message name from various formats
   */
  normalizeMessageName(spaceName: string, messageName: string): string {
    const normalizedSpace = this.normalizeSpaceName(spaceName);
    if (messageName.includes('/messages/')) {
      return messageName;
    }
    return `${normalizedSpace}/messages/${messageName}`;
  }

  /**
   * Helper to extract member name from various formats
   */
  normalizeMemberName(spaceName: string, memberName: string): string {
    const normalizedSpace = this.normalizeSpaceName(spaceName);
    if (memberName.includes('/members/')) {
      return memberName;
    }
    return `${normalizedSpace}/members/${memberName}`;
  }

  /**
   * Format space information for display
   */
  formatSpace(space: Space): any {
    return {
      name: space.name,
      displayName: space.displayName,
      spaceType: space.spaceType,
      singleUserBotDm: space.singleUserBotDm,
      threaded: space.threaded,
      spaceThreadingState: space.spaceThreadingState,
      spaceDetails: space.spaceDetails,
      createTime: space.createTime,
      adminInstalled: space.adminInstalled
    };
  }

  /**
   * Format message for display
   */
  formatMessage(message: Message): any {
    return {
      name: message.name,
      sender: message.sender,
      createTime: message.createTime,
      lastUpdateTime: message.lastUpdateTime,
      text: message.text,
      formattedText: message.formattedText,
      thread: message.thread,
      space: message.space,
      argumentText: message.argumentText,
      attachments: message.attachments,
      reactions: message.reactions,
      annotations: message.annotations
    };
  }

  /**
   * Format membership for display
   */
  formatMembership(membership: Membership): any {
    return {
      name: membership.name,
      state: membership.state,
      role: membership.role,
      member: membership.member,
      createTime: membership.createTime,
      deleteTime: membership.deleteTime
    };
  }
}
