# AI MYSTERY ROOM
## Product Specification & Single Source of Truth

**Document:** `SPEC.md`  
**Project:** AI MYSTERY ROOM  
**Version:** 1.0.0  
**Status:** Initial implementation specification  
**Development approach:** Spec-driven development  
**Primary coding agent:** OpenAI Codex

---

# 1. Project Overview

## 1.1 Product Vision

AI MYSTERY ROOM is an interactive, AI-powered mystery investigation platform where users become investigators and solve fictional crimes or mysterious incidents using AI-generated evidence.

The user provides a short scenario, story idea, or mystery premise. The application uses Google Gemini on the backend to transform that input into a complete, logically consistent investigation containing suspects, motives, timelines, clues, and a definitive culprit.

The user investigates the case by exploring evidence such as:

- WhatsApp-style conversations.
- Images and photographs.
- CCTV-style recordings or simulated surveillance clips.
- Witness statements.
- Suspect profiles.
- Timelines and location records.
- Physical evidence and forensic reports.
- Other documents relevant to the case.

All case evidence must be fictional and generated or assembled specifically for the mystery.

The user reviews the evidence, develops a theory, and submits a final accusation by selecting a suspect. The application evaluates the accusation against the canonical solution and reveals the explanation behind the mystery.

## 1.2 Core Product Loop

The complete user journey is:

1. The user opens AI MYSTERY ROOM.
2. The user enters a story, scenario, or mystery premise.
3. The user configures the mystery difficulty and other supported options.
4. The backend generates a complete mystery case using Gemini.
5. The system validates the case and prepares its evidence.
6. The user enters the investigation room.
7. The user explores suspects, messages, images, recordings, and documents.
8. The user identifies contradictions and connects clues.
9. The user selects a suspected culprit and submits the accusation.
10. The backend evaluates the accusation.
11. The application reveals the correct culprit, the reasoning, the evidence connections, and the final case outcome.

**Core principle:** The application must behave like a coherent detective investigation, not a collection of unrelated AI-generated clues.

---

# 2. Product Goals and Non-Goals

## 2.1 Goals

- Turn a short user-provided premise into a playable mystery.
- Create believable but fictional investigations.
- Generate evidence that is consistent with the case's underlying truth.
- Give users an interactive investigation interface.
- Support multiple evidence formats.
- Provide a definitive culprit and explainable solution.
- Allow users to solve cases without needing access to the hidden answer.
- Keep API keys and privileged AI operations on the backend.
- Make the application responsive on desktop, tablet, and mobile.
- Keep the architecture extensible for future game modes, accounts, analytics, and additional AI providers.

## 2.2 Non-Goals for the Initial MVP

The first release will not include:

- Real police databases or real criminal investigations.
- Real-time multiplayer investigations.
- User-generated public case marketplaces.
- Social networking or public leaderboards.
- Live camera access or surveillance of real people.
- Real WhatsApp account integration.
- Real CCTV system integration.
- Fully interactive 3D environments.
- Mandatory subscriptions or payment processing.
- Voice conversations with suspects.
- A public community for uploading evidence.

These features may be considered later but must not delay the core mystery-solving experience.

---

# 3. Target Users

The product targets:

- Mystery and detective-story enthusiasts.
- Casual puzzle players.
- Students interested in logical reasoning.
- Escape-room fans.
- Users who enjoy interactive storytelling.
- Content creators who want custom mystery challenges.

The experience should be accessible to first-time players while providing enough complexity for experienced mystery solvers.

---

# 4. Technology Stack

## 4.1 Frontend

- React.
- Vite.
- JavaScript with JSX.
- React Router for navigation.
- Tailwind CSS for styling.
- Lucide React for icons.
- A suitable chart or timeline library only when genuinely needed.

The implementation must use reusable React components rather than a single oversized component.

## 4.2 Backend

- Node.js.
- Express.js.
- JavaScript using ES modules.
- MongoDB.
- Mongoose for schema definitions and database access.
- Google Gemini API through the official supported Google Gen AI SDK.
- Zod for validating API inputs and AI-generated structured outputs.
- Multer or an equivalent controlled upload mechanism only if user file uploads are added later.

## 4.3 AI Services

Google Gemini is the primary AI provider.

Use Gemini for:

- Case planning and story generation.
- Suspect creation.
- Evidence planning.
- Contradiction and clue generation.
- Consistency checking.
- Structured solution generation.
- Optional narrative descriptions for evidence.
- Optional final case explanations.

Image and video generation must be implemented through provider adapters. Do not assume that a text-generation model automatically supports image or video generation.

For image assets, use a compatible image-generation model or provider when available. For surveillance-style recordings, use a compatible video-generation provider when available, or create a simulated video viewer using generated still frames and timeline metadata.

The application must remain functional if a media-generation provider is unavailable.

## 4.4 Development and Deployment

- Git and GitHub for version control.
- Environment variables for secrets and configuration.
- A MongoDB instance for persistent case storage.
- A Node-compatible backend hosting platform.
- A static frontend hosting platform.
- HTTPS in production.

Exact hosting providers can be selected during deployment without changing the product requirements.

## 4.5 Dependency Rules

- Use stable, compatible package versions.
- Avoid unnecessary dependencies.
- Keep frontend and backend dependencies separate.
- Never expose Gemini credentials through Vite environment variables or browser bundles.
- Do not use mock AI responses as the default production implementation.
- Mock providers may be used in tests and explicitly enabled development mode.

---

# 5. System Architecture

## 5.1 High-Level Architecture

The application consists of four principal layers.

1. **React frontend:** Displays the home page, case creation form, investigation room, evidence viewer, accusation flow, and solution reveal.
2. **Express backend:** Handles validation, case orchestration, persistence, access control, and API responses.
3. **AI orchestration layer:** Calls Gemini to generate and validate structured mystery data.
4. **MongoDB and media storage:** Stores case records, investigation state, evidence metadata, and references to generated media.

The frontend must never communicate directly with Gemini using a privileged API key.

## 5.2 Case Generation Pipeline

The backend must follow this sequence:

1. Validate the user's scenario and configuration.
2. Create a case-generation job.
3. Ask Gemini to produce a structured mystery blueprint.
4. Validate the blueprint against the case schema.
5. Check that suspects, clues, timeline, and solution are internally consistent.
6. Generate evidence specifications from the validated blueprint.
7. Generate or assemble supported evidence assets.
8. Validate the resulting evidence manifest.
9. Save the complete case to MongoDB.
10. Mark the case as ready for investigation.
11. Return a public case representation that excludes the hidden solution.

If any required step fails, the backend must either retry within a bounded limit or mark the generation job as failed.

A partially generated case must not be presented as a fully playable case.

## 5.3 Suggested Backend Structure

```text
server/
  src/
    app.js
    server.js

    config/
      env.js
      database.js

    routes/
      health.routes.js
      case.routes.js
      investigation.routes.js
      accusation.routes.js

    controllers/
      case.controller.js
      investigation.controller.js
      accusation.controller.js

    services/
      case-generation.service.js
      case-validation.service.js
      evidence-generation.service.js
      investigation.service.js
      accusation.service.js

    ai/
      gemini.client.js
      prompts/
        case-blueprint.prompt.js
        evidence.prompt.js
        validation.prompt.js
        solution.prompt.js

    providers/
      image-provider.js
      video-provider.js
      storage-provider.js

    models/
      Case.js
      Investigation.js
      GenerationJob.js

    middleware/
      error-handler.js
      rate-limit.js
      validate-request.js

    validators/
      case.validator.js
      evidence.validator.js

    utils/
      api-response.js
      ids.js

  tests/
  package.json
  .env.example
```

## 5.4 Suggested Frontend Structure

```text
client/
  src/
    main.jsx
    App.jsx

    pages/
      HomePage.jsx
      CreateCasePage.jsx
      GenerationPage.jsx
      InvestigationPage.jsx
      ResultsPage.jsx
      NotFoundPage.jsx

    components/
      layout/
        Navbar.jsx
        Footer.jsx
        AppLayout.jsx

      case/
        ScenarioForm.jsx
        DifficultySelector.jsx
        CaseSummary.jsx
        GenerationProgress.jsx

      investigation/
        InvestigationHeader.jsx
        CaseBriefing.jsx
        SuspectGrid.jsx
        SuspectCard.jsx
        EvidenceBoard.jsx
        EvidenceSidebar.jsx
        ClueConnections.jsx
        AccusationPanel.jsx

      evidence/
        EvidenceViewer.jsx
        ChatEvidence.jsx
        ImageEvidence.jsx
        VideoEvidence.jsx
        DocumentEvidence.jsx
        TimelineEvidence.jsx

      results/
        VerdictCard.jsx
        SolutionReveal.jsx
        EvidenceExplanation.jsx

      common/
        Button.jsx
        Modal.jsx
        Loader.jsx
        ErrorState.jsx
        EmptyState.jsx

    services/
      api.js
      case.service.js
      investigation.service.js

    hooks/
      useCase.js
      useInvestigation.js

    utils/
      formatters.js
      evidence.js

    styles/
      index.css

  package.json
  .env.example
```

This is the recommended organization. Codex may adjust filenames when necessary, but it must preserve the separation of UI, API communication, business logic, AI orchestration, and data models.

---

# 6. Functional Requirements

## FR-01: Landing Page

The home page must communicate the product concept immediately.

Required elements:

- Product logo and name.
- Headline explaining AI-generated mysteries.
- Primary CTA: "Create a Mystery".
- Secondary CTA: "How It Works".
- Short explanation of the investigation process.
- Visual previews of chat evidence, suspect files, and surveillance-style evidence.
- Feature section explaining evidence-based detective gameplay.
- Footer with privacy, fictional-content notice, and contact or project information.

The primary CTA must navigate to the case creation page.

## FR-02: Mystery Creation

The user must be able to provide a mystery premise.

Required inputs:

- Scenario or story description.
- Mystery category.
- Difficulty.
- Optional setting or location.
- Optional tone.

Suggested categories:

- Murder mystery.
- Theft or robbery.
- Missing person.
- Corporate espionage.
- Blackmail.
- Disappearance.
- General unexplained incident.

The initial release must support at least the categories that can be generated reliably with the available prompts and validation rules. A category that is not supported must not be presented as fully supported.

Difficulty options:

- Easy.
- Medium.
- Hard.

Tone options:

- Realistic.
- Psychological.
- Suspenseful.
- Classic detective.

Recommended initial limits:

- Scenario: 30–2,000 characters.
- Optional setting: 100 characters maximum.
- Optional tone: selected from supported values.
- One case per generation request.

The backend must validate all inputs independently of frontend validation.

The interface must show a clear loading state after the user starts generation and must prevent accidental duplicate submissions.

## FR-03: Mystery Generation

Gemini must generate a structured case rather than a free-form story alone.

Each playable case must contain:

- Case title.
- Case summary.
- Incident description.
- Setting and incident timeline.
- Three to five suspects.
- A definitive culprit.
- Suspect motives.
- Suspect alibis.
- Relevant relationships between suspects.
- At least eight evidence items.
- Multiple meaningful clues.
- At least two contradictions or cross-evidence deductions where appropriate.
- A coherent sequence of events.
- A hidden canonical solution.
- An explanation of why the culprit is responsible.
- An explanation of why other suspects are less likely to be guilty.

The case must be solvable from the evidence available to the player. Do not make the culprit identifiable solely through a random guess or information that was never presented.

For the initial MVP, the system should generate at least these evidence types:

1. Chat conversation.
2. Suspect profile.
3. Image or photograph.
4. Witness statement.
5. Timeline or activity record.
6. Written report or document.

CCTV-style evidence must also be supported. If a genuine generated video is unavailable, use a clearly simulated clip with generated frames, a playback timeline, and fictional metadata.

## FR-04: Investigation Room

The investigation room is the primary gameplay interface.

It must display:

- Case title and incident summary.
- Current investigation status.
- Suspect list.
- Evidence collection.
- Evidence details.
- Case timeline.
- An optional deduction board.
- An accusation action.

Users must be able to switch between suspects and evidence without losing their current investigation state.

The evidence viewer must adapt to the evidence type.

For example:

- Chat evidence appears in a messaging-style interface.
- Image evidence appears in an image viewer with a caption and fictional metadata.
- Video evidence appears in a playback-style viewer with available timestamps.
- Reports appear as readable documents.
- Timelines appear as chronological event lists.

The interface must distinguish observed facts from the player's own deductions.

## FR-05: Suspect Profiles

Every suspect must have:

- Unique suspect ID.
- Name.
- Age, if relevant.
- Role or relationship to the incident.
- Background.
- Motive or possible motive.
- Stated alibi.
- Known connections.
- Related evidence references.

The initial case must contain three to five suspects.

Suspects may appear suspicious for different reasons, but the canonical culprit must be determinable from the evidence.

## FR-06: Evidence Interaction

Every evidence item must have a unique ID and a type.

The evidence viewer must show:

- Evidence title.
- Evidence type.
- Description.
- Source within the fictional investigation.
- Relevant time or date, when applicable.
- Media asset or text content.
- Related suspects.
- Optional related evidence.
- Optional reliability or authenticity notes when relevant to the story.

The user must be able to open and revisit previously discovered evidence.

The application must not expose internal solution fields or hidden culprit identifiers through public evidence endpoints.

## FR-07: Culprit Selection

The user must be able to accuse one suspect.

Before submission, the UI must clearly identify the selected suspect and request confirmation.

On submission:

1. Validate the selected suspect ID.
2. Verify that the suspect belongs to the current case.
3. Submit the accusation to the backend.
4. Compare the accusation with the canonical culprit.
5. Store the result.
6. Return the appropriate public result.
7. Show the solution explanation.

The backend, not the frontend, must determine whether the accusation is correct.

For the MVP, allow one final accusation per investigation. The user may restart a case to play again.

The interface must show:

- Correct or incorrect verdict.
- The actual culprit.
- The main evidence supporting the verdict.
- The logical chain connecting the evidence.
- Why the selected suspect was or was not responsible.
- A final explanation of what happened.

Do not reveal the solution before the user submits an accusation.

## FR-08: Results and Replay

After an accusation, show a results page with:

- Final verdict.
- Culprit profile.
- Case solution.
- Important evidence.
- Explanation of misleading clues.
- Final incident timeline.
- Option to replay or create another mystery.

A replay must create a new investigation session. It must not silently overwrite an existing investigation.

---

# 7. AI Generation Contract

## 7.1 Golden Rule

The case's canonical truth must be established before its evidence is generated.

Do not generate independent, unrelated evidence items and attempt to construct a solution afterward.

The AI orchestration service must use the following order:

**Canonical solution → case blueprint → evidence plan → evidence generation → consistency validation → playable case.**

The canonical solution and the evidence must belong to the same case-generation context.

## 7.2 Case Blueprint

Gemini must return structured JSON matching a validated schema.

Conceptual structure:

```json
{
  "title": "The Last Light",
  "category": "theft",
  "difficulty": "medium",
  "setting": {
    "location": "A fictional private gallery",
    "description": "A locked exhibition room"
  },
  "incident": {
    "description": "A valuable painting disappears.",
    "occurredAt": "2026-05-14T21:30:00Z"
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Alex Morgan",
      "role": "Gallery manager",
      "motive": "Financial pressure",
      "alibi": "Claims to have been in the office"
    }
  ],
  "canonicalSolution": {
    "culpritId": "suspect_1",
    "motive": "A documented financial motive",
    "method": "A coherent sequence of actions",
    "timeline": [],
    "reasoning": []
  },
  "evidencePlan": [
    {
      "id": "evidence_1",
      "type": "chat",
      "title": "Late-night messages",
      "purpose": "Establish a contradiction",
      "relatedSuspectIds": ["suspect_1"]
    }
  ]
}
```

This example is illustrative, not the complete schema. The implementation must define and validate the complete schema in code.

All generated IDs must be unique within their respective namespaces.

Dates and timestamps must be valid and consistent with the case timeline.

## 7.3 Required Consistency Rules

Before publishing a case, validate the following:

- Exactly one canonical culprit exists.
- The culprit is one of the case's suspects.
- All evidence references resolve to valid IDs.
- Suspect references are valid.
- The timeline does not contain impossible chronological relationships unless deliberately explained.
- Evidence descriptions do not contradict established facts accidentally.
- The final accusation can be justified from available evidence.
- Important deductions have supporting evidence.
- The solution does not depend on inaccessible or missing evidence.
- Evidence does not reveal the answer through an explicit hidden-solution field.
- Generated JSON conforms to the schema.
- Every required evidence item has usable content or a valid media reference.

If validation fails, attempt a bounded repair or regeneration process. Never retry indefinitely.

## 7.4 AI Prompt Management

Prompts must be maintained as version-controlled files, not scattered across controllers.

The case-generation prompt must instruct Gemini to:

- Act as a mystery-case designer.
- Create a fictional, self-contained investigation.
- Establish one canonical culprit.
- Give each suspect a plausible motive or reason for suspicion.
- Construct a consistent timeline.
- Create meaningful evidence and contradictions.
- Avoid arbitrary twists that are unsupported by evidence.
- Ensure the culprit can be deduced.
- Return structured JSON matching the requested schema.
- Avoid returning prose outside the structured response when JSON output is requested.

The evidence-generation prompt must instruct Gemini to:

- Use the supplied canonical case blueprint as the source of truth.
- Generate only evidence that fits the established timeline.
- Preserve the exact identity and relationships of suspects.
- Avoid inventing new culprit identities or changing the solution.
- Create realistic but clearly fictional messages, documents, and metadata.
- Support the intended deductions without making every clue obvious.

The validation prompt must instruct Gemini to identify:

- Timeline conflicts.
- Unsupported conclusions.
- Missing evidence.
- Accidental culprit reveals.
- Inconsistent suspect details.
- Ambiguous or multiple possible solutions.

The validation model must not be permitted to silently change the canonical culprit without regenerating and revalidating the dependent evidence.

## 7.5 Model Configuration

Model identifiers must be configurable through server-side environment variables.

Use a currently supported Gemini model compatible with the required structured-output or JSON mode.

Do not hardcode an assumed model identifier throughout the codebase.

Implement:

- Request timeout.
- Bounded retries.
- Rate limiting.
- Error classification.
- Token or output-size limits where supported.
- Structured-output validation.
- Logging without secret leakage.
- Graceful handling of model unavailability.

If a model does not support the requested media or output modality, the application must use an appropriate provider adapter or a documented fallback.

---

# 8. AI-Generated Media

## 8.1 General Requirements

Every media asset must correspond to an existing evidence item.

Each asset must include:

- Asset ID.
- Associated case ID.
- Associated evidence ID.
- Media type.
- Storage reference.
- Generation status.
- Relevant caption or description.
- Fictional provenance or contextual metadata.

Do not embed large image or video files directly in MongoDB documents.

Store files in suitable object storage or another supported media store, and save the references in MongoDB.

## 8.2 Images

Image generation may be used for:

- Fictional locations.
- Objects relevant to the mystery.
- Fictional crime-scene environments.
- Fictional photographs.
- Simulated surveillance stills.
- Illustrations or visual clues.

Generated images must match the established case facts.

If the story depends on a particular visible clue, validate that the generated asset actually depicts the intended clue. If reliable visual verification is unavailable, the clue must not depend exclusively on that detail.

## 8.3 CCTV-Style Evidence

CCTV evidence must provide an investigation experience even if genuine video generation is unavailable.

The minimum fallback implementation must support:

- A video-style player.
- A generated surveillance image or sequence of still frames.
- Fictional camera identifier.
- Fictional timestamp.
- A timeline or playback progress indicator.
- A description of what is visible.
- Relevant evidence references.

If a real video asset is generated, use an appropriate video player with controls and a safe media URL.

Do not display a still image as though it were a genuine generated video. Label simulated evidence appropriately.

## 8.4 Media Failure Handling

If optional media generation fails:

- Preserve the underlying case.
- Use a text-based evidence fallback or a generated still image where appropriate.
- Mark the asset as unavailable or degraded.
- Never invent a successful media URL.
- Never block the entire investigation because an optional video asset failed.

A case is playable only if all required evidence is available in at least one supported representation.

---

# 9. Database Design

Use MongoDB with Mongoose.

## 9.1 Case Model

Collection: `cases`

Required fields:

```text
_id
title
category
difficulty
scenario
setting
incident
suspects[]
evidence[]
timeline[]
canonicalSolution
generationStatus
schemaVersion
promptVersion
createdAt
updatedAt
```

`canonicalSolution` is private server-side data.

It must never be included in ordinary case-listing, public case-detail, or evidence responses.

The case schema must support explicit schema versioning so future prompt and data-model changes can be migrated safely.

## 9.2 Evidence Structure

Each evidence record must contain:

```text
id
type
title
description
content
source
occurredAt
relatedSuspectIds[]
relatedEvidenceIds[]
asset
createdAt
```

`content` must be structured according to evidence type.

For example, chat evidence may contain messages with sender IDs, timestamps, and text. Video evidence may contain a media reference, simulated or actual duration, timestamps, and a description.

Do not force all evidence types into an unstructured text field.

## 9.3 Investigation Model

Collection: `investigations`

Fields:

```text
_id
caseId
sessionTokenHash
status
openedEvidenceIds[]
notes[]
accusation
result
startedAt
completedAt
createdAt
updatedAt
```

The investigation must reference an existing case.

Use server-side validation to prevent a user from submitting an accusation against a different case.

For anonymous MVP sessions, issue a cryptographically secure random session token and store only its hash where practical. Do not use predictable session IDs as authorization credentials.

The frontend may retain the token in session-scoped storage or another appropriately protected session mechanism. It must not store Gemini credentials or the canonical solution.

## 9.4 Generation Job Model

Collection: `generationJobs`

Fields:

```text
_id
status
stage
progress
errorCode
publicErrorMessage
caseId
createdAt
updatedAt
completedAt
```

Supported statuses:

- `queued`
- `generating_blueprint`
- `generating_evidence`
- `generating_media`
- `validating`
- `ready`
- `failed`

Progress is an approximate user-facing indicator, not a guarantee of remaining time.

Store internal diagnostic details separately from public errors.

## 9.5 Indexes

Create appropriate indexes for:

- Case creation time.
- Case generation status.
- Investigation case ID.
- Investigation session token hash.
- Generation job status.
- Generation job creation time.

Do not add indexes without a defined query or operational purpose.

## 9.6 Data Retention

The MVP must define a configurable retention policy for anonymous investigations and orphaned media.

Expired sessions and unreferenced generated media should be eligible for cleanup.

Do not delete an active investigation or its media merely because the browser refreshes.

---

# 10. REST API Specification

All API endpoints must use the `/api/v1` prefix.

All request and response bodies must use JSON unless the endpoint explicitly handles media.

## 10.1 Health Check

`GET /api/v1/health`

Purpose: Verify that the backend is running.

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

Do not expose secrets, internal configuration, or sensitive infrastructure information.

## 10.2 Create Case

`POST /api/v1/cases`

Request:

```json
{
  "scenario": "A priceless painting disappears from a locked gallery.",
  "category": "theft",
  "difficulty": "medium",
  "setting": "A private art gallery",
  "tone": "classic_detective"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "jobId": "job_id",
    "status": "queued"
  }
}
```

Return HTTP `202 Accepted` when processing continues asynchronously.

The route must validate input, apply rate limits, create a generation job, and start the orchestration process.

## 10.3 Get Generation Status

`GET /api/v1/cases/jobs/:jobId`

Response:

```json
{
  "success": true,
  "data": {
    "jobId": "job_id",
    "status": "generating_evidence",
    "progress": 60,
    "caseId": null
  }
}
```

When the case is ready, return its `caseId`.

The frontend must poll at a reasonable interval and stop polling when the job is ready or failed.

## 10.4 Get Case

`GET /api/v1/cases/:caseId`

Return the public case summary, suspects, timeline, and available evidence metadata.

Never return:

- Canonical culprit ID before accusation.
- Hidden solution.
- Private generation prompts.
- Internal provider responses.
- API credentials.

## 10.5 Get Evidence

`GET /api/v1/cases/:caseId/evidence/:evidenceId`

Return the selected evidence item after validating the case and evidence IDs.

Apply the same solution-secrecy rules to nested fields and related-evidence references.

## 10.6 Start Investigation

`POST /api/v1/cases/:caseId/investigations`

Create a new investigation session.

Response:

```json
{
  "success": true,
  "data": {
    "investigationId": "investigation_id",
    "sessionToken": "secure_random_token",
    "status": "in_progress"
  }
}
```

The session token must be returned only over HTTPS in production and must not be logged.

## 10.7 Update Investigation

`PATCH /api/v1/investigations/:investigationId`

Purpose: Save supported investigation state, such as opened evidence or user notes.

Only explicitly supported fields may be modified.

Reject arbitrary updates to `status`, `result`, `canonicalSolution`, or other protected fields.

## 10.8 Submit Accusation

`POST /api/v1/investigations/:investigationId/accusation`

Request:

```json
{
  "suspectId": "suspect_1"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "correct": false,
    "status": "completed",
    "solution": {
      "culpritId": "suspect_2",
      "culpritName": "Jordan Lee",
      "explanation": "The evidence establishes a contradiction in the suspect's timeline.",
      "supportingEvidenceIds": [
        "evidence_2",
        "evidence_5"
      ]
    }
  }
}
```

The solution may be returned only after a valid final accusation has been accepted.

The backend must reject invalid suspects, unknown investigations, mismatched cases, and repeat submissions.

## 10.9 API Error Format

Use a consistent error structure:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request could not be processed."
  }
}
```

Use appropriate HTTP status codes, including:

- `400` for invalid requests.
- `401` for missing or invalid authentication when required.
- `403` for unauthorized access.
- `404` for missing resources.
- `409` for conflicting state, including duplicate final accusations.
- `413` for oversized payloads.
- `429` for rate limiting.
- `500` for unexpected internal failures.
- `502` or `503` for upstream AI provider failures when appropriate.

Do not expose stack traces or raw provider errors to users.

---

# 11. Frontend UX and Visual Design

## 11.1 Design Direction

The application should feel like a premium digital detective workspace rather than a generic AI chatbot.

Design keywords:

- Cinematic.
- Suspenseful.
- Immersive.
- Investigative.
- Modern.
- Professional.
- Evidence-driven.

Suggested visual direction:

- Dark charcoal or deep navy backgrounds.
- Muted gray surfaces.
- Restrained red accents for important warnings or case status.
- Warm white text for readability.
- Subtle amber highlights for evidence and selected clues.
- Fine borders, controlled shadows, and restrained glow effects.
- Clean typography and strong visual hierarchy.

Avoid excessive neon, constant animations, cluttered layouts, and unreadable low-contrast text.

## 11.2 Landing Page Layout

Recommended order:

1. Navigation bar.
2. Hero section.
3. Primary create-mystery CTA.
4. Interactive-looking evidence preview.
5. How-it-works section.
6. Evidence-type showcase.
7. Final CTA.
8. Footer.

The landing page should immediately explain what users can do.

## 11.3 Case Creation Layout

Include:

- Scenario text area.
- Category selection.
- Difficulty selector.
- Optional setting and tone.
- Generation CTA.
- Input validation messages.
- Example scenario prompts.
- Estimated generation stages without unsupported promises about duration.

## 11.4 Investigation Layout

Desktop:

- Left sidebar: suspect profiles.
- Main panel: selected evidence.
- Right sidebar: evidence index, timeline, or deduction tools.

Mobile:

- Replace fixed sidebars with tabs, drawers, or collapsible panels.
- Keep evidence readable without horizontal scrolling.
- Keep the accusation action accessible without covering evidence content.

The layout must remain usable on small screens.

## 11.5 Motion and Feedback

Use subtle transitions for:

- Opening evidence.
- Switching suspects.
- Changing investigation tabs.
- Loading case stages.
- Revealing the final verdict.

Respect reduced-motion preferences.

Provide clear loading, empty, success, and failure states.

Do not simulate fake progress as a guaranteed indication of actual backend work.

## 11.6 Accessibility

- Use semantic HTML.
- Provide keyboard navigation.
- Use visible focus indicators.
- Add accessible names to icon-only buttons.
- Maintain adequate color contrast.
- Provide alternative text for meaningful images.
- Avoid conveying evidence status through color alone.
- Make dialogs and confirmation flows keyboard accessible.

---

# 12. Security, Privacy, and Content Integrity

## 12.1 API Key Protection

- Store `GEMINI_API_KEY` on the backend.
- Never commit real API keys to Git.
- Never expose secret variables through frontend build configuration.
- Provide `.env.example` containing placeholders only.
- Redact secrets from logs.

## 12.2 Input Validation

- Validate request bodies with schemas.
- Enforce input-length limits.
- Reject unsupported categories and difficulty values.
- Validate MongoDB identifiers.
- Validate every suspect and evidence reference.
- Limit request sizes.
- Apply rate limits to expensive generation endpoints.

## 12.3 AI Output Validation

AI output is untrusted input.

- Parse and validate structured responses.
- Reject malformed output.
- Escape user-generated text before displaying it.
- Sanitize rich text if rich-text rendering is added.
- Do not execute model-generated code or HTML.
- Never use AI output directly in database queries without validation.
- Prevent prompt-injection attempts from overriding system-level generation rules.

## 12.4 Solution Secrecy

The canonical solution is confidential until the final accusation.

- Keep it server-side.
- Exclude it from public case serializers.
- Never include it in the initial case-generation response.
- Never embed it in frontend JavaScript or HTML.
- Never expose it in generation-job responses.
- Never reveal it through debug messages or public logs.
- Avoid storing it in frontend state before the verdict.

The accusation service must evaluate the suspect against the stored canonical culprit rather than trusting a model's fresh opinion at submission time.

## 12.5 Fictional Content and Safety

The platform must identify its cases as fictional, AI-generated mysteries.

- Use fictional names and fictional locations by default.
- Avoid using real people's private messages or likenesses without authorization.
- Do not present generated evidence as authentic real-world records.
- Avoid generating real personal information or fabricated accusations against identifiable people.
- Label simulated surveillance and synthetic media appropriately.
- Keep the content appropriate for the intended audience.
- For violent mystery categories, do not make graphic imagery necessary for solving the case.

## 12.6 Resource Protection

- Set generation timeouts.
- Bound AI retries.
- Apply per-session and per-IP rate limits where appropriate.
- Limit concurrent expensive jobs.
- Use configurable model and media budgets.
- Clean up abandoned jobs.
- Prevent repeated submissions from multiplying generation costs.

---

# 13. Error Handling and Recovery

The application must handle the following situations:

| Situation | Expected behavior |
|---|---|
| Gemini unavailable | Mark the job failed after bounded retries and show a retry option |
| Invalid AI JSON | Validate, repair or regenerate within a bounded limit |
| Inconsistent case | Reject the case and attempt bounded regeneration |
| Image generation fails | Use a supported fallback when available |
| Video generation fails | Use a clearly labeled simulated video or text evidence |
| MongoDB unavailable | Return a safe service error and log diagnostics |
| Browser refresh | Restore the case or investigation where session data is available |
| Invalid case ID | Show a not-found state |
| Invalid suspect selection | Reject the accusation without changing investigation state |
| Duplicate accusation | Reject with a conflict response |
| Rate limit exceeded | Show a clear retry-later message |
| Network failure | Preserve safe local form state and allow retry |
| Partial generation | Keep the case unavailable until all required components are valid |

Errors must be actionable, understandable, and free from sensitive internal information.

---

# 14. Testing Requirements

## 14.1 Unit Tests

Test:

- Input validation.
- Case schema validation.
- Suspect reference validation.
- Evidence reference validation.
- Timeline consistency checks.
- Culprit evaluation.
- Public case serialization.
- Solution-secrecy rules.
- Investigation state transitions.
- Retry-limit behavior.

## 14.2 Integration Tests

Test:

- Case creation API.
- Generation job lifecycle.
- Gemini adapter using a mocked provider.
- Case persistence.
- Evidence retrieval.
- Investigation creation.
- Investigation-state updates.
- Final accusation.
- Error handling when MongoDB or an AI provider fails.

## 14.3 Frontend Tests

Test:

- Scenario form validation.
- Difficulty and category selection.
- Loading and error states.
- Case navigation.
- Evidence viewer behavior.
- Suspect selection.
- Accusation confirmation.
- Verdict display.
- Mobile navigation behavior.

## 14.4 End-to-End Acceptance Test

A complete automated or manual test must verify:

1. A user enters a scenario.
2. A case-generation job is created.
3. The backend generates a valid case using Gemini or a controlled test adapter.
4. The case becomes playable.
5. The user opens suspects and evidence.
6. Evidence references resolve correctly.
7. The user submits an accusation.
8. The backend evaluates it against the stored solution.
9. The results page explains the verdict.
10. Public endpoints do not expose the hidden solution before accusation.

## 14.5 Definition of Done for Tests

A feature is not complete merely because its page renders.

It is complete when:

- Its primary behavior works.
- Inputs and outputs are validated.
- Errors are handled.
- Access-control requirements are enforced.
- Relevant tests pass.
- No existing core feature has regressed.

---

# 15. Implementation Roadmap

Codex must implement the project in small, verifiable phases.

## Phase 1: Project Foundation

- Create the frontend and backend applications.
- Configure Vite, React, Express, and MongoDB.
- Set up environment configuration.
- Add health-check endpoint.
- Configure CORS appropriately.
- Add global error handling.
- Establish folder structure.
- Create a minimal responsive application shell.

**Exit criteria:** Both applications start successfully, MongoDB connects, and the health check works.

## Phase 2: Data Models and Validation

- Define Mongoose models.
- Implement Zod schemas.
- Define case and evidence types.
- Implement public case serialization.
- Implement investigation session handling.
- Add schema-validation tests.

**Exit criteria:** Valid cases can be stored and retrieved, and hidden solution fields are excluded from public responses.

## Phase 3: Gemini Integration

- Configure the official Gemini SDK.
- Implement the AI client abstraction.
- Add version-controlled prompts.
- Generate a structured case blueprint.
- Parse and validate Gemini output.
- Implement bounded retries and useful error messages.

**Exit criteria:** A valid mystery blueprint can be generated and stored.

## Phase 4: Evidence and Consistency

- Generate the evidence manifest.
- Produce chat messages and documents.
- Add image-provider integration.
- Add simulated CCTV evidence.
- Validate evidence references and chronology.
- Reject unplayable cases.

**Exit criteria:** A complete, internally consistent mystery is playable using supported evidence representations.

## Phase 5: Core Frontend

- Build the landing page.
- Build the case creation form.
- Build the generation progress page.
- Build the investigation layout.
- Implement suspect profiles and evidence viewers.
- Connect frontend services to the backend.

**Exit criteria:** A user can create a mystery and inspect its evidence through the UI.

## Phase 6: Investigation and Verdict

- Implement investigation persistence.
- Implement evidence navigation.
- Implement accusation confirmation.
- Implement server-side culprit evaluation.
- Implement solution reveal and replay.

**Exit criteria:** A complete mystery can be solved from beginning to end.

## Phase 7: Quality and Security

- Add automated tests.
- Verify solution secrecy.
- Verify input validation and rate limiting.
- Test mobile layouts.
- Test AI and media failures.
- Review accessibility.
- Verify production build.

**Exit criteria:** All critical acceptance tests pass and the application handles expected failures safely.

## Phase 8: Deployment

- Configure production environment variables.
- Deploy MongoDB and backend.
- Deploy the frontend.
- Configure production API URLs and CORS.
- Verify HTTPS.
- Test the complete production workflow.

**Exit criteria:** The deployed application can generate, investigate, and resolve a mystery without relying on local development services.

---

# 16. Environment Configuration

The backend `.env.example` must document the following variables:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=

GEMINI_API_KEY=
GEMINI_MODEL=

CLIENT_ORIGIN=http://localhost:5173

SESSION_TOKEN_SECRET=

IMAGE_PROVIDER=
IMAGE_PROVIDER_API_KEY=

VIDEO_PROVIDER=
VIDEO_PROVIDER_API_KEY=

MEDIA_STORAGE_PROVIDER=
MEDIA_STORAGE_BUCKET=

CASE_GENERATION_TIMEOUT_MS=120000
MAX_GENERATION_RETRIES=2
MAX_CONCURRENT_GENERATION_JOBS=3
```

These values are illustrative defaults, not guaranteed provider capabilities or production settings.

The implementation must:

- Validate required environment variables at startup.
- Fail clearly when essential configuration is missing.
- Allow optional media providers to be disabled.
- Avoid logging secrets.
- Document the exact required variables in the README.

Never place backend secrets in `client/.env` or any variable exposed to the browser.

---

# 17. MVP Acceptance Criteria

The initial release is accepted only when all of the following are true:

### Product behavior

- [ ] A user can enter a custom scenario.
- [ ] The user can select a supported category and difficulty.
- [ ] Gemini generates a structured case with one canonical culprit.
- [ ] Each playable case contains three to five suspects.
- [ ] Each playable case contains at least eight evidence items.
- [ ] Required evidence types are available.
- [ ] Image and video evidence use valid assets or clearly labeled fallbacks.
- [ ] Evidence items are consistent with the canonical case timeline.
- [ ] The investigation interface supports browsing suspects and evidence.
- [ ] The user can submit a final accusation.
- [ ] The backend determines whether the accusation is correct.
- [ ] The final solution explains the evidence and culprit.
- [ ] The user can start another investigation.

### Technical behavior

- [ ] Frontend and backend run independently.
- [ ] MongoDB stores cases and investigations.
- [ ] Gemini is called only from the backend.
- [ ] All API endpoints use request validation.
- [ ] AI outputs are schema-validated.
- [ ] The canonical solution is hidden until accusation.
- [ ] Generation jobs handle failures and retries.
- [ ] Core automated tests pass.
- [ ] The frontend works on mobile and desktop.
- [ ] Production deployment uses environment variables and HTTPS.

### Quality

- [ ] No broken navigation.
- [ ] No dead buttons.
- [ ] No permanent loading states.
- [ ] No unsupported claim that a video or image was generated.
- [ ] No accidental exposure of secrets or hidden solution fields.
- [ ] No case marked playable while required evidence is missing.

---

# 18. Rules for Codex

This section governs how the coding agent must use this specification.

## 18.1 Source of Truth

`SPEC.md` is the authoritative product specification.

Before implementing a feature, inspect the relevant requirements in this document.

Do not introduce new core behavior, replace the defined technology stack, or remove acceptance criteria without explicitly identifying the change.

If the repository contains existing code, inspect it before changing files. Preserve working behavior unless a requirement calls for a change.

## 18.2 Implementation Rules

- Implement the project incrementally.
- Use reusable components and clearly separated services.
- Keep business logic out of React presentation components.
- Keep Gemini orchestration out of route handlers.
- Validate all external inputs.
- Use typed, documented data contracts even though the application uses JavaScript.
- Use environment variables for configuration.
- Keep prompts version-controlled.
- Use a provider abstraction for optional image and video generation.
- Add tests for core business logic.
- Avoid unnecessary abstractions and dependencies.
- Never leave required functionality as a TODO.
- Do not silently replace real integration with mock data.
- If an integration cannot be completed because credentials or a provider are unavailable, implement the interface, provide an explicit development mock when useful, and document the limitation.
- Do not claim that an untested feature works.

## 18.3 Change Management

If a requirement must change:

1. Identify the relevant section of `SPEC.md`.
2. Explain why the change is necessary.
3. Update the specification first.
4. Implement the change against the updated specification.
5. Update the acceptance tests.
6. Ensure related frontend, backend, and database contracts remain consistent.

Do not create conflicting requirements across multiple documents.

## 18.4 Completion Reports

After each implementation phase, report:

- Files created or modified.
- Features implemented.
- Tests executed and their results.
- Environment variables or credentials still required.
- Known limitations.
- Any specification deviations.

Proceed to the next phase only after the current phase's exit criteria have been verified.

---

# 19. Final Product Principle

AI MYSTERY ROOM must prioritize **logical consistency, evidence-based deduction, immersion, and trust** over generating large amounts of content.

A smaller mystery with a coherent timeline, meaningful evidence, and a defensible solution is better than a visually impressive case whose clues contradict one another.

The product is successful when a player can investigate the case, form a theory, identify the culprit through evidence, and understand why the final solution makes sense.

**End of specification.**