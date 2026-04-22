# Backend API Documentation Skill

This skill provides the standard template and instructions for documenting backend API resources in the Prepvers Quiz Platform Notion workspace.

## Objective

The agent should follow this format when creating or updating API documentation pages under the "APIs" section in Notion.

## Documentation Structure

### 1. Page Title

- **Format**: `[Resource Name] API Resource`
- **Level**: Heading 1 (H1)
- **Example**: `Quizzes API Resource`

### 2. Resource Description

- A concise paragraph explaining the purpose of the resource (e.g., "Resource for managing quizzes, questions, and options.").

### 3. Base Path

- **Format**: **Base Path: ⚡️** `/api/[resource-path]`
- **Styling**: Bold label, followed by the path in an inline code block.

### 4. Divider

- Insert a divider block after the base path.

### 5. Operation Toggles

- Each endpoint must be documented inside a numbered toggle block.
- **Toggle Title Format**: `[Number]. [Action Name] ([METHOD])`
- **Example**: `1. Create Quiz (POST)`

#### Inside the Operation Toggle:

- **Operation Description**: A paragraph describing what the endpoint does and any specific query parameters or logic.
- **Callout Block**:
  - **Color**: Blue background.
  - **Icon**: `🔍` (search emoji).
  - **Content**: `METHOD /path/relative/to/base`
- **Request Details**:
  - **Header**: Heading 3 (H3).
  - **Content**: A `shell` code block containing a `curl` example using `{{baseUrl}}`.
- **Response Examples**:
  - **Header**: Heading 3 (H3).
  - **Toggle for each response type**:
    - **Success Response (200 OK)**:
      - **Color**: Green text.
      - **Content**: A `json` code block with the expected success response.
    - **Error Responses (Optional)**:
      - **Color**: Red or default text.
      - **Content**: A `json` code block with the error schema.

## Guidelines

1. **Consistency**: Always match the spacing and bolding of the "Categories" API page.
2. **Dynamic IDs**: Use placeholders like `{id}` or `{categoryId}` in paths and curl examples.
3. **Prisma Alignment**: Ensure the request/response schemas match the current `schema.prisma` and controller implementations.
