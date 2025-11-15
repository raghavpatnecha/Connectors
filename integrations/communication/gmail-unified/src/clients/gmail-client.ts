import { google, gmail_v1 } from 'googleapis';
import { logger } from '../utils/logger.js';

export type Draft = gmail_v1.Schema$Draft;
export type Message = gmail_v1.Schema$Message;
export type MessagePart = gmail_v1.Schema$MessagePart;
export type MessagePartBody = gmail_v1.Schema$MessagePartBody;
export type MessagePartHeader = gmail_v1.Schema$MessagePartHeader;
export type Thread = gmail_v1.Schema$Thread;

const RESPONSE_HEADERS_LIST = [
  'Date',
  'From',
  'To',
  'Subject',
  'Message-ID',
  'In-Reply-To',
  'References'
];

export class GmailClient {
  private _gmail: gmail_v1.Gmail;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this._gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  get api(): gmail_v1.Gmail {
    return this._gmail;
  }

  // Message part processing
  decodedBody(body: MessagePartBody): MessagePartBody {
    if (!body?.data) return body;

    const decodedData = Buffer.from(body.data, 'base64').toString('utf-8');
    return {
      data: decodedData,
      size: body.data.length,
      attachmentId: body.attachmentId
    };
  }

  processMessagePart(messagePart: MessagePart, includeBodyHtml = false): MessagePart {
    if ((messagePart.mimeType !== 'text/html' || includeBodyHtml) && messagePart.body) {
      messagePart.body = this.decodedBody(messagePart.body);
    }

    if (messagePart.parts) {
      messagePart.parts = messagePart.parts.map(part => this.processMessagePart(part, includeBodyHtml));
    }

    if (messagePart.headers) {
      messagePart.headers = messagePart.headers.filter(
        header => RESPONSE_HEADERS_LIST.includes(header.name || '')
      );
    }

    return messagePart;
  }

  findHeader(headers: MessagePartHeader[] | undefined, name: string): string | undefined {
    if (!headers || !Array.isArray(headers) || !name) return undefined;
    return headers.find(h => h?.name?.toLowerCase() === name.toLowerCase())?.value ?? undefined;
  }

  formatEmailList(emailList: string | null | undefined): string[] {
    if (!emailList) return [];
    return emailList.split(',').map(email => email.trim());
  }

  // Thread helpers
  getNestedHistory(messagePart: MessagePart, level = 1): string {
    if (messagePart.mimeType === 'text/plain' && messagePart.body?.data) {
      const { data } = this.decodedBody(messagePart.body);
      if (!data) return '';
      return data.split('\n').map(line => '>' + (line.startsWith('>') ? '' : ' ') + line).join('\n');
    }

    return (messagePart.parts || [])
      .map(p => this.getNestedHistory(p, level + 1))
      .filter(p => p)
      .join('\n');
  }

  getQuotedContent(thread: Thread): string {
    if (!thread.messages?.length) return '';

    const sentMessages = thread.messages.filter(msg =>
      msg.labelIds?.includes('SENT') ||
      (!msg.labelIds?.includes('DRAFT') && this.findHeader(msg.payload?.headers || [], 'date'))
    );

    if (!sentMessages.length) return '';

    const lastMessage = sentMessages[sentMessages.length - 1];
    if (!lastMessage?.payload) return '';

    const quotedContent = [];

    if (lastMessage.payload.headers) {
      const fromHeader = this.findHeader(lastMessage.payload.headers || [], 'from');
      const dateHeader = this.findHeader(lastMessage.payload.headers || [], 'date');
      if (fromHeader && dateHeader) {
        quotedContent.push('');
        quotedContent.push(`On ${dateHeader} ${fromHeader} wrote:`);
        quotedContent.push('');
      }
    }

    const nestedHistory = this.getNestedHistory(lastMessage.payload);
    if (nestedHistory) {
      quotedContent.push(nestedHistory);
      quotedContent.push('');
    }

    return quotedContent.join('\n');
  }

  getThreadHeaders(thread: Thread): string[] {
    const headers: string[] = [];

    if (!thread.messages?.length) return headers;

    const lastMessage = thread.messages[thread.messages.length - 1];
    const references: string[] = [];

    let subjectHeader = this.findHeader(lastMessage.payload?.headers || [], 'subject');
    if (subjectHeader) {
      if (!subjectHeader.toLowerCase().startsWith('re:')) {
        subjectHeader = `Re: ${subjectHeader}`;
      }
      headers.push(`Subject: ${subjectHeader}`);
    }

    const messageIdHeader = this.findHeader(lastMessage.payload?.headers || [], 'message-id');
    if (messageIdHeader) {
      headers.push(`In-Reply-To: ${messageIdHeader}`);
      references.push(messageIdHeader);
    }

    const referencesHeader = this.findHeader(lastMessage.payload?.headers || [], 'references');
    if (referencesHeader) references.unshift(...referencesHeader.split(' '));

    if (references.length > 0) headers.push(`References: ${references.join(' ')}`);

    return headers;
  }

  wrapTextBody(text: string): string {
    return text.split('\n').map(line => {
      if (line.length <= 76) return line;
      const chunks = line.match(/.{1,76}/g) || [];
      return chunks.join('=\n');
    }).join('\n');
  }

  async constructRawMessage(params: {
    threadId?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
  }): Promise<string> {
    let thread: Thread | null = null;
    if (params.threadId) {
      const { data } = await this._gmail.users.threads.get({
        userId: 'me',
        id: params.threadId,
        format: 'full'
      });
      thread = data;
    }

    const message = [];
    if (params.to?.length) message.push(`To: ${this.wrapTextBody(params.to.join(', '))}`);
    if (params.cc?.length) message.push(`Cc: ${this.wrapTextBody(params.cc.join(', '))}`);
    if (params.bcc?.length) message.push(`Bcc: ${this.wrapTextBody(params.bcc.join(', '))}`);

    if (thread) {
      message.push(...this.getThreadHeaders(thread).map(header => this.wrapTextBody(header)));
    } else if (params.subject) {
      message.push(`Subject: ${this.wrapTextBody(params.subject)}`);
    } else {
      message.push('Subject: (No Subject)');
    }

    message.push('Content-Type: text/plain; charset="UTF-8"');
    message.push('Content-Transfer-Encoding: quoted-printable');
    message.push('MIME-Version: 1.0');
    message.push('');

    if (params.body) message.push(this.wrapTextBody(params.body));

    if (thread) {
      const quotedContent = this.getQuotedContent(thread);
      if (quotedContent) {
        message.push('');
        message.push(this.wrapTextBody(quotedContent));
      }
    }

    return Buffer.from(message.join('\r\n'))
      .toString('base64url')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
