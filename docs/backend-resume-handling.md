# Backend: Message Recovery on Session Resume

## Problem

When the WebSocket connection drops mid-processing, a user message may have been received by the backend but its response never reached the frontend. On reconnection, the frontend sends `session.resume` and the backend responds with `chat.history`. The frontend uses this history to decide what to resend:

- Messages **not present** in `chat.history` pairs → frontend resends them
- Messages **present** in `chat.history` pairs → frontend treats them as received (even if no assistant response exists yet)

## Required Backend Behaviour

### On `session.resume`

1. **Resume or restart processing** for any user message whose processing was interrupted by the disconnect.
   - If the backends supports a processing pipeline that can be resumed (e.g. a state machine with checkpoints), resume from the last checkpoint.
   - Otherwise, re-process the message from scratch.
2. **Emit all pending events** (`working.started`, `working.progress`, `message.final`, etc.) as if processing just started. The frontend treats these as normal real-time events.
3. **Include the message in `chat.history`**. If processing is still in progress when history is sent, the pair should appear as `{ customer: {...}, assistant: null }`. The frontend checks pair existence, not whether `assistant` is populated.
4. **Do NOT silently discard** orphaned processing state. Every received user message must eventually produce either a response or an error event.

### What the Frontend Expects

| Condition | Frontend action |
|---|---|
| Message text found in history pairs (even `assistant: null`) | No resend — backend has it |
| Message text NOT found in any pair | Message never reached backend → frontend resends it |
| `message.final` arrives with matching `correlation_id` | Pending entry removed from cache |

### Correlation IDs

The frontend sends a `correlation_id` with every `user.message` event. The backend **must** echo this same `correlation_id` back in all related response events (`working.*`, `message.final`, etc.). This allows the frontend to match responses to pending messages and clear its cache. Without this, a message might be needlessly resent on every reconnect.

## Summary of Changes Needed

1. Track per-user-message processing state in the session (keyed by `correlation_id`).
2. On `session.resume`, check for any incomplete processing and resume/re-fire it.
3. Always include interrupted messages in `chat.history` so the frontend knows they were received.
4. Echo `correlation_id` in all response events.
