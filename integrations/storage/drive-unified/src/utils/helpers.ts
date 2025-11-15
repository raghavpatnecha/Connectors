/**
 * Drive Helper Utilities
 * Shared functions for Drive operations
 */

import * as AdmZip from 'adm-zip';

/**
 * Build Drive API list parameters with proper defaults
 */
export function buildDriveListParams(options: {
  query: string;
  pageSize: number;
  driveId?: string;
  includeItemsFromAllDrives?: boolean;
  corpora?: string;
}): any {
  const params: any = {
    q: options.query,
    pageSize: options.pageSize,
    fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: options.includeItemsFromAllDrives !== false
  };

  if (options.driveId) {
    params.driveId = options.driveId;
    params.corpora = options.corpora || 'drive';
  } else if (options.corpora) {
    params.corpora = options.corpora;
  }

  return params;
}

/**
 * Extract text from Office Open XML files (.docx, .xlsx, .pptx)
 */
export function extractOfficeXmlText(buffer: Buffer, mimeType: string): string | null {
  try {
    const zip = new AdmZip(buffer);
    let text = '';

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract from .docx
      const entry = zip.getEntry('word/document.xml');
      if (entry) {
        const content = zip.readAsText(entry);
        text = content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Extract from .xlsx (shared strings)
      const entry = zip.getEntry('xl/sharedStrings.xml');
      if (entry) {
        const content = zip.readAsText(entry);
        text = content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // Extract from .pptx (slides)
      const slideFiles = zip.getEntries().filter(e => e.entryName.startsWith('ppt/slides/slide'));
      for (const slide of slideFiles) {
        const content = zip.readAsText(slide);
        text += content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() + '\n';
      }
    }

    return text || null;
  } catch (error) {
    console.error('Failed to extract Office XML text:', error);
    return null;
  }
}

/**
 * Check if file has public link permission
 */
export function hasPublicLinkPermission(permissions: any[]): boolean {
  return permissions.some(
    p => p.type === 'anyone' && ['reader', 'writer', 'commenter'].includes(p.role)
  );
}

/**
 * Get Drive image URL for public files
 */
export function getDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
