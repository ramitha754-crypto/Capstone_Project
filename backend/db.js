import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const RESET_ADMIN_PASSWORD = process.env.RESET_ADMIN_PASSWORD === 'true';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Create connection to initialize database
async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '0101',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const dbName = process.env.DB_NAME || 'feedback_encapsulation_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists.`);
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await connection.end();
  }
}

let pool;

export async function getDbPool() {
  if (pool) return pool;

  await initDb();

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '0101',
    database: process.env.DB_NAME || 'feedback_encapsulation_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

const mockAccounts = {
  acme: {
    id: 'acc-1',
    name: 'Acme Global Financial',
    tier: 'ENTERPRISE_VIP',
    annualRevenue: '$1,200,000 ARR',
    logoInitial: 'AG',
    slaTierHours: 4,
  },
  globex: {
    id: 'acc-2',
    name: 'Globex Health Systems',
    tier: 'ENTERPRISE',
    annualRevenue: '$850,000 ARR',
    logoInitial: 'GH',
    slaTierHours: 12,
  },
  cyberdyne: {
    id: 'acc-3',
    name: 'Cyberdyne Defense Tech',
    tier: 'ENTERPRISE_VIP',
    annualRevenue: '$2,400,000 ARR',
    logoInitial: 'CD',
    slaTierHours: 4,
  },
  stark: {
    id: 'acc-4',
    name: 'Stark Logistics Corp',
    tier: 'MID_MARKET',
    annualRevenue: '$320,000 ARR',
    logoInitial: 'SL',
    slaTierHours: 24,
  },
  initech: {
    id: 'acc-5',
    name: 'Initech SaaS Solutions',
    tier: 'SMB',
    annualRevenue: '$95,000 ARR',
    logoInitial: 'IN',
    slaTierHours: 48,
  }
};

const initialFeedbackItems = [
  {
    id: 'fb-101',
    code: 'FB-8901',
    title: 'SAML 2.0 Identity Provider Timeout on Multi-Tenant SSO Federation',
    rawContent: 'During peak morning hours (08:00 - 10:00 EST), our 4,500 active employees experience intermittent SAML token handshake timeouts when authenticating via Azure AD SSO. Users are forced to re-authenticate up to 3 times, causing severe latency in compliance reporting workflows. We need custom token duration parameters and session persistence controls.',
    category: 'SECURITY_COMPLIANCE',
    priority: 'P0_CRITICAL',
    stage: 'triaged',
    accountId: 'acc-1',
    sentiment: 'VERY_NEGATIVE',
    submittedBy: 'David Chen (VP Tech, Acme)',
    submittedAt: '2026-08-11T08:30:00Z',
    slaDeadline: '2026-08-11T12:30:00Z',
    isSlaBreached: false,
    tags: JSON.stringify(['SSO', 'SAML', 'AzureAD', 'Auth', 'SLA-Urgent']),
    encapsulatedSpec: null,
    auditTrail: JSON.stringify([
      { id: 'aud-1', timestamp: '2026-08-11T08:30:00Z', actor: 'David Chen', actorRole: 'CUSTOMER_REP', action: 'SUBMITTED', details: 'Submitted high severity SSO timeout feedback entry via Enterprise Portal.' },
      { id: 'aud-2', timestamp: '2026-08-11T09:15:00Z', actor: 'Marcus Vance', actorRole: 'SUPPORT_SPECIALIST', action: 'TRIAGED', details: 'Verified customer log trace. Priority elevated to P0_CRITICAL due to ARR impact.' }
    ]),
    comments: JSON.stringify([
      { id: 'cm-1', author: 'Marcus Vance', role: 'SUPPORT_SPECIALIST', timestamp: '2026-08-11T09:20:00Z', message: 'Escalated directly to Identity Engineering team. Reproducible on multi-region Okta & Azure AD federation tenants.' }
    ])
  },
  {
    id: 'fb-102',
    code: 'FB-8902',
    title: 'REST API Rate Limiting Thresholds Blocking Hourly Data Ingestion Pipeline',
    rawContent: 'Our automated ETL batch processor syncs patient record metadata every hour via the /v2/telemetry/ingest endpoint. The strict rate limit of 100 req/min causes 429 Too Many Requests errors mid-batch. We need configurable burst thresholds (up to 500 req/min) or dedicated API keys for Enterprise Tier accounts.',
    category: 'INTEGRATION_API',
    priority: 'P1_HIGH',
    stage: 'encapsulated',
    accountId: 'acc-2',
    sentiment: 'NEGATIVE',
    submittedBy: 'Dr. Aris Thorne (Lead Architect, Globex)',
    submittedAt: '2026-08-10T14:15:00Z',
    slaDeadline: '2026-08-11T02:15:00Z',
    isSlaBreached: true,
    tags: JSON.stringify(['API', 'RateLimit', 'ETL', 'Ingestion', 'HIPAA']),
    encapsulatedSpec: JSON.stringify({
      id: 'spec-8902',
      feedbackId: 'fb-102',
      title: 'Configurable Dynamic Rate Limiter & Enterprise Tier Token Buckets',
      coreProblem: 'Fixed API rate limiting (100 req/min) degrades automated ETL batch syncs for Enterprise Tier clients requiring high burst throughput.',
      businessImpact: '$850k ARR account impacted. Risk of delayed medical telemetry reports. Customer SLA breach on ingestion pipeline.',
      technicalScope: [ 'Implement Redis-backed sliding window token bucket rate limiter.', 'Add tier-based rate limit rules in API Gateway middleware (Enterprise = 600 req/min burst).', 'Expose telemetry response header X-RateLimit-Tier-Capacity for client sync tuning.' ],
      acceptanceCriteria: [ 'Enterprise API keys bypass global 100 req/min limit up to 600 req/min.', 'HTTP 429 response contains dynamic Retry-After header with exact millisecond backoff.', 'Rate limit configuration editable per account in Enterprise Admin Portal.' ],
      suggestedPriority: 'P1_HIGH',
      targetEpicLink: 'EPIC-INFRA-409',
      encapsulatedBy: 'Elena Rostova',
      encapsulatedAt: '2026-08-10T18:45:00Z',
      confidenceScore: 94,
    }),
    auditTrail: JSON.stringify([
      { id: 'aud-3', timestamp: '2026-08-10T14:15:00Z', actor: 'Dr. Aris Thorne', actorRole: 'CUSTOMER_REP', action: 'SUBMITTED', details: 'Logged API rate limit bottleneck for hourly ingestion.' },
      { id: 'aud-4', timestamp: '2026-08-10T18:45:00Z', actor: 'Elena Rostova', actorRole: 'PRODUCT_MANAGER', action: 'ENCAPSULATED', details: 'Encapsulated into structured spec spec-8902 linked to EPIC-INFRA-409.' }
    ]),
    comments: JSON.stringify([
      { id: 'cm-2', author: 'Elena Rostova', role: 'PRODUCT_MANAGER', timestamp: '2026-08-10T19:00:00Z', message: 'Spec review complete. Scope prioritized for Sprint 44 Infrastructure epic.' }
    ])
  }
];

export async function setupDatabase() {
  try {
    const currentPool = await getDbPool();
    
    // 1. Create users table
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        title VARCHAR(100),
        avatar VARCHAR(50),
        email VARCHAR(100),
        permissions JSON,
        settings JSON,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_at DATETIME NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        otp_code VARCHAR(10) NULL,
        otp_expires_at DATETIME NULL
      )
    `);
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN settings JSON');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) NULL');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    try {
      await currentPool.query('ALTER TABLE users ADD COLUMN otp_expires_at DATETIME NULL');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    // 2. Create accounts table
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tier VARCHAR(50) NOT NULL,
        annualRevenue VARCHAR(100),
        logoInitial VARCHAR(10),
        slaTierHours INT
      )
    `);

    // 3. Create feedback table
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        rawContent TEXT NOT NULL,
        category VARCHAR(50),
        priority VARCHAR(50),
        stage VARCHAR(50),
        accountId VARCHAR(50),
        sentiment VARCHAR(50),
        submittedBy VARCHAR(255),
        submittedById VARCHAR(50),
        submittedAt DATETIME,
        slaDeadline DATETIME,
        isSlaBreached BOOLEAN,
        tags JSON,
        encapsulatedSpec JSON,
        auditTrail JSON,
        comments JSON,
        FOREIGN KEY (accountId) REFERENCES accounts(id)
      )
    `);
    try {
      await currentPool.query('ALTER TABLE feedback ADD COLUMN submittedById VARCHAR(50)');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    // 4. Create system_audit_logs table
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS system_audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        timestamp DATETIME NOT NULL,
        actorId VARCHAR(50),
        actorName VARCHAR(100),
        actorRole VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        details TEXT
      )
    `);

    console.log("Tables validated.");

    const adminPermissions = JSON.stringify([
      'ENCAPSULATE_FEEDBACK',
      'TRANSITION_WORKFLOW',
      'VIEW_ANALYTICS',
      'ASSIGN_EPIC',
      'MANAGE_USERS',
      'FULL_ADMIN_ACCESS',
      'CREATE_FEEDBACK',
      'SUBMIT_FEEDBACK',
      'TRIAGE_FEEDBACK',
      'COMMENT_FEEDBACK',
      'DELETE_FEEDBACK',
      'OVERRIDE_SLA',
      'VIEW_ENCAPSULATIONS',
      'VIEW_OWN_FEEDBACK',
      'VIEW_AUDIT_LOGS'
    ]);

    // Seed users
    const [userRows] = await currentPool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      if (!DEFAULT_ADMIN_PASSWORD) {
        console.warn('DEFAULT_ADMIN_PASSWORD is not set; skipping automatic seeding of user accounts. Please create an admin user manually or set DEFAULT_ADMIN_PASSWORD in your environment for automated seeding (not recommended for production).');
      } else {
        console.log("Seeding users...");
        const hash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
        const mockUsers = [
          { id: 'usr-1', username: 'admin', name: 'Elena Rostova', role: 'ENTERPRISE_ADMIN', title: 'Principal Product Manager', avatar: 'ER', email: 'elena.rostova@enterprise.internal', permissions: adminPermissions },
          { id: 'usr-2', username: 'alex', name: 'Marcus Vance', role: 'SUPPORT_SPECIALIST', title: 'Senior Enterprise Support Lead', avatar: 'MV', email: 'marcus.v@enterprise.internal', permissions: JSON.stringify(['CREATE_FEEDBACK', 'COMMENT_FEEDBACK']) },
          { id: 'usr-3', username: 'sarah', name: 'Sarah Jenkins', role: 'ENGINEERING_LEAD', title: 'Staff Software Engineer', avatar: 'SJ', email: 's.jenkins@enterprise.internal', permissions: JSON.stringify(['VIEW_ENCAPSULATIONS', 'COMMENT_FEEDBACK', 'ASSIGN_EPIC']) }
        ];
        for (const user of mockUsers) {
          await currentPool.query(`
            INSERT INTO users (id, username, password_hash, name, role, title, avatar, email, permissions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [user.id, user.username, hash, user.name, user.role, user.title, user.avatar, user.email, user.permissions]);
        }
      }
    }

    if (RESET_ADMIN_PASSWORD) {
      if (!DEFAULT_ADMIN_PASSWORD) {
        console.warn('RESET_ADMIN_PASSWORD=true but DEFAULT_ADMIN_PASSWORD is not set; skipping admin password reset/creation to avoid introducing a default credential.');
      } else {
        const [adminRows] = await currentPool.query('SELECT id, password_hash FROM users WHERE username = ?', ['admin']);
        if (adminRows.length === 0) {
          const adminHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
          await currentPool.query(`
            INSERT INTO users (id, username, password_hash, name, role, title, avatar, email, permissions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, ['usr-1', 'admin', adminHash, 'Elena Rostova', 'ENTERPRISE_ADMIN', 'Principal Product Manager', 'ER', 'elena.rostova@enterprise.internal', adminPermissions]);
          console.log('Admin account created with default credentials.');
        } else {
          const adminId = adminRows[0].id;
          const adminHash = adminRows[0].password_hash;
          const matches = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, adminHash);
          if (!matches) {
            const newHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
            await currentPool.query('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, 'admin']);
            console.log('Admin password reset to default credentials.');
          }
          await currentPool.query(
            'UPDATE users SET role = ?, permissions = ? WHERE id = ?',
            ['ENTERPRISE_ADMIN', adminPermissions, adminId]
          );
          console.log('Admin role and permissions updated to full access.');
        }
      }
    }

    // Seed accounts
    const [accRows] = await currentPool.query('SELECT COUNT(*) as count FROM accounts');
    if (accRows[0].count === 0) {
      console.log("Seeding accounts...");
      const accountsList = Object.values(mockAccounts);
      for (const acc of accountsList) {
        await currentPool.query(`
          INSERT INTO accounts (id, name, tier, annualRevenue, logoInitial, slaTierHours)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [acc.id, acc.name, acc.tier, acc.annualRevenue, acc.logoInitial, acc.slaTierHours]);
      }
    }

    // Seed feedback
    const [fbRows] = await currentPool.query('SELECT COUNT(*) as count FROM feedback');
    if (fbRows[0].count === 0) {
      console.log("Seeding feedback...");
      for (const fb of initialFeedbackItems) {
        await currentPool.query(`
          INSERT INTO feedback (id, code, title, rawContent, category, priority, stage, accountId, sentiment, submittedBy, submittedAt, slaDeadline, isSlaBreached, tags, encapsulatedSpec, auditTrail, comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [fb.id, fb.code, fb.title, fb.rawContent, fb.category, fb.priority, fb.stage, fb.accountId, fb.sentiment, fb.submittedBy, new Date(fb.submittedAt), new Date(fb.slaDeadline), fb.isSlaBreached, fb.tags, fb.encapsulatedSpec, fb.auditTrail, fb.comments]);
      }
    }

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

/**
 * Inserts a record into the system_audit_logs table.
 * @param {object} pool - The MySQL connection pool.
 * @param {string|null} actorId - The ID of the user performing the action.
 * @param {string|null} actorName - The display name of the actor.
 * @param {string|null} actorRole - The role of the actor.
 * @param {string} action - A short action label (e.g., 'LOGIN', 'LOGOUT', 'UPDATE_FEEDBACK').
 * @param {string} details - A human-readable description of what changed.
 */
export async function insertAuditLog(pool, actorId, actorName, actorRole, action, details) {
  try {
    const id = `sysaud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await pool.query(
      'INSERT INTO system_audit_logs (id, timestamp, actorId, actorName, actorRole, action, details) VALUES (?, NOW(), ?, ?, ?, ?, ?)',
      [id, actorId || null, actorName || null, actorRole || null, action, details]
    );
  } catch (err) {
    // Non-critical: log but don't throw
    console.error('Failed to insert audit log:', err);
  }
}
