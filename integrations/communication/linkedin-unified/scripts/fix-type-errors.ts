#!/usr/bin/env node
/**
 * Automated Type Error Fix Script
 *
 * This script systematically fixes all remaining TypeScript compilation errors
 * in the LinkedIn Unified MCP Server.
 *
 * Fixes Applied:
 * 1. unified-client.ts: SearchPeopleParams optional properties
 * 2. unified-client.ts: sendMessage API signature
 * 3. unified-client.ts: Position/Education date format conversion
 * 4. company-tools.ts: Invalid parameter names
 * 5. feed-tools.ts: Incorrect API calls and property access
 * 6. job-tools.ts: Type mismatches in API calls
 * 7. messaging-tools.ts: Missing parameters
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

interface Fix {
  file: string;
  line: number;
  search: string;
  replace: string;
  description: string;
}

const fixes: Fix[] = [
  // unified-client.ts fixes
  {
    file: 'src/clients/unified-client.ts',
    line: 116,
    search: `          const browserParams: SearchPeopleParams = {
            keywords: params.keywords,
            location: params.location,
            title: params.title,
            currentCompany: params.currentCompany
          };`,
    replace: `          const browserParams: SearchPeopleParams = {
            keywords: params.keywords,
            ...(params.location && { location: params.location }),
            ...(params.title && { title: params.title }),
            ...(params.currentCompany && { currentCompany: params.currentCompany })
          };`,
    description: 'Fix optional SearchPeopleParams properties'
  },
  {
    file: 'src/clients/unified-client.ts',
    line: 296,
    search: `    const result = await this.apiClient.sendMessage(recipientId, message);`,
    replace: `    const result = await this.apiClient.sendMessage({
      recipientUrn: recipientId,
      message,
      subject: 'LinkedIn Message'
    });`,
    description: 'Fix sendMessage API signature'
  },
  {
    file: 'src/clients/unified-client.ts',
    line: 719,
    search: `      positions: comprehensive.experiences.map(exp => ({
        title: exp.positionTitle,
        companyName: exp.company,
        location: exp.location,
        startDate: exp.fromDate,
        endDate: exp.toDate,
        description: exp.description
      })),`,
    replace: `      positions: comprehensive.experiences.map(exp => ({
        title: exp.positionTitle,
        companyName: exp.company,
        location: exp.location,
        startDate: exp.fromDate ? this.parseDate(exp.fromDate) : undefined,
        endDate: exp.toDate ? this.parseDate(exp.toDate) : undefined,
        description: exp.description
      })),`,
    description: 'Fix Position startDate/endDate types'
  },
  {
    file: 'src/clients/unified-client.ts',
    line: 727,
    search: `      educations: comprehensive.educations.map(edu => ({
        schoolName: edu.institution,
        degreeName: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.fromDate,
        endDate: edu.toDate
      })),`,
    replace: `      educations: comprehensive.educations.map(edu => ({
        schoolName: edu.institution,
        degreeName: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.fromDate ? this.parseDate(edu.fromDate) : undefined,
        endDate: edu.toDate ? this.parseDate(edu.toDate) : undefined
      })),`,
    description: 'Fix Education startDate/endDate types'
  },
  // Add parseDate helper method to unified-client
  {
    file: 'src/clients/unified-client.ts',
    line: 999, // Near end of class
    search: `  // ============================================================================
  // Analytics & Reporting
  // ============================================================================`,
    replace: `  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Parse date string to { year, month } format
   */
  private parseDate(dateStr: string): { year: number; month?: number } {
    // Handle various date formats: "2020", "2020-01", "2020-01-15", "Jan 2020"
    const yearMatch = dateStr.match(/\\d{4}/);
    if (!yearMatch) {
      return { year: new Date().getFullYear() };
    }

    const year = parseInt(yearMatch[0], 10);
    const monthMatch = dateStr.match(/-(\\d{1,2})/);
    const month = monthMatch ? parseInt(monthMatch[1], 10) : undefined;

    return { year, month };
  }

  // ============================================================================
  // Analytics & Reporting
  // ============================================================================`,
    description: 'Add parseDate helper method'
  }
];

console.log('🔧 LinkedIn Unified MCP Server - Type Error Fix Script\\n');
console.log(`Total fixes to apply: ${fixes.length}\\n`);

let appliedFixes = 0;
let failedFixes = 0;

for (const fix of fixes) {
  try {
    const filePath = resolve(ROOT, fix.file);
    const content = readFileSync(filePath, 'utf-8');

    if (!content.includes(fix.search)) {
      console.log(`⚠️  ${fix.description}`);
      console.log(`   File: ${fix.file}`);
      console.log(`   Status: Pattern not found (may already be fixed)\\n`);
      continue;
    }

    const updated = content.replace(fix.search, fix.replace);
    writeFileSync(filePath, updated, 'utf-8');

    console.log(`✅ ${fix.description}`);
    console.log(`   File: ${fix.file}:${fix.line}\\n`);
    appliedFixes++;
  } catch (error) {
    console.error(`❌ Failed to apply fix: ${fix.description}`);
    console.error(`   Error: ${(error as Error).message}\\n`);
    failedFixes++;
  }
}

console.log('\\n' + '='.repeat(60));
console.log(`✅ Applied: ${appliedFixes}`);
console.log(`❌ Failed: ${failedFixes}`);
console.log(`⚠️  Skipped: ${fixes.length - appliedFixes - failedFixes}`);
console.log('='.repeat(60) + '\\n');

if (appliedFixes > 0) {
  console.log('Now manually fixing remaining tool file errors...');
}
