/**
 * Google OAuth Configuration
 * Comprehensive scopes for all Google Workspace services
 */

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * All Google Workspace API scopes organized by service
 */
export const GOOGLE_SCOPES = {
  // Gmail
  GMAIL_READ: 'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
  GMAIL_COMPOSE: 'https://www.googleapis.com/auth/gmail.compose',
  GMAIL_SEND: 'https://www.googleapis.com/auth/gmail.send',
  GMAIL_LABELS: 'https://www.googleapis.com/auth/gmail.labels',
  GMAIL_SETTINGS_BASIC: 'https://www.googleapis.com/auth/gmail.settings.basic',
  GMAIL_SETTINGS_SHARING:
    'https://www.googleapis.com/auth/gmail.settings.sharing',

  // Google Drive
  DRIVE: 'https://www.googleapis.com/auth/drive',
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
  DRIVE_METADATA: 'https://www.googleapis.com/auth/drive.metadata',
  DRIVE_METADATA_READONLY:
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  DRIVE_APPDATA: 'https://www.googleapis.com/auth/drive.appdata',

  // Google Calendar
  CALENDAR: 'https://www.googleapis.com/auth/calendar',
  CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  CALENDAR_EVENTS_READONLY:
    'https://www.googleapis.com/auth/calendar.events.readonly',
  CALENDAR_SETTINGS_READONLY:
    'https://www.googleapis.com/auth/calendar.settings.readonly',

  // Google Sheets
  SPREADSHEETS: 'https://www.googleapis.com/auth/spreadsheets',
  SPREADSHEETS_READONLY:
    'https://www.googleapis.com/auth/spreadsheets.readonly',

  // Google Docs
  DOCUMENTS: 'https://www.googleapis.com/auth/documents',
  DOCUMENTS_READONLY: 'https://www.googleapis.com/auth/documents.readonly',

  // Google Slides
  PRESENTATIONS: 'https://www.googleapis.com/auth/presentations',
  PRESENTATIONS_READONLY:
    'https://www.googleapis.com/auth/presentations.readonly',

  // Google Forms
  FORMS_BODY: 'https://www.googleapis.com/auth/forms.body',
  FORMS_BODY_READONLY: 'https://www.googleapis.com/auth/forms.body.readonly',
  FORMS_RESPONSES_READONLY:
    'https://www.googleapis.com/auth/forms.responses.readonly',

  // Google Tasks
  TASKS: 'https://www.googleapis.com/auth/tasks',
  TASKS_READONLY: 'https://www.googleapis.com/auth/tasks.readonly',

  // Google Chat
  CHAT_MESSAGES: 'https://www.googleapis.com/auth/chat.messages',
  CHAT_MESSAGES_CREATE:
    'https://www.googleapis.com/auth/chat.messages.create',
  CHAT_SPACES: 'https://www.googleapis.com/auth/chat.spaces',
  CHAT_SPACES_READONLY:
    'https://www.googleapis.com/auth/chat.spaces.readonly',

  // Google People (Contacts)
  CONTACTS: 'https://www.googleapis.com/auth/contacts',
  CONTACTS_READONLY: 'https://www.googleapis.com/auth/contacts.readonly',
  CONTACTS_OTHER_READONLY:
    'https://www.googleapis.com/auth/contacts.other.readonly',
  USERINFO_PROFILE: 'https://www.googleapis.com/auth/userinfo.profile',
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email',

  // Google Admin Directory
  ADMIN_DIRECTORY_USER:
    'https://www.googleapis.com/auth/admin.directory.user',
  ADMIN_DIRECTORY_USER_READONLY:
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
  ADMIN_DIRECTORY_GROUP:
    'https://www.googleapis.com/auth/admin.directory.group',
  ADMIN_DIRECTORY_GROUP_READONLY:
    'https://www.googleapis.com/auth/admin.directory.group.readonly',
  ADMIN_DIRECTORY_ORGUNIT:
    'https://www.googleapis.com/auth/admin.directory.orgunit',
  ADMIN_DIRECTORY_ORGUNIT_READONLY:
    'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
};

/**
 * Comprehensive scope sets for different use cases
 */
export const SCOPE_SETS = {
  // Phase 1: Gmail, Drive, Calendar
  PHASE1_FULL: [
    GOOGLE_SCOPES.GMAIL_MODIFY,
    GOOGLE_SCOPES.GMAIL_COMPOSE,
    GOOGLE_SCOPES.GMAIL_SEND,
    GOOGLE_SCOPES.GMAIL_LABELS,
    GOOGLE_SCOPES.GMAIL_SETTINGS_BASIC,
    GOOGLE_SCOPES.DRIVE,
    GOOGLE_SCOPES.CALENDAR,
  ],

  PHASE1_READONLY: [
    GOOGLE_SCOPES.GMAIL_READ,
    GOOGLE_SCOPES.DRIVE_READONLY,
    GOOGLE_SCOPES.CALENDAR_READONLY,
  ],

  // Phase 2: Sheets, Docs, Slides
  PHASE2_FULL: [
    GOOGLE_SCOPES.SPREADSHEETS,
    GOOGLE_SCOPES.DOCUMENTS,
    GOOGLE_SCOPES.PRESENTATIONS,
  ],

  PHASE2_READONLY: [
    GOOGLE_SCOPES.SPREADSHEETS_READONLY,
    GOOGLE_SCOPES.DOCUMENTS_READONLY,
    GOOGLE_SCOPES.PRESENTATIONS_READONLY,
  ],

  // Phase 3: Forms, Tasks, Chat
  PHASE3_FULL: [
    GOOGLE_SCOPES.FORMS_BODY,
    GOOGLE_SCOPES.FORMS_RESPONSES_READONLY,
    GOOGLE_SCOPES.TASKS,
    GOOGLE_SCOPES.CHAT_MESSAGES,
    GOOGLE_SCOPES.CHAT_SPACES,
  ],

  // Admin (requires domain-wide delegation)
  ADMIN: [
    GOOGLE_SCOPES.ADMIN_DIRECTORY_USER,
    GOOGLE_SCOPES.ADMIN_DIRECTORY_GROUP,
    GOOGLE_SCOPES.ADMIN_DIRECTORY_ORGUNIT,
  ],

  // Complete access (all services)
  ALL_WORKSPACE: [
    // Gmail
    GOOGLE_SCOPES.GMAIL_MODIFY,
    GOOGLE_SCOPES.GMAIL_COMPOSE,
    GOOGLE_SCOPES.GMAIL_SEND,
    GOOGLE_SCOPES.GMAIL_LABELS,
    GOOGLE_SCOPES.GMAIL_SETTINGS_BASIC,
    // Drive
    GOOGLE_SCOPES.DRIVE,
    // Calendar
    GOOGLE_SCOPES.CALENDAR,
    // Sheets, Docs, Slides
    GOOGLE_SCOPES.SPREADSHEETS,
    GOOGLE_SCOPES.DOCUMENTS,
    GOOGLE_SCOPES.PRESENTATIONS,
    // Forms, Tasks
    GOOGLE_SCOPES.FORMS_BODY,
    GOOGLE_SCOPES.FORMS_RESPONSES_READONLY,
    GOOGLE_SCOPES.TASKS,
    // Chat
    GOOGLE_SCOPES.CHAT_MESSAGES,
    GOOGLE_SCOPES.CHAT_SPACES,
    // People
    GOOGLE_SCOPES.CONTACTS,
    GOOGLE_SCOPES.USERINFO_PROFILE,
    GOOGLE_SCOPES.USERINFO_EMAIL,
  ],
};

/**
 * Default Google OAuth configuration from environment variables
 */
export const GOOGLE_OAUTH_CONFIG: GoogleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri:
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/google/callback',
  scopes: SCOPE_SETS.ALL_WORKSPACE,
};

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(config: GoogleOAuthConfig): boolean {
  if (!config.clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required');
  }

  if (!config.clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
  }

  if (!config.redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI environment variable is required');
  }

  if (!config.scopes || config.scopes.length === 0) {
    throw new Error('At least one OAuth scope is required');
  }

  return true;
}

/**
 * Get scopes for specific service
 */
export function getScopesForService(service: string): string[] {
  const scopeMap: Record<string, string[]> = {
    gmail: [
      GOOGLE_SCOPES.GMAIL_MODIFY,
      GOOGLE_SCOPES.GMAIL_COMPOSE,
      GOOGLE_SCOPES.GMAIL_SEND,
      GOOGLE_SCOPES.GMAIL_LABELS,
    ],
    drive: [GOOGLE_SCOPES.DRIVE],
    calendar: [GOOGLE_SCOPES.CALENDAR],
    sheets: [GOOGLE_SCOPES.SPREADSHEETS],
    docs: [GOOGLE_SCOPES.DOCUMENTS],
    slides: [GOOGLE_SCOPES.PRESENTATIONS],
    forms: [GOOGLE_SCOPES.FORMS_BODY, GOOGLE_SCOPES.FORMS_RESPONSES_READONLY],
    tasks: [GOOGLE_SCOPES.TASKS],
    chat: [GOOGLE_SCOPES.CHAT_MESSAGES, GOOGLE_SCOPES.CHAT_SPACES],
    people: [GOOGLE_SCOPES.CONTACTS, GOOGLE_SCOPES.USERINFO_PROFILE],
    admin: [
      GOOGLE_SCOPES.ADMIN_DIRECTORY_USER,
      GOOGLE_SCOPES.ADMIN_DIRECTORY_GROUP,
    ],
  };

  return scopeMap[service.toLowerCase()] || [];
}

/**
 * Check if scopes include required permissions
 */
export function hasRequiredScopes(
  grantedScopes: string[],
  requiredScopes: string[]
): boolean {
  return requiredScopes.every((required) => grantedScopes.includes(required));
}
