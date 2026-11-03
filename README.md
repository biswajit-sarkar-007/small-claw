# 🦀 small-claw

A lightweight, terminal-based AI coding agent powered by [OpenRouter](https://openrouter.ai/) and the [Vercel AI SDK](https://sdk.vercel.ai/). Think of it as a small, nimble version of a full-blown AI coding assistant — available right from your CLI or as a Telegram bot.

## Features

- **🤖 Agent Mode** — Give the agent a task and it will read, create, modify, and delete files in your codebase. All mutations are staged and require your approval before being applied.
- **❓ Ask Mode** — Ask questions about your codebase. The agent can read files, search, and browse the web to form an answer. Optionally save the Q&A to a `.md` file.
- **🧭 Plan Mode** — Describe a goal and the agent generates a multi-step plan. Select which steps to execute, review diffs, and approve changes.
- **📱 Telegram Mode** — Run the same Agent, Ask, and Plan workflows from a Telegram bot with inline keyboards for step selection and change approval.
- **🌐 Web Tools** — Optional web search, page scraping, and URL fetching via [Firecrawl](https://firecrawl.dev/) (available in Plan and Ask modes).
- **🔒 Approval Flow** — Every file creation, modification, deletion, and shell command is staged. Review diffs, approve/reject individually or in bulk before anything touches disk.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | [Bun](https://bun.sh/) |
| Language | TypeScript |
| AI | Vercel AI SDK + OpenRouter |
| Web scraping | Firecrawl |
| CLI UI | [clack](https://github.com/bombshell-dev/clack), [chalk](https://github.com/chalk/chalk), [figlet](https://github.com/patorjk/figlet.js) |
| Telegram | [Telegraf](https://telegraf.js.org/) |
| Diff rendering | [diff](https://github.com/kpdecker/jsdiff) + [marked-terminal](https://github.com/mikaelbr/marked-terminal) |

## Prerequisites

- [Bun](https://bun.sh/) v1.2+
- An [OpenRouter](https://openrouter.ai/) API key
- *(Optional)* A [Firecrawl](https://firecrawl.dev/) API key for web tools
- *(Optional)* A Telegram bot token + your Telegram user ID for Telegram mode

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_DEFAULT_MODEL=openrouter/free

# Optional — enables web_search, web_crawl, fetch_url tools
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Optional — enables Telegram mode
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_OWNER_ID=your_telegram_owner_id
```

### 3. Run

```bash
bun run index.ts wakeup
```

You'll be greeted with an ASCII banner and a mode picker:

```
┌ Which mode you want to proceed with?
│ ● CLI
│ ○ Telegram
│ ○ Exit
└
```

## Usage

### CLI Mode

After selecting **CLI**, choose a sub-mode:

| Sub-mode | What it does |
| --- | --- |
| **Agent** | Full read/write agent — creates, modifies, deletes files and runs shell commands (all staged). |
| **Plan** | Generates a step-by-step plan, lets you pick steps, then executes them with the agent toolset. |
| **Ask** | Read-only research agent — answers questions about your codebase with optional `.md` export. |

All file mutations go through an **approval flow** where you can:

- ✅ Approve all changes at once
- 🔍 Review each change individually with a diff view
- ❌ Reject everything

### Telegram Mode

Interact with the agent via Telegram commands:

| Command | Description |
| --- | --- |
| `/start` | Show welcome message |
| `/ask <question>` | Ask a question about the codebase |
| `/agent <task>` | Run the agent on a task |
| `/plan <goal>` | Generate and execute a plan with inline keyboard controls |

Plan mode in Telegram includes inline buttons to toggle steps, select all/none, and proceed. The approval flow uses buttons for viewing diffs, accepting, or rejecting changes.

> **Note:** Telegram mode is restricted to the owner ID specified in your `.env` file.

## Project Structure

```
small-claw/
├── index.ts                 # CLI entry point (Commander)
├── ai/
│   └── ai.config.ts         # OpenRouter model provider setup
├── tui/
│   ├── wakeup.ts            # ASCII banner + mode picker
│   └── terminal-md.ts       # Markdown rendering for terminal
├── modes/
│   ├── cli.ts               # CLI sub-mode router
│   ├── agent/
│   │   ├── orchestrator.ts  # Agent mode loop
│   │   ├── agent-tools.ts   # Full toolset (read/write/shell)
│   │   ├── tool-executor.ts # Staging layer for all mutations
│   │   ├── action-tracker.ts# Tracks pending/approved/rejected actions
│   │   ├── approval.ts      # Interactive approval flow
│   │   ├── diff-view.ts     # Unified diff formatting
│   │   └── types.ts         # Config & action types
│   ├── ask/
│   │   └── orchestrator.ts  # Ask mode (read-only + save to .md)
│   ├── plan/
│   │   ├── orchestrator.ts  # Plan mode execution
│   │   ├── planner.ts       # AI plan generation with structured output
│   │   ├── selection.ts     # Step selection UI
│   │   ├── types.ts         # Plan & step types
│   │   └── web-tools.ts     # Firecrawl web search/scrape/fetch
│   └── telegram/
│       ├── index.ts         # Bot launcher
│       ├── handlers.ts      # Command & callback handlers
│       ├── agent-run.ts     # Telegram-specific agent/ask/plan runners
│       ├── approval-session.ts # Telegram approval state
│       ├── plan-session.ts  # Telegram plan selection state
│       ├── auth.ts          # Owner ID check
│       ├── constants.ts     # Bot messages
│       └── text.ts          # Text utilities
├── .env.example
├── package.json
└── tsconfig.json
```

## License

This is a personal project. No license is specified.
