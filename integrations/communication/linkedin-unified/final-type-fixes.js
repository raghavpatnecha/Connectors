const fs = require('fs');

console.log('Applying final type fixes...');

// Fix 1: Replace McpServer with Server in all tool files
['people-tools', 'job-tools', 'messaging-tools', 'feed-tools', 'company-tools'].forEach(file => {
  const path = `src/tools/${file}.ts`;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/McpServer/g, 'Server');
  fs.writeFileSync(path, content);
  console.log(`✅ Fixed ${file} - replaced McpServer with Server`);
});

// Fix 2: unified-client - remove title from SearchPeopleParams
let unified = fs.readFileSync('src/clients/unified-client.ts', 'utf8');

unified = unified.replace(
  `const browserParams: SearchPeopleParams = {
        keywords: params.keywords || '',
        location: params.location || '',
        title: params.title,
        currentCompany: params.currentCompany?.[0]
      };`,
  `const browserParams: SearchPeopleParams = {
        keywords: params.keywords || '',
        location: params.location || '',
        currentCompany: params.currentCompany?.[0]
      };`
);

// Fix likePost - already should be fixed but double check
unified = unified.replace(
  'await this.browserClient.likePost(postUrl, reactionType);',
  'await this.browserClient.likePost(postUrl);'
);

// Fix date conversion more carefully
unified = unified.replace(
  /startDate: exp\.startDate \? \{ year: parseInt\(exp\.startDate\) \} : undefined,\s+endDate: exp\.endDate \? \{ year: parseInt\(exp\.endDate\) \} : undefined,/g,
  `startDate: exp.startDate ? { year: parseInt(String(exp.startDate).substring(0, 4)) } : undefined,
          endDate: exp.endDate ? { year: parseInt(String(exp.endDate).substring(0, 4)) } : undefined,`
);

unified = unified.replace(
  /startDate: edu\.startDate \? \{ year: parseInt\(edu\.startDate\) \} : undefined,\s+endDate: edu\.endDate \? \{ year: parseInt\(edu\.endDate\) \} : undefined/g,
  `startDate: edu.startDate ? { year: parseInt(String(edu.startDate).substring(0, 4)) } : undefined,
          endDate: edu.endDate ? { year: parseInt(String(edu.endDate).substring(0, 4)) } : undefined`
);

fs.writeFileSync('src/clients/unified-client.ts', unified);
console.log('✅ Fixed unified-client.ts');

// Fix 3: feed-tools - remove .posts properties and fix method calls
let feed = fs.readFileSync('src/tools/feed-tools.ts', 'utf8');

// browseFeed already returns Post[], not { posts: Post[] }
feed = feed.replace(
  `count: posts.posts.length,`,
  `count: posts.length,`
);
feed = feed.replace(
  `postsRetrieved: posts.posts.length,`,
  `postsRetrieved: posts.length,`
);
feed = feed.replace(
  `totalLikes: posts.posts.reduce((sum, p) => sum + (p.likes || 0), 0),`,
  `totalLikes: posts.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),`
);
feed = feed.replace(
  `totalComments: posts.posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),`,
  `totalComments: posts.reduce((sum: number, p: any) => sum + (p.commentCount || 0), 0),`
);
feed = feed.replace(
  `totalShares: posts.posts.reduce((sum, p) => sum + (p.shareCount || 0), 0)`,
  `totalShares: posts.reduce((sum: number, p: any) => sum + (p.shareCount || 0), 0)`
);

// Fix likePost result properties
feed = feed.replace(
  `success: result.success,
                status: result.status,
                wasAlreadyLiked: result.wasAlreadyLiked,
                newLikeCount: result.newLikeCount,`,
  `success: result.success,
                wasAlreadyLiked: result.wasAlreadyLiked,`
);

// Fix comment on post - ensure it has 2 params
feed = feed.replace(
  'const result = await client.commentOnPost(params.postUrl);',
  'const result = await client.commentOnPost(params.postUrl, params.comment);'
);

fs.writeFileSync('src/tools/feed-tools.ts', feed);
console.log('✅ Fixed feed-tools.ts');

// Fix 4: job-tools - remove .jobs properties
let job = fs.readFileSync('src/tools/job-tools.ts', 'utf8');

job = job.replace(
  `count: jobs.jobs.length,`,
  `count: jobs.length,`
);
job = job.replace(
  `jobsRetrieved: jobs.jobs.length,`,
  `jobsRetrieved: jobs.length,`
);

// Remove 'remote' parameter
job = job.replace(
  `keywords: params.keywords,
          location: params.location,
          companies: params.companies,
          experienceLevel: params.experienceLevel,
          jobType: params.jobType,
          remote: params.remote,
          postedWithin: params.postedWithin,
          count: params.limit || 25`,
  `keywords: params.keywords,
          location: params.location,
          companies: params.companies,
          experienceLevel: params.experienceLevel,
          jobType: params.jobType,
          postedWithin: params.postedWithin,
          count: params.limit || 25`
);

// Fix applyToJob call - should be already fixed but ensure
job = job.replace(
  `const result = await client.applyToJob({
        jobId: params.jobId,
        resume: params.resume,
        coverLetter: params.coverLetter,
        answers: params.answers,
        useEasyApply: params.useEasyApply,
        confirmBeforeSubmit: params.confirmBeforeSubmit
      });`,
  `const result = await client.applyToJob(params.jobId, params.coverLetter);`
);

// Fix result status property
job = job.replace(
  `success: result.success,
                status: result.status,
                applicationId: result.applicationId,`,
  `success: result.success,`
);

fs.writeFileSync('src/tools/job-tools.ts', job);
console.log('✅ Fixed job-tools.ts');

// Fix 5: messaging-tools - fix sendMessage call
let messaging = fs.readFileSync('src/tools/messaging-tools.ts', 'utf8');

messaging = messaging.replace(
  `const result = await client.sendMessage({
        recipientId: params.recipientId,
        message: params.message,
        subject: params.subject,
        attachments: params.attachments,
        confirmBeforeSend: params.confirmBeforeSend
      });`,
  `const result = await client.sendMessage(params.recipientId, params.message);`
);

// Fix result conversationId property
messaging = messaging.replace(
  `messageId: result.messageId,
        status: result.status,
        conversationId: result.conversationId,`,
  `messageId: result.messageId,
        status: result.status,`
);

fs.writeFileSync('src/tools/messaging-tools.ts', messaging);
console.log('✅ Fixed messaging-tools.ts');

// Fix 6: people-tools - remove includeCertifications
let people = fs.readFileSync('src/tools/people-tools.ts', 'utf8');

people = people.replace(
  `includeSkills: params.includeSkills,
          includeExperience: params.includeExperience,
          includeEducation: params.includeEducation,
          includeCertifications: params.includeCertifications,
          includeConnections: params.includeConnections
        });`,
  `includeSkills: params.includeSkills,
          includeExperience: params.includeExperience,
          includeEducation: params.includeEducation,
          includeConnections: params.includeConnections
        });`
);

fs.writeFileSync('src/tools/people-tools.ts', people);
console.log('✅ Fixed people-tools.ts');

// Fix 7: company-tools - remove employeeLimit (should already be done)
let company = fs.readFileSync('src/tools/company-tools.ts', 'utf8');

company = company.replace(
  `companyIdentifier: params.companyIdentifier,
          includeEmployees: params.includeEmployees,
          employeeLimit: params.employeeLimit,
          includeJobPostings: params.includeJobPostings,
          includeUpdates: params.includeUpdates`,
  `companyIdentifier: params.companyIdentifier,
          includeEmployees: params.includeEmployees,
          includeJobPostings: params.includeJobPostings,
          includeUpdates: params.includeUpdates`
);

fs.writeFileSync('src/tools/company-tools.ts', company);
console.log('✅ Fixed company-tools.ts');

console.log('\n✅ All final type fixes applied!');
