import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ShieldAlert, Cpu, DollarSign, Layers } from 'lucide-react';
import type { FeedbackItem } from '../../types/feedback';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackListProps {
  items: FeedbackItem[];
  onOpenSubmitModal: () => void;
  onOpenDetails: (item: FeedbackItem) => void;
  onStartEncapsulation: (item: FeedbackItem) => void;
  canCreateFeedback: boolean;
  canEncapsulate?: boolean;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  items,
  onOpenSubmitModal,
  onOpenDetails,
  onStartEncapsulation,
  canCreateFeedback,
  canEncapsulate = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rawContent.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = selectedStage === 'ALL' || item.stage === selectedStage;
      const matchesTier = selectedTier === 'ALL' || item.account.tier === selectedTier;
      const matchesPriority = selectedPriority === 'ALL' || item.priority === selectedPriority;

      return matchesSearch && matchesStage && matchesTier && matchesPriority;
    });
  }, [items, searchTerm, selectedStage, selectedTier, selectedPriority]);

  // KPI Calculations
  const totalCount = items.length;
  const slaBreachedCount = items.filter(i => i.isSlaBreached).length;
  const encapsulatedCount = items.filter(i => i.encapsulatedSpec).length;
  const encapsulationRate = totalCount > 0 ? Math.round((encapsulatedCount / totalCount) * 100) : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Section Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer Feedback Ingestion Queue
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Real-time feed of enterprise customer tickets, SLA tracking, and feature requests.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-lg"
          onClick={onOpenSubmitModal}
          disabled={!canCreateFeedback}
        >
          <Plus size={18} />
          <span>{canCreateFeedback ? 'Ingest New Feedback' : 'Create feedback restricted'}</span>
        </button>
      </div>

      {/* Enterprise KPI Metric Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Total Ingested Tickets</span>
            <Layers size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active across 5 Key Enterprise Accounts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>Encapsulation Rate</span>
            <Cpu size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {encapsulationRate}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {encapsulatedCount} of {totalCount} items converted to Specs
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>SLA Breaches</span>
            <ShieldAlert size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: slaBreachedCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {slaBreachedCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {slaBreachedCount > 0 ? 'Requires immediate PM intervention' : 'All accounts within target SLA'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
            <span>At-Risk Revenue Impact</span>
            <DollarSign size={16} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            $4.45M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Combined ARR across active tickets
          </div>
        </div>
      </div>

      {/* Monochromatic Filter & Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search Box */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search feedback code, title, raw text, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Stage Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Stages</option>
            <option value="inbox">Inbox</option>
            <option value="triaged">Triaged</option>
            <option value="encapsulated">Encapsulated</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Tier Filter */}
        <select
          className="select"
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="ALL">All Account Tiers</option>
          <option value="ENTERPRISE_VIP">Enterprise VIP</option>
          <option value="ENTERPRISE">Enterprise</option>
          <option value="MID_MARKET">Mid-Market</option>
          <option value="SMB">SMB</option>
        </select>

        {/* Priority Filter */}
        <select
          className="select"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{ width: '140px' }}
        >
          <option value="ALL">All Priorities</option>
          <option value="P0_CRITICAL">P0 Critical</option>
          <option value="P1_HIGH">P1 High</option>
          <option value="P2_MEDIUM">P2 Medium</option>
          <option value="P3_LOW">P3 Low</option>
        </select>
      </div>

      {/* Feedback Items Grid */}
      {filteredItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
        }}>
          {filteredItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              onOpenDetails={onOpenDetails}
              onStartEncapsulation={onStartEncapsulation}
              canEncapsulate={canEncapsulate}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px' }}>
            No feedback entries match your current filter criteria.
          </div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedStage('ALL');
              setSelectedTier('ALL');
              setSelectedPriority('ALL');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
