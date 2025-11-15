# Gmail Unified MCP - Code Examples

## Core Implementation Patterns

### 1. Tool Registration Pattern

```typescript
// src/tools/messages.ts
export function registerMessageTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  registry.registerTool(
    'send_message',
    'Send an email message to specified recipients',
    sendMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      let raw = params.raw;
      if (!raw) {
        raw = await client.constructRawMessage({
          threadId: params.threadId,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          subject: params.subject,
          body: params.body
        });
      }

      const { data } = await client.api.users.messages.send({
        userId: 'me',
        requestBody: { raw, threadId: params.threadId }
      });

      return registry.formatResponse(data);
    }
  );
}
```

### 2. Gmail Client Usage

```typescript
// src/clients/gmail-client.ts - Message Part Processing
processMessagePart(messagePart: MessagePart, includeBodyHtml = false): MessagePart {
  // Decode base64 body
  if ((messagePart.mimeType !== 'text/html' || includeBodyHtml) && messagePart.body) {
    messagePart.body = this.decodedBody(messagePart.body);
  }

  // Process nested parts recursively
  if (messagePart.parts) {
    messagePart.parts = messagePart.parts.map(part =>
      this.processMessagePart(part, includeBodyHtml)
    );
  }

  // Filter headers to essential ones only
  if (messagePart.headers) {
    messagePart.headers = messagePart.headers.filter(
      header => RESPONSE_HEADERS_LIST.includes(header.name || '')
    );
  }

  return messagePart;
}
```

### 3. Raw Message Construction

```typescript
// Constructing RFC 2822 compliant email with thread support
async constructRawMessage(params: {
  threadId?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
}): Promise<string> {
  let thread: Thread | null = null;

  // Fetch thread for reply context
  if (params.threadId) {
    const { data } = await this._gmail.users.threads.get({
      userId: 'me',
      id: params.threadId,
      format: 'full'
    });
    thread = data;
  }

  const message = [];

  // Headers
  if (params.to?.length) message.push(`To: ${this.wrapTextBody(params.to.join(', '))}`);
  if (params.cc?.length) message.push(`Cc: ${this.wrapTextBody(params.cc.join(', '))}`);
  if (params.bcc?.length) message.push(`Bcc: ${this.wrapTextBody(params.bcc.join(', '))}`);

  // Thread reply headers (In-Reply-To, References)
  if (thread) {
    message.push(...this.getThreadHeaders(thread).map(h => this.wrapTextBody(h)));
  } else if (params.subject) {
    message.push(`Subject: ${this.wrapTextBody(params.subject)}`);
  }

  message.push('Content-Type: text/plain; charset="UTF-8"');
  message.push('MIME-Version: 1.0');
  message.push('');

  // Body with quoted content for replies
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
```

### 4. Settings Tool Example

```typescript
// src/tools/settings.ts - Create Filter
registry.registerTool(
  'create_filter',
  'Create a new filter',
  createFilterSchema,
  async (params) => {
    const accessToken = await getAccessToken(params.tenantId);
    const client = new GmailClient(accessToken);

    const { tenantId, ...filterData } = params;
    const { data } = await client.api.users.settings.filters.create({
      userId: 'me',
      requestBody: filterData
    });

    return registry.formatResponse(data);
  }
);
```

### 5. Dual Server Setup

```typescript
// src/index.ts - Main entry point
async function main() {
  // MCP Server (stdio)
  const mcpServer = createMCPServer();
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  logger.info('Gmail Unified MCP Server started (stdio mode)');

  // OAuth Server (HTTP)
  const oauthApp = createOAuthServer();
  oauthApp.listen(PORT, () => {
    logger.info(`OAuth HTTP server listening on port ${PORT}`);
  });
}
```

## Usage Examples

### Example 1: Send Simple Email

```json
{
  "method": "tools/call",
  "params": {
    "name": "send_message",
    "arguments": {
      "tenantId": "acme-corp",
      "to": ["john@example.com"],
      "subject": "Project Update",
      "body": "The Q4 report is ready for review."
    }
  }
}
```

### Example 2: Reply to Thread

```json
{
  "method": "tools/call",
  "params": {
    "name": "send_message",
    "arguments": {
      "tenantId": "acme-corp",
      "threadId": "18c5f8e9a1b2c3d4",
      "to": ["team@example.com"],
      "body": "Thanks for the update! Looks great."
    }
  }
}
```

### Example 3: Create Label with Color

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_label",
    "arguments": {
      "tenantId": "acme-corp",
      "name": "Important Clients",
      "messageListVisibility": "show",
      "labelListVisibility": "labelShow",
      "color": {
        "textColor": "#ffffff",
        "backgroundColor": "#ff0000"
      }
    }
  }
}
```

### Example 4: Batch Modify Messages

```json
{
  "method": "tools/call",
  "params": {
    "name": "batch_modify_messages",
    "arguments": {
      "tenantId": "acme-corp",
      "ids": ["18c5f8e9a1b2c3d4", "18c5f8e9a1b2c3d5", "18c5f8e9a1b2c3d6"],
      "addLabelIds": ["INBOX", "IMPORTANT"],
      "removeLabelIds": ["SPAM"]
    }
  }
}
```

### Example 5: Create Email Filter

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_filter",
    "arguments": {
      "tenantId": "acme-corp",
      "criteria": {
        "from": "notifications@github.com",
        "hasAttachment": false,
        "excludeChats": true
      },
      "action": {
        "addLabelIds": ["Label_GitHub"],
        "removeLabelIds": ["INBOX"]
      }
    }
  }
}
```

### Example 6: Update Vacation Responder

```json
{
  "method": "tools/call",
  "params": {
    "name": "update_vacation",
    "arguments": {
      "tenantId": "acme-corp",
      "enableAutoReply": true,
      "responseSubject": "Out of Office",
      "responseBodyPlainText": "I'm currently out of office and will return on January 15th. For urgent matters, please contact support@company.com.",
      "restrictToContacts": true,
      "startTime": "1704067200000",
      "endTime": "1705276800000"
    }
  }
}
```

### Example 7: Add Delegate

```json
{
  "method": "tools/call",
  "params": {
    "name": "add_delegate",
    "arguments": {
      "tenantId": "acme-corp",
      "delegateEmail": "assistant@company.com"
    }
  }
}
```

### Example 8: Create Send-as Alias

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_send_as",
    "arguments": {
      "tenantId": "acme-corp",
      "sendAsEmail": "support@company.com",
      "displayName": "Company Support",
      "replyToAddress": "noreply@company.com",
      "signature": "<p>Best regards,<br>Support Team</p>",
      "isPrimary": false,
      "treatAsAlias": true
    }
  }
}
```

### Example 9: List Messages with Query

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_messages",
    "arguments": {
      "tenantId": "acme-corp",
      "q": "from:github.com is:unread",
      "maxResults": 50,
      "labelIds": ["INBOX"],
      "includeBodyHtml": false
    }
  }
}
```

### Example 10: Import Message

```json
{
  "method": "tools/call",
  "params": {
    "name": "import_message",
    "arguments": {
      "tenantId": "acme-corp",
      "raw": "VG86IHRlc3RAdGVzdC5jb20KRnJvbTogc2VuZGVyQHRlc3QuY29tClN1YmplY3Q6IFRlc3QKCkJvZHkgY29udGVudA==",
      "neverMarkSpam": true,
      "processForCalendar": false,
      "labelIds": ["INBOX", "IMPORTED"]
    }
  }
}
```

## Error Handling Examples

### OAuth Error

```json
{
  "error": "No access token found for tenant: acme-corp",
  "details": "Error: No access token found for tenant: acme-corp\n    at getAccessTokenForTenant..."
}
```

### Validation Error

```json
{
  "error": "Invalid input: Expected string, received number",
  "details": "[{\"code\":\"invalid_type\",\"expected\":\"string\",\"received\":\"number\",\"path\":[\"tenantId\"],...}]"
}
```

### Gmail API Error

```json
{
  "error": "Tool execution failed: Request had invalid authentication credentials.",
  "details": "GaxiosError: Request failed with status code 401"
}
```

## Integration with Vault (Planned)

```typescript
// Future implementation
import { VaultClient } from '../../shared/google-auth/vault-client.js';

async function getAccessTokenForTenant(tenantId: string): Promise<string> {
  const vaultClient = new VaultClient({
    address: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN
  });

  const credentials = await vaultClient.getCredentials(tenantId, 'gmail');

  // Auto-refresh if needed
  if (credentials.isExpired()) {
    const refreshed = await vaultClient.refreshCredentials(tenantId, 'gmail');
    return refreshed.accessToken;
  }

  return credentials.accessToken;
}
```

## Testing

### Unit Test Example

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { GmailClient } from '../src/clients/gmail-client';

describe('GmailClient', () => {
  it('should process message part correctly', () => {
    const client = new GmailClient('fake-token');

    const messagePart = {
      mimeType: 'text/plain',
      body: {
        data: 'SGVsbG8gV29ybGQ=', // "Hello World" in base64
        size: 11
      },
      headers: [
        { name: 'From', value: 'sender@example.com' },
        { name: 'X-Custom', value: 'should-be-filtered' }
      ]
    };

    const processed = client.processMessagePart(messagePart, false);

    expect(processed.body?.data).toBe('Hello World');
    expect(processed.headers?.length).toBe(1); // Only 'From' kept
  });
});
```

## Performance Considerations

1. **Message Processing**: Body decoding is lazy - only decoded when `includeBodyHtml` is true
2. **Pagination**: Draft listing automatically handles pagination internally
3. **Caching**: Access tokens should be cached by VaultClient
4. **Rate Limiting**: Implement in gateway layer, not individual tools

## Security Best Practices

1. **Never log access tokens** - Only log tenantId
2. **Validate all inputs** - Zod schemas enforce this
3. **Sanitize email content** - Use base64url encoding
4. **Audit logging** - All tool calls logged with Winston
5. **Token rotation** - Vault handles automatic refresh
