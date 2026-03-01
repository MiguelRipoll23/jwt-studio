
# JWT Electron App — Functional Design (Functionality + SDK UI Icons + Export Hint)

## 1. Overview

**Purpose:**  
Desktop app to manage multiple JWT projects and generate signed tokens locally.

**Key Principles:**  
- Multi-project support  
- Tokens per project with editable JSON payload  
- Support for all major JWT algorithms  
- Offline-first, secure local storage  
- Copy signed JWTs to clipboard easily  

**UI Notes:**  
- Must have a **sidebar** for project navigation  
- Must support **light/dark theme** via ChatGPT SDK UI design tokens  
- **All icons in the app (projects, tokens, actions, buttons, indicators) must use ChatGPT SDK UI icons**  
- Project and **token icons can be customized** by the user on creation or update  

**Hint for developers / agents:**  
- To see what **components and icons** are available for use, check the SDK package exports.  
- **Components path:** `@openai/apps-sdk-ui/components`  
- **Icons path:** `@openai/apps-sdk-ui/components/Icon`  
- All imports from these paths are valid and can be safely used in the app (e.g., `Button`, `Badge`, `Avatar`, `Calendar`, `Invoice`).

## 2. Projects

**Definition:**  
Workspace grouping JWTs with shared configuration.

**Data Model:**

```ts
Project {
  id: string
  name: string
  icon: string           // SDK UI icon, customizable by user
  algorithm: string      // HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, PS256, PS384, PS512
  secret: string | { privateKey: string, publicKey: string }
  duration: string       // 1d, 1m, 3m, custom
  tokens: Token[]
}
```

**Functional Requirements:**  
- Create, edit, delete projects  
- Persist locally (JSON or SQLite)  
- User selects **algorithm** from supported list  
- User sets secret/private key  
- User sets default token duration  
- User selects **project icon** from **SDK UI icons**  

## 3. Tokens

**Definition:**  
Belong to a project; differ only in payload.

**Data Model:**

```ts
Token {
  id: string
  name: string
  payload: Record<string, unknown> // JSON payload
  icon: string                     // SDK UI icon, customizable by user
}
```

**Functional Requirements:**  
- Create, edit, delete tokens  
- Default payload: `{ "sub": "user-id" }`  
- Validate JSON payload  
- Auto-update JWT whenever payload changes  
- **User can select token icon** from ChatGPT SDK UI icons on create/update  

**UI Notes:**  
- Use SDK UI `Textarea` for payload editing  
- Show inline errors via `Alert` / `Badge`  
- `CopyTooltip` + `Button` to copy JWT  

## 4. Supported Algorithms

| Type | Algorithms | Notes |
|------|------------|-------|
| HMAC | HS256, HS384, HS512 | Shared secret |
| RSA  | RS256, RS384, RS512 | Private/public key pair |
| ECDSA | ES256, ES384, ES512 | Elliptic curve keys |
| RSASSA-PSS | PS256, PS384, PS512 | RSA-PSS signature |

**Behavior:**  
- Validate algorithm vs secret/key type  
- Generate appropriate JWT header  
- Support key input for asymmetric algorithms  

## 5. JWT Generation

**Input Sources:**  
- Payload (token)  
- Algorithm (project)  
- Secret/private key (project)  
- Expiration duration (project)

**Header:**

```json
{
  "alg": "<selected_algorithm>",
  "typ": "JWT"
}
```

**Payload Handling:**  
- Inject `iat` and `exp`  
- Include user payload  
- Default `sub` present if not overridden  

**Signing:**  
- HMAC → secret  
- RSA/ECDSA/PS → private key  
- Use secure crypto library  

**Output:**  
- Signed JWT string  
- Copyable to clipboard  

## 6. Token Lifecycle

- **Create:** default payload inserted, user selects icon  
- **Edit:** update payload and icon → JWT regenerated  
- **Delete:** remove token  

## 7. Project Lifecycle

- **Create:** name, icon, algorithm, secret/key, duration  
- **Edit:** update any field (including icon), auto-regenerate JWTs if algorithm/secret changes  
- **Delete:** remove project and tokens  

## 8. Validation Rules

- Payload must be valid JSON  
- Algorithm must match secret/key type  
- Secret/key required  
- Expiration must be valid  
- Prevent signing if invalid  

## 9. Copy & Feedback

- Copy button → clipboard  
- Optional toast/badge: “Copied”  
- Optional display: token length, expiration  

## 10. Security Considerations

- Local storage only  
- Optional encryption for secrets  
- Mask secrets, toggle reveal  
- Warn against using production secrets insecurely  

## 11. Essential UI Notes

- **Sidebar** mandatory for projects list  
- **Light/dark theme** via SDK UI tokens  
- **All icons** in the app (projects, tokens, buttons, indicators) **must come from ChatGPT SDK UI icons**  
- Use verified SDK UI components for:
  - `Button`, `Input`, `Textarea`, `Select`, `SelectControl`
  - `Alert`, `Badge`, `CopyTooltip`, `Avatar`, `Icons`
  - Optional: `Popover`, `Menu`, `SegmentedControl` for actions
- Responsive layout for desktop resizing  

## 12. Future Enhancements

- Custom expiration durations  
- Token templates  
- JWT decode/verification  
- Project import/export  
- Multi-user key management  
- Token history tracking  
