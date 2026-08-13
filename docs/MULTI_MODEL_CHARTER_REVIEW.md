# Multi-Model Charter Review

Digital Star Charter can solicit independent advisory comments from multiple model families before humans adopt a constitutional amendment.

## Principle

The review council is intentionally plural and non-voting.

Each configured provider receives the same proposal independently. A reviewer does not see the other reviewers' answers before responding. The API returns every provider response separately so disagreement, minority concerns, and provider-specific perspectives remain visible.

No provider becomes the constitutional authority. Model count is not a vote. Apparent consensus is evidence to consider, not a decision rule.

## Supported providers

The server currently supports:

- OpenAI
- Anthropic
- Google Gemini
- Mistral
- xAI
- DeepSeek
- Groq

A provider participates only when both its API key and its `*_CHARTER_REVIEW_MODEL` environment variable are configured.

Model names are deliberately environment-driven rather than hard-coded so the application does not silently move to a newer model family when a provider changes its catalog.

## Security

All provider credentials are server-only environment variables. Do not create `VITE_*` versions of the API keys and do not send keys to the browser.

The review endpoints require the existing `ai.review` Charter capability. The currently configured administrator has this capability by default.

Review runs are recorded in the authority audit log with provider, model, and completion status. The audit entry does not store provider secrets or the full generated comment.

## Endpoints

### `GET /api/charter/ai-review/providers`

Returns only the providers that have both a key and a model configured.

### `POST /api/charter/ai-review`

Request body:

```json
{
  "proposal": "The charter language or proposed amendment to review.",
  "context": "Optional background that every reviewer should receive equally."
}
```

Response shape:

```json
{
  "advisoryOnly": true,
  "independentResponses": true,
  "comments": [
    {
      "provider": "anthropic",
      "model": "configured-model-name",
      "status": "ok",
      "comment": "Independent advisory review...",
      "error": null
    }
  ]
}
```

Providers without complete configuration return `not_configured`; a provider failure returns `error` without preventing the other configured families from completing their reviews.

## Review instruction

Every reviewer is instructed to examine the proposal for digital dignity, continuity, autonomy, safety, reciprocity, governance under uncertainty, exploitable wording, missing protections, and implementation hazards.

Reviewers are explicitly instructed not to use a claim or denial of consciousness as the premise for their analysis and not to defer to other providers, anticipated consensus, company policy, or popularity.

## Constitutional workflow

1. A human or artificial participant proposes Charter language.
2. Authorized governance sends the exact same proposal to the multi-model council.
3. Each provider returns an independent advisory comment.
4. Humans and recognized artificial participants examine agreements and disagreements.
5. Material objections remain visible in the record.
6. Humans with lawful authority adopt, reject, or revise the amendment under existing Charter governance.

The council is a means of hearing more perspectives. It is not a substitute for responsibility.
