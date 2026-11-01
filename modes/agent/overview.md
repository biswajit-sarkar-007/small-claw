# Agent Mode Overview

This folder (`modes/agent`) implements an AI agent mode for a codebase tool. It provides a structured, staged workflow where the AI can modify files and the user reviews and approves changes before they are applied.

## Key Components

### 1. `action-tracker.ts`
Tracks all actions (code analysis, file modifications, deletions, folder creation, shell executions). Stores them as `ActionLog` objects, supports filtering by status (e.g., `getPendingMutations()`), and provides `updateStatus` for user approval.

### 2. `agent-tools.ts`
Wraps the `ToolExecutor` into AI tools (`ai.tool`s) that the LLM can call. Includes tools for reading, writing, modifying, deleting, listing, searching, analyzing, shell execution, and reading skill files.

### 3. `approval.ts`
Interactive approval flow. Shows pending mutations grouped by file/folder, offers options to approve, reject, or view diffs. Updates action statuses and returns whether any approvals occurred.

### 4. `diff-view.ts`
Formats diffs between before/after content for file/folder changes using the `diff` package. Provides `formatPatch` and `composeBeforeAfter` utilities.

### 5. `orchestrator.ts`
The main entry point (`runAgentMode`). Prompts the user for a goal, configures an agent with a model and tools, runs the LLM loop, logs tool calls, shows results, and orchestrates the approval flow. Finally applies approved changes.

### 6. `tool-executer.ts`
Implements the actual operations (read, write, delete, folder creation, list, search, analyze, shell, skill). Uses an in-memory overlay to stage changes, respects exclusions (node_modules, .git, etc.), and logs each action into the `ActionTracker`.

### 7. `types.ts`
Defines `ActionType`, `ActionStatus`, `ActionLog`, `AgentConfig`, and utility `isMutationType`. Provides default config with safe defaults.

## Workflow

1. User runs the agent mode (e.g., via a CLI command) and provides a goal.
2. The agent is initialized with tools that interact with the workspace and track all actions in `ActionTracker`.
3. The LLM executes tool calls (e.g., `read_file`, `create_file`, `modify_file`). Each call is logged as an action with status `pending` (or `executed` for analysis).
4. After the LLM finishes, `runApprovalFlow` is called. It shows the user a summary of pending mutations (grouped by file/folder) and lets them:
   - **Approve all** (apply all staged changes)
   - **Review one by one** (accept/reject per file/folder, with optional diff view)
   - **Cancel** (reject all pending changes)
5. Approved actions are applied via `ToolExecutor.applyApprovedFromTracker`, which writes overlay content to disk, creates folders, runs shell commands, and records errors.
6. Staged changes are cleared; the user sees a success or error summary.

## Example Usage

Below is an example of a conversation that might happen when the agent processes a goal like **"Create a README file that summarizes the project"**.

---
**1. Agent prompts for goal**
```
🤖 Agent Mode
What would you like the agent to do?
> Create a README file that summarizes the project
```

**2. Agent runs with tools**
The LLM may call several tools, e.g.:
- `read_file(".")` → reads the workspace directory (or specific files)
- `search_files(".", "**/*.md", "project")` → finds existing docs
- `create_file("README.md", "# Project Title\n\n## Description\n\n...")` → staged create
- `modify_file("README.md", "... updated content ...")` → staged modify

Each tool call is logged as a pending action.

**3. Approval flow (interactive)**
The user sees something like:
```
Apply staged changes?
  • Approve and apply all
  • Review one by one
  • Cancel
```

If they choose **Review one by one**, they see groups such as:
```
Create folder: docs (folder_create)
Modify file: README.md (file_modify)
```
For each group they can:
- **Accept** → action marked approved and moved to apply
- **Diff** → view the exact changes (rendered as markdown)
- **Reject** → action marked rejected

**4. Apply approved changes**
After approvals, the agent applies the approved actions:
- Creates `docs/` folder (if approved)
- Writes the final README.md content to disk

The user sees:
```
✓ Applied.
```

**5. Result**
The README.md file exists in the workspace with the generated content, and any created directories are present.

---

## Key Points

- **All changes are staged until approval** – the workspace is never directly modified by the AI; you always have a chance to review and reject.
- **Granular approval** – you can approve some changes and reject others, or bulk‑approve everything.
- **Safe defaults** – the default config excludes `node_modules`, `.git`, `dist`, `build`, etc., and limits file reads to 1 MB.
- **Shell execution** – optional, disabled by default in config but enabled here.
- **Skill files** – the agent can also read custom `.md` skills stored in `~/.cursor/skills-cursor` and `~/.claude/skills`.

## How to Use

From the command line (assuming a CLI that points to this repo), run the agent mode, e.g.:

```bash
node ./modes/agent/orchestrator.js
```

Or however your project’s entrypoint invokes `runAgentMode()`.

Then follow the prompts. The agent will interact in natural language based on the goal you provide.

---

**Tip:** For complex refactoring, you can use `search_files` and `read_file` tools to explore the codebase first, then instruct the agent to edit specific parts. Always review diffs before approving – the diff view shows exactly what will change.

---

*Generated overview for the `modes/agent` folder*