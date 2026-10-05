Analyze the **entire project/repository** and create **two separate Markdown files**.

The public-facing website is almost complete, and the next phase is to plan and build the CMS/admin side.

**Do not implement the CMS.** First understand and document the existing project.

---

## 1. `PROJECT_CONTEXT_FOR_CMS.md`

Create a comprehensive project context document for Claude Web to use when planning the CMS.

Analyze the actual source code and document:

- Project purpose and business/domain context
- Tech stack and dependencies
- Complete project/folder architecture
- Routes and all public pages
- Components and reusable UI patterns
- Current content and hardcoded data
- Types/interfaces/data structures
- APIs/backend integrations
- State management
- Forms and validation
- Authentication/authorization
- Assets/media handling
- SEO
- Configuration/environment setup
- Existing documentation
- Any existing CMS/backend-related code

### CMS-focused analysis

Identify all content that could/should be CMS-managed, including relevant:

- Pages and sections
- Services/products
- Projects/case studies
- Team members
- Testimonials
- FAQs
- Blog/news
- Navigation/footer
- CTAs
- Images/media
- Company/contact information
- SEO metadata
- Other editable content

For each major content type, identify where it currently exists, how it is represented, and whether it should become CMS-managed.

Also identify content that should remain in code/configuration.

### CMS integration

Explain the current website architecture and how the CMS would eventually integrate:

`CMS/Admin → API/Backend → Database → Public Website`

Identify frontend areas that would need to move from hardcoded/static content to CMS/API-driven content.

Preserve the existing architecture, conventions, technology choices, and UI patterns.

### Documentation

Inspect all existing `.md` files and identify:

- Their purpose
- Their relevance to CMS planning
- Whether they are complete/outdated
- Whether they need changes

Identify missing documentation that is genuinely needed for CMS planning, such as content models, API contracts, roles/permissions, publishing workflow, media management, SEO, etc.

### Unknowns

Clearly separate:

- Verified facts
- Inferences
- Recommendations
- Unknowns/open questions

Do not invent information.

### CMS scope

Provide a preliminary CMS scope:

1. Essential functionality
2. Future functionality
3. Possible later enhancements

Avoid over-engineering.

### Final section

End with:

`## Context for CMS Planning`

Summarize the existing architecture, website, content structure, CMS candidates, required CMS capabilities, integration requirements, constraints, documentation gaps, and open questions.

The document must be detailed enough that Claude Web can use it to create a CMS architecture and implementation plan without having to rediscover the existing project.

---

## 2. `PROJECT_CODE_AUDIT.md`

Create a **separate technical audit document** that reviews the entire codebase for problems and violations.

The project has these core `.md` files that define the project's rules and standards:

- `architecture.md`
- `claude.md`
- `design.md`
- `tech stack.md`
- `requirements.md`
- `project.md`

Read and understand these documents **before auditing the source code**. Treat them as the project's source of truth.

Then inspect the entire codebase and identify:

### Code errors and bugs

Find:

- Actual errors
- Potential bugs
- Broken logic
- Incorrect implementations
- Runtime risks
- Build/type issues
- Missing error handling
- Incorrect API usage
- Unused/dead code
- Duplicated code
- Incorrect imports
- Inconsistent implementations
- Other technical problems

### Rule and architecture violations

Compare the implementation against the rules defined in the six core `.md` files.

For every violation, provide:

- File/path
- Relevant code/area
- Rule being violated
- Source `.md` file containing the rule
- Explanation of the violation
- Severity
- Recommended correction

Do not invent rules. Every claimed rule violation must be traceable to one of the core `.md` files.

### Design and UX violations

Check the implementation against the requirements and design rules in the core documentation, including where applicable:

- Layout consistency
- Responsive behavior
- Component usage
- UI patterns
- Accessibility
- Typography
- Spacing
- Colors
- Interaction patterns
- Design-system consistency

### Technology violations

Check whether the project actually follows the technology stack and implementation rules defined in `tech stack.md` and the other core documentation.

Identify:

- Wrong libraries
- Unapproved dependencies
- Incorrect patterns
- Deprecated approaches
- Architecture inconsistencies
- Incorrect use of the selected framework/tools

### Requirements compliance

Compare the implementation against `requirements.md` and `project.md`.

Identify:

- Missing requirements
- Partially implemented requirements
- Incorrect implementations
- Features that do not match the documented requirements

### Audit summary

At the end, provide:

- **Critical Issues**
- **High Priority Issues**
- **Medium Priority Issues**
- **Low Priority Issues**
- **Rule Violations**
- **Missing Requirements**
- **Technical Debt**
- **Recommended Fix Order**

Do not modify the code.

Do not fix anything.

The purpose of this document is to provide a clear **pre-CMS technical audit** so that existing problems can be addressed before or alongside CMS development.

---

## Important Rules

- Inspect the actual source code, not just filenames.
- Read the six core `.md` files before performing the audit.
- Do not invent missing information or rules.
- Clearly distinguish facts, assumptions, and recommendations.
- Do not implement the CMS.
- Do not modify the existing project.
- Keep the two documents completely separate.
- `PROJECT_CONTEXT_FOR_CMS.md` = **understand the project and prepare CMS planning context**
- `PROJECT_CODE_AUDIT.md` = **find errors, bugs, technical debt, and violations of documented project rules**

### Deliverables

Create exactly these two files:

1. `PROJECT_CONTEXT_FOR_CMS.md`
2. `PROJECT_CODE_AUDIT.md`
