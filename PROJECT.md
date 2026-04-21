# Project Context: Kitalaku.in

**Kitalaku.in** is a cloud-native SaaS AI-based Content Management Tool designed for creative agencies, MSMEs, and content creators. It replaces fragmented, manual social media workflows by providing a centralized dashboard for AI-assisted content ideation, automated scheduling, integrated client approvals, and analytics.

## Tech Stack & Architecture

* **Frontend / Framework:** Next.js (React), TypeScript, Tailwind CSS. Component-based architecture.
* **Backend / Database:** Convex (Backend-as-a-Service for real-time DB, state management, and Serverless Functions/RPC via WebSockets).
* **Deployment & Hosting:** Vercel (Serverless architecture, Global CDN).
* **Authentication:** Clerk (OAuth, JWT, Session Management).
* **AI Integration:** Vertex AI (Gemini 3 Flash) or OpenAI API (GPT-5).
* **Version Control:** Git / GitHub (CI/CD).
* **Payment Gateway:** Midtrans (Optional, for SaaS subscriptions).

## User Roles & RBAC (Role-Based Access Control)

Strict segregation of data; users cannot see data from other agencies/clients.

1. **Administrator (Agency Owner/MSME):** Full system access, team configuration, billing management, and AI token quota management.
2. **Content Creator:** Operational access. Can generate AI drafts, use Rich Text Editor, upload media assets, and submit drafts to internal review.
3. **Creative Manager:** Supervisor access. Reviews/approves internal drafts, edits final drafts, and accesses the analytics dashboard.
4. **Client:** Highly restricted, isolated access. Can only view content linked to their specific brand. Allowed actions: Comment, Request Revision, or Approve final drafts.

## Data Model (Entity Relationship)

* **Agency:** `id` (PK), `name`, `ai_token_quota`, `created_at`
* **User:** `id` (PK), `agency_id` (FK), `full_name`, `email`, `role` (Enum), `last_login`
* **Content_Draft:** `id` (PK), `agency_id` (FK), `creator_id` (FK), `title`, `caption`, `status` (Enum: Draft, Review, Approved, Revision), `scheduled_date`, `ai_generated` (Boolean)
* **Media_Asset:** `id` (PK), `draft_id` (FK), `file_url`, `file_type` (Image/Video)
* **Audit_Log:** `id` (PK), `user_id` (FK), `draft_id` (FK), `action_type`, `comment`, `timestamp`

---

## Core System Features & Functional Requirements

### 1. Authentication & Session Management

* **REQ-AUTH-1 & 2:** Email login/logout via Clerk. Enforce strict RBAC on all routes and API endpoints. Unauthenticated/unauthorized access must redirect or show "Unauthorized Access".
* **REQ-AUTH-3:** Maintain user sessions for 7 days of inactivity.

### 2. AI-Powered Content Planning (Ideation & Drafting)

* **Workflow:** User inputs parameters (Target Audience, Niche, Tone) -> AI generates draft -> User refines via manual edit (human-in-the-loop).
* **REQ-AI-1:** Strict client-side validation on AI prompt input fields (no empty fields, enforce char limits).
* **REQ-AI-2:** UI State Management: Show loading spinner and disable generation button during AI fetching to prevent multiple API calls.
* **REQ-AI-3:** Graceful Error Handling: If AI API times out or rate-limits, show a specific toast notification. **Do not** clear user input data on failure.
* **REQ-AI-4:** Integrate a Rich Text Editor (Bold, Italic, Lists) for manual prompt refinement.
* **REQ-AI-5:** Disable generate button and notify user if the Agency's AI token limit is reached.

### 3. Scheduler & Integrated Approval System

* **Workflow:** Calendar view replacing manual spreadsheets. Transitions: *Draft -> Review -> Approved/Request Revision*.
* **REQ-SCH-1:** Support drag-and-drop calendar UI. Client-side validation must block moving schedules to past dates.
* **REQ-SCH-2:** Real-time synchronization via Convex subscriptions. Client approvals/rejections must instantly re-render on the Agency's screen without page refresh.
* **REQ-SCH-3:** **Optimistic UI Updates:** UI must instantly reflect state changes before server confirmation. Revert state and show error if the network request fails.
* **REQ-SCH-4:** Require text input for revision comments when a Client changes status to "Request Revision".

### 4. Centralized Analytics Dashboard

* **REQ-ANL-1:** Custom Date Picker with validation (End Date > Start Date). Maximum query range is 12 months for database stability.
* **REQ-ANL-2:** Persist filter preferences in Browser Local/Session Storage to maintain context during navigation or brief disconnects.
* **REQ-ANL-3:** Chart components must implement an explicit "Empty State UI" when data is `0` or null, preventing broken graphic renders.

---

## Non-Functional Requirements & Constraints

### Performance & Reliability

* **Speed:** Page loads < 2 seconds. Convex DB sync latency < 500ms.
* **AI Constraints:** Maximum AI generation wait time is 20 seconds.
* **Availability:** 99.5% uptime target.
* **Graceful Degradation:** If the 3rd-party AI API fails, isolate the module and allow the user to continue using the manual calendar and drafting tools.

### Safety & Data Integrity

* **Auto-Save Mechanism:** Must implement an asynchronous `auto-save` to Convex database using a **3-second debounce** on user input within the text editor to prevent data loss.
* **Audit Trail:** All content status changes must log the `user_id` and `timestamp`.
* **Content Policy:** Content created by Creators *must* be approved by an Admin, Manager, or Client before being marked ready for external publishing.

### Security

* **Data Protection:** Complete isolation of agency/client data (Zero-trust approach). Data must never leak across tenants.
* **Network:** Enforce HTTPS and SSL/TLS.
* **API Security:** Utilize JWT for secure communication. Implement Rate Limiting on API requests. Never store 3rd party credentials (OAuth tokens) in plain text.
