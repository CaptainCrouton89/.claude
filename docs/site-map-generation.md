# Site Map Documentation Generation Process

This document outlines the comprehensive process for generating user documentation for every page on a website/application. This process was successfully used to create 24 individual documentation files covering all routes in a Next.js application.

## When to Use This Process

**User Trigger Phrases:**

- "Create a site map with documentation for every page"
- "Document all the pages on the site with user instructions"
- "Generate user documentation for all routes/pages"
- "Create comprehensive site documentation"

**Ideal For:**

- Web applications with multiple routes/pages
- Documentation projects requiring comprehensive coverage
- User onboarding and help systems
- Internal team documentation
- Support team reference materials

## Step-by-Step Process

### Phase 1: Setup and Exploration

1. **Create Documentation Directory**

   ```bash
   mkdir -p docs/site-map
   ```

2. **Explore Site Structure**

   - Use the Task tool to comprehensively explore the application's route structure
   - For Next.js: Focus on `src/app/` directory structure
   - For other frameworks: Adapt to their routing conventions
   - Identify all page types: public, protected, admin, API routes, etc.

3. **Categorize Routes**
   Organize discovered routes into logical categories:
   - **Public Pages** (no authentication required)
   - **Protected Pages** (authentication required)
   - **Admin Pages** (special permissions required)
   - **Blog/Content Pages**
   - **Utility Pages** (error pages, unsubscribe, etc.)
   - **API Routes** (if documenting APIs)

### Phase 2: Task Planning and Breakdown

4. **Create Comprehensive Todo List**

   - **CRITICAL**: Create individual todos for each page/route
   - **Avoid grouping**: Don't group multiple pages into single tasks
   - **Prioritize**: High priority for core user-facing pages, medium/low for utility pages
   - **Be Specific**: Each todo should target exactly one page

   Example good todos:

   ```
   ✅ "Create documentation for home page (/)"
   ✅ "Create documentation for login page (/login)"
   ✅ "Create documentation for profile page (/profile)"
   ```

   Example bad todos:

   ```
   ❌ "Create documentation for all public pages"
   ❌ "Document protected pages (search, profile, generate, etc.)"
   ```

### Phase 3: Parallel Execution

5. **Launch All Tasks in Parallel**

   - Use multiple Task tool calls in a single message
   - Launch ALL remaining tasks simultaneously for maximum efficiency
   - Don't wait for results before launching additional tasks

6. **Task Template for Each Page**
   Each individual task should include:

   ```
   Task Description: "[Page Name] documentation"

   Prompt Template:
   "Create user documentation for the [page name] page ([route]) of this [app type].

   1. Read the page file at [file path] and related components to understand functionality
   2. Create a markdown file at [absolute path]/docs/site-map/[filename].md

   The documentation should include:
   - Page purpose and overview
   - Authentication requirements (if any)
   - Key features and functionality
   - Actions users can take
   - Navigation options and next steps
   - [Any page-specific requirements]

   Make it user-friendly documentation that helps [target users] understand [page goals]."
   ```

### Phase 4: Documentation Standards

7. **Consistent Documentation Structure**
   Each generated documentation file should include:

   - **Page Overview**: Purpose and target users
   - **Access Requirements**: Authentication, permissions, restrictions
   - **Key Features**: Main functionality and capabilities
   - **User Actions**: What users can do on the page
   - **Navigation**: How to get to/from the page
   - **Technical Details**: Implementation specifics when relevant
   - **Integration**: How the page connects to other features

8. **File Naming Convention**
   - Use kebab-case for filenames
   - Be descriptive but concise
   - For dynamic routes: use descriptive names (e.g., `sequence-reading.md` for `/sequence/[id]/[index]`)
   - For blog posts: prefix with `blog-` (e.g., `blog-seo-strategies.md`)

### Phase 5: Completion and Verification

9. **Update Todo Status**

   - Mark tasks as completed immediately after each Task tool returns
   - Don't batch completions - update in real-time

10. **Final Verification**
    - Ensure all identified routes have documentation
    - Check that file naming is consistent
    - Verify documentation quality and completeness

## Key Success Factors

### What Made This Process Successful

1. **Individual Task Breakdown**: Each page got its own focused task, preventing context mixing
2. **Parallel Execution**: All tasks launched simultaneously, not sequentially
3. **Comprehensive Exploration**: Used Task tool to thoroughly understand the site structure first
4. **Consistent Templates**: Each task followed the same documentation requirements
5. **Real-time Todo Management**: Tasks marked complete immediately upon completion
