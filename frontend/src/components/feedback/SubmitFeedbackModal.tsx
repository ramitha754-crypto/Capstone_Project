import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { FeedbackItem, FeedbackCategory, PriorityLevel, SentimentScore, CustomerAccount } from '../../types/feedback';
import { mockAccounts } from '../../data/mockData';

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newItem: FeedbackItem) => void;
  currentUser?: UserPersona | null;
  currentUserRole?: string;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [selectedAccountKey, setSelectedAccountKey] = useState<string>('acme');
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('SECURITY_COMPLIANCE');
  const [priority, setPriority] = useState<PriorityLevel>('P1_HIGH');
  const [sentiment, setSentiment] = useState<SentimentScore>('NEGATIVE');
  const [tagInput, setTagInput] = useState('SSO, Enterprise, Critical');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account: CustomerAccount = mockAccounts[selectedAccountKey] || mockAccounts.acme;
    const randomCode = `FB-${Math.floor(8900 + Math.random() * 100)}`;
    const now = new Date();
    
    // SLA deadline calculated based on account SLA tier hours
    const slaHours = account.slaTierHours || 12;
    const slaDeadlineDate = new Date(now.getTime() + slaHours * 3600 * 1000);

    const submitterName = currentUser?.name || 'Customer User';
    const submitterRole = currentUser?.role || 'CUSTOMER_REP';
    const submitterTitle = currentUser?.title ? ` (${currentUser.title})` : '';

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      code: randomCode,
      title,
      rawContent,
      category,
      priority,
      stage: 'inbox',
      account,
      sentiment,
      submittedBy: `${submitterName}${submitterTitle}`,
      submittedAt: now.toISOString(),
      slaDeadline: slaDeadlineDate.toISOString(),
      isSlaBreached: false,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: now.toISOString(),
          actor: submitterName,
          actorRole: submitterRole,
          action: 'SUBMITTED',
          details: `Feedback ${randomCode} submitted for ${account.name} by ${submitterName}. SLA window set to ${slaHours}h.`,
        },
      ],
      comments: [],
    };

    onSubmit(newItem);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="glass-modal" style={{
        width: '100%',
        maxWidth: '620px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ingest Customer Feedback
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Record raw user feedback, issue log, or feature request into the encapsulation queue.
            </p>
          </div>
          <button 
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Account Picker */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Customer Account
            </label>
            <select
              className="select"
              value={selectedAccountKey}
              onChange={(e) => setSelectedAccountKey(e.target.value)}
              required
            >
              <option value="acme">Acme Global Financial ($1.2M ARR - VIP 4h SLA)</option>
              <option value="globex">Globex Health Systems ($850k ARR - 12h SLA)</option>
              <option value="cyberdyne">Cyberdyne Defense Tech ($2.4M ARR - VIP 4h SLA)</option>
              <option value="stark">Stark Logistics Corp ($320k ARR - 24h SLA)</option>
              <option value="initech">Initech SaaS Solutions ($95k ARR - 48h SLA)</option>
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Feedback Summary / Headline
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Multi-Tenant SSO token expiration causing authentication drops"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Raw Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Raw Feedback Verbatim Text
            </label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Paste exact verbatim feedback from customer email, support call log, or escalation ticket..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              required
            />
          </div>

          {/* 3 Column Grid for Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Category
              </label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              >
                <option value="SECURITY_COMPLIANCE">Security & SSO</option>
                <option value="PERFORMANCE_SLA">Performance / SLA</option>
                <option value="INTEGRATION_API">API & ETL Integration</option>
                <option value="USER_EXPERIENCE">User Experience</option>
                <option value="ANALYTICS_REPORTING">Analytics & Export</option>
                <option value="BILLING_GOVERNANCE">Billing Governance</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Priority Target
              </label>
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              >
                <option value="P0_CRITICAL">P0 Critical</option>
                <option value="P1_HIGH">P1 High</option>
                <option value="P2_MEDIUM">P2 Medium</option>
                <option value="P3_LOW">P3 Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Initial Sentiment
              </label>
              <select
                className="select"
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as SentimentScore)}
              >
                <option value="VERY_NEGATIVE">Very Negative</option>
                <option value="NEGATIVE">Negative</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="POSITIVE">Positive</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Tags (Comma separated)
            </label>
            <input
              type="text"
              className="input"
              placeholder="SSO, Auth, Critical, High-ARR"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>

          {/* Footer CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Submit to Ingestion Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
