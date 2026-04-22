# Notion Documentation Sync Skill

This skill provides instructions for synchronizing the state of the local `quiz-app` project with its corresponding Notion workspace.

## Context

- **Project Name**: `quiz-app`
- **Root Notion Page ID**: `33fcffa1-4c30-8107-8ae1-e1bcf1b8c145`

## Objective

The agent should read this skill to automatically construct, organize, and update technical documentation, Kanban boards, and to-do lists within Notion to match the current state of the local Windows project.

## Workflow Execution

When the user asks you to "sync documentation", "update Notion", or run this skill, follow these exact steps:

### 1. Codebase Analysis

- Read essential project files (like `README.md`, `package.json`, or configuration files) to understand the current architecture and active dependencies.
- Perform a `grep_search` across the codebase for keywords such as `TODO:`, `FIXME:`, and `BUG:` to compile a list of pending tasks.

### 2. Kanban Board (Tasks Database) Management

- Check the root Notion page to see if a "Tasks" or "Kanban" database already exists under it using the `notion-fetch` tool.
- **If missing**: Use `notion-create-database` to instantiate a Tasks database.
  - Recommended schema: `CREATE TABLE ("Task" TITLE, "Status" SELECT('To Do':blue, 'In Progress':yellow, 'Done':green, 'Blocked':red), "Priority" SELECT('High':red, 'Medium':yellow, 'Low':green))`
  - Create a board view for it using `notion-create-view` with `GROUP BY "Status"`.
- **Sync Local Tasks**: For each `TODO/FIXME` retrieved from the codebase, check if it already exists in the database. If not, insert it as a new page inside the database using `notion-create-pages`.

### 3. Organized Technical Documentation

- Keep the main project page organized into logical sections:
  - **Overview**: High-level summary of the application.
  - **Architecture**: Details on the tech stack, component interactions, and state management.
  - **Setup Instructions**: Steps to run the project locally.
- Use `notion-update-page` with the `update_content` or `replace_content` command to continuously append new technical discoveries, architectural decisions, and setup instructions to the root Notion page.
- Make aggressive use of Notion-flavored Markdown, including toggles (`<details>`), code blocks, and callouts (`> [!NOTE]`) to keep it readable.

### 4. Relatable Project Additions

- Depending on the project structure, consider generating and documenting:
  - **API Endpoints**: If a backend is detected, map out endpoints. Follow the specialized [Backend API Documentation Skill](backend/apis.md) for formatting.
  - **Environment Variables**: Document required `.env` variables without exposing actual secrets.
  - **Deployment Flow**: Document the required commands or scripts to deploy the system.

## Golden Rules

1. **Never delete user-created content**: If the user has manually updated the Kanban board or written notes, ensure you use `update_content` to append or carefully edit, rather than outright replacing everything.
2. **Always Fetch First**: Use `notion-fetch` to get the latest schema and content before running updates to databases or pages.
3. **Be Descriptive**: When creating Kanban cards for `TODO`s, include file paths and line numbers so the developer knows exactly where to look.
