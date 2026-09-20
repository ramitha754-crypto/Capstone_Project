# PulseBoard — Simple Student Guide

## 1. What is this application?

PulseBoard is a customer feedback management application.

Companies receive feedback from customers about problems, requests, or improvements.
This application helps the team:

1. Collect customer feedback.
2. Track each feedback item.
3. Convert feedback into a technical specification.
4. Move the work through different stages.
5. Track deadlines and customer impact.
6. Record who performed each action.

In simple terms:

```text
Customer feedback → Team review → Technical specification → Development work → Resolution
```

## 2. Main parts of the application

| Part | Simple meaning |
|---|---|
| Feedback Ingestion | Shows all feedback that a user is allowed to see |
| Encapsulation Engine | Converts a customer complaint into a clear technical requirement |
| Workflow Pipeline | Shows the progress of feedback on a Kanban board |
| SLA & Analytics | Shows deadlines, breaches, ticket counts, and business impact |
| Audit Log | Records important actions performed by users |
| User Management | Allows administrators to manage users and permissions |

## 3. User roles and responsibilities

| Role | Who is this? | Main responsibilities |
|---|---|---|
| `CUSTOMER_REP` | A person who talks to customers | Submit customer feedback, view their own submitted feedback, and follow its status |
| `SUPPORT_SPECIALIST` | A customer support team member | Record customer problems, review tickets, and add useful comments |
| `PRODUCT_MANAGER` | A person who decides product priorities | Review feedback, decide what is important, convert feedback into technical specifications, and guide the workflow |
| `ENGINEERING_LEAD` | A senior software engineer | Review technical requirements, check technical scope, and help connect work to engineering tasks |
| `ENTERPRISE_ADMIN` | The application administrator | Manage users, assign permissions, view all feedback, view audit logs, and monitor the whole system |

## 4. What can each role normally do?

| Activity | Customer Rep | Support Specialist | Product Manager | Engineering Lead | Enterprise Admin |
|---|---:|---:|---:|---:|---:|
| Submit feedback | Yes | Yes | Yes | Depends on permission | Yes |
| See own feedback | Yes | Depends on permission | Yes | Depends on permission | Yes |
| See all feedback | No | Depends on permission | Yes | Depends on permission | Yes |
| Add comments | Depends on permission | Yes | Yes | Yes | Yes |
| Create technical specifications | No | No | Yes | Depends on permission | Yes |
| Move workflow stages | No | Depends on permission | Yes | Depends on permission | Yes |
| View analytics | No | No | Yes | Depends on permission | Yes |
| Manage users | No | No | No | No | Yes |
| View audit logs | No | No | Depends on permission | Depends on permission | Yes |

> Permissions are checked by the backend. The exact abilities of a user can be changed
> by an administrator.

## 5. Example: Customer Representative

Suppose `prat1` is logged in as a `CUSTOMER_REP`.

Prat can:

- Submit a new customer feedback item.
- See the feedback submitted by Prat.
- See the name of the person who logged each feedback item.
- Check the current stage of the feedback.
- Use the theme button to switch between Light and Dark mode.

Prat cannot:

- See another customer representative's private feedback.
- Update another user's feedback.
- Manage application users.
- View administrator-only audit information.

## 6. Example: Product Manager

A Product Manager can review incoming feedback and decide what should happen next.

Typical steps:

1. Open **Feedback Ingestion**.
2. Search or filter feedback.
3. Read the customer problem.
4. Open the feedback details.
5. Use the **Encapsulation Engine**.
6. Add the technical scope and acceptance criteria.
7. Save the technical specification.
8. Move the item through the workflow.

## 7. Feedback workflow

Feedback normally moves through these stages:

| Stage | Meaning |
|---|---|
| `Inbox` | New feedback has arrived |
| `Triaged` | Someone has reviewed and categorized it |
| `Encapsulated` | The feedback has been converted into a technical specification |
| `Backlog` | The work is approved but not started |
| `In Progress` | Engineering work has started |
| `Resolved` | The problem or request has been completed |

## 8. Important information on a feedback card

Each feedback card can show:

- Feedback code, such as `FB-8901`
- Priority, such as `P0 CRITICAL` or `P1 HIGH`
- Customer account
- Customer tier and revenue impact
- Feedback title
- Original customer message
- Person who logged the feedback
- Current workflow stage
- SLA status
- Comments
- Technical specification status

## 9. Simple login and demo steps

1. Open the application.
2. Log in with a valid username and password.
3. Open **Feedback Ingestion**.
4. Read or submit feedback according to the user's role.
5. Open a feedback card to see more details.
6. Use the other menu items if the role has permission.
7. Click **Logout** when finished.

## 10. One-sentence summary

PulseBoard helps different company teams collect customer feedback, understand it,
turn it into development work, and track it until it is resolved.

## 11. How the application was deployed

The application was deployed to the cloud using these services:

| Service | How it was used |
|---|---|
| Bluehost | Provided the VPS/server |
| Ubuntu | Operating system installed on the server |
| Docker | Runs the frontend, backend, database, and Traefik containers |
| GoDaddy | Stores the domain name and DNS settings |
| SendGrid | Sends registration and notification emails |
| Git | Downloads the application source code onto the server |

### Simple deployment steps

1. A VPS server was created in Bluehost.
2. Ubuntu was installed as the server operating system.
3. Docker and Docker Compose were installed on Ubuntu.
4. The project repository was cloned using Git.
5. The Docker Compose configuration was started.
6. The application frontend, backend, MySQL database, and Traefik services started in Docker.
7. A domain was purchased and managed in GoDaddy.
8. A DNS record was added in GoDaddy pointing the domain to the Bluehost server IP address.
9. Traefik provided HTTPS using a Let's Encrypt certificate.
10. SendGrid was connected to send registration emails using a verified sender address.

In simple terms:

```text
GoDaddy domain
       ↓
Bluehost server IP
       ↓
Ubuntu + Docker
       ↓
Frontend + Backend + MySQL + Traefik
       ↓
PulseBoard application
```

### Email service

SendGrid is used by the backend to send emails when a user registers. The sender email
must be verified in SendGrid. The project currently uses SendGrid's free subscription
for development and demonstration purposes.

### Important security notes

- Keep passwords, API keys, and `.env` files private.
- Do not expose the MySQL port publicly.
- Allow only the required web ports, normally 80 and 443.
- Use HTTPS when opening the application.
- Free service plans may have usage limits.
