import React from 'react';
import { 
  AlertTriangle, 
  Cpu, 
  ChevronRight, 
  MessageSquare, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import type { FeedbackItem, PriorityLevel } from '../../types/feedback';

interface FeedbackCardProps {
  item: FeedbackItem;
  onOpenDetails: (item: FeedbackItem) => void;
  onStartEncapsulation: (item: FeedbackItem) => void;
  canEncapsulate?: boolean;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  item,
  onOpenDetails,
  onStartEncapsulation,
  canEncapsulate = true,
}) => {
  const renderPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'P0_CRITICAL':
        return <span className="badge badge-critical">P0 CRITICAL</span>;
      case 'P1_HIGH':
        return <span className="badge badge-high">P1 HIGH</span>;
      case 'P2_MEDIUM':
        return <span className="badge badge-medium">P2 MEDIUM</span>;
      case 'P3_LOW':
        return <span className="badge badge-low">P3 LOW</span>;
    }
  };

  const renderSentimentIcon = () => {
    switch (item.sentiment) {
      case 'VERY_NEGATIVE':
      case 'NEGATIVE':
        return (
          <span title="Negative Customer Sentiment">
            <TrendingDown size={14} style={{ color: 'var(--text-primary)' }} />
          </span>
        );
      case 'POSITIVE':
        return (
          <span title="Positive Feedback">
            <TrendingUp size={14} style={{ color: 'var(--text-primary)' }} />
          </span>
        );
      default:
        return (
          <span title="Neutral Sentiment">
            <Minus size={14} style={{ color: 'var(--text-muted)' }} />
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      position: 'relative',
    }}>
      {/* Top Header Row */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {item.code}
            </span>
            {renderPriorityBadge(item.priority)}
            {item.isSlaBreached && (
              <span className="badge badge-breach">
                <AlertTriangle size={10} /> SLA BREACH
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {renderSentimentIcon()}
            <span className="badge" style={{ backgroundColor: 'var(--text-inverse)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {item.stage.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Customer Account Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          backgroundColor: 'var(--text-inverse)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-card-active)',
            color: 'var(--text-primary)',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {item.account.logoInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.account.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {item.account.tier.replace('_', ' ')} • {item.account.annualRevenue}
            </div>
          </div>
        </div>

        {/* Feedback Title & Raw Text */}
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: '8px',
          cursor: 'pointer'
        }} onClick={() => onOpenDetails(item)}>
          {item.title}
        </h3>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          "{item.rawContent}"
        </p>
      </div>

      {/* Footer Section & Actions */}
      <div>
        {/* Encapsulated Indicator */}
        {item.encapsulatedSpec ? (
          <div style={{
            padding: '8px 10px',
            backgroundColor: 'var(--bg-card-hover)',
            borderRadius: '6px',
            border: '1px dashed var(--border-bright)',
            marginBottom: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--text-primary)' }} />
              <span>Spec: {item.encapsulatedSpec.targetEpicLink || 'Encapsulated'}</span>
            </div>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {item.encapsulatedSpec.confidenceScore}% Spec Fit
            </span>
          </div>
        ) : (
          <div style={{
            padding: '6px 10px',
            backgroundColor: 'var(--text-inverse)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '12px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Cpu size={12} />
            <span>Unencapsulated raw feedback</span>
          </div>
        )}

        {/* Action Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline"
            onClick={() => onOpenDetails(item)}
            style={{ flex: 1, height: '34px', fontSize: '0.78rem' }}
          >
            <MessageSquare size={13} />
            <span>Details ({item.comments.length})</span>
          </button>

          {!item.encapsulatedSpec ? (
            canEncapsulate ? (
              <button
                className="btn btn-primary"
                onClick={() => onStartEncapsulation(item)}
                style={{ flex: 1.2, height: '34px', fontSize: '0.78rem' }}
              >
                <Cpu size={13} />
                <span>Encapsulate Spec</span>
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => onOpenDetails(item)}
                style={{ flex: 1.2, height: '34px', fontSize: '0.78rem' }}
              >
                <span>View Responses</span>
                <ChevronRight size={13} />
              </button>
            )
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => onOpenDetails(item)}
              style={{ flex: 1.2, height: '34px', fontSize: '0.78rem' }}
            >
              <span>View Spec</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
