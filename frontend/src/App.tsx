import { useState, useEffect } from 'react';
import type { FeedbackItem, UserPersona, WorkflowStage, EncapsulatedSpec } from './types/feedback';
import { Login } from './components/auth/Login';
import { Sidebar } from './components/layout/Sidebar';
import { FeedbackList } from './components/feedback/FeedbackList';
import { SubmitFeedbackModal } from './components/feedback/SubmitFeedbackModal';
import { EncapsulationModal } from './components/encapsulation/EncapsulationModal';
import { EncapsulationDashboard } from './components/encapsulation/EncapsulationDashboard';
import { KanbanBoard } from './components/workflow/KanbanBoard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FeedbackDetailsDrawer } from './components/feedback/FeedbackDetailsDrawer';
import { UserManagement } from './components/users/UserManagement';
import { AuditLogDashboard } from './components/audit/AuditLogDashboard';
import { availableDashboardTabs, canOpenSubmitFeedback, canEncapsulateFeedback, canTransitionWorkflow, canCommentFeedback } from './utils/permissions';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserPersona | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('feedback');
  const [allowedTabs, setAllowedTabs] = useState<string[]>(['feedback']);
  
  const [items, setItems] = useState<FeedbackItem[]>([]);

  // Modals & Drawers state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [detailsItem, setDetailsItem] = useState<FeedbackItem | null>(null);
  const [encapsulationItem, setEncapsulationItem] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      const tabs = availableDashboardTabs(currentUser);
      setAllowedTabs(tabs);
      if (!tabs.includes(currentTab)) {
        setCurrentTab(tabs[0] || 'feedback');
      }
    }
  }, [currentUser, currentTab]);
 
  // On mount, attempt to restore session via refresh endpoint
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    restoreSession();
  }, []);

  // Fetch feedback items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchFeedback = async () => {
        try {
          const response = await fetch('/api/feedback', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setItems(data);
          }
        } catch (error) {
          console.error("Error fetching feedback:", error);
        }
      };
      
      fetchFeedback();
    }
  }, [isAuthenticated]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth Handlers
  const handleLogin = (user: UserPersona) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout failed', e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const authHeaders: Record<string, string> = {};

  const updateFeedbackAPI = async (updatedItem: FeedbackItem) => {
    try {
      const response = await fetch(`/api/feedback/${updatedItem.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) {
        console.error("Failed to update feedback in database");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  // Workflow Handlers
  const handleStageChange = (feedbackId: string, newStage: WorkflowStage) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === feedbackId) {
          const now = new Date().toISOString();
          const newAuditLog = {
            id: `aud-${Date.now()}`,
            timestamp: now,
            actor: currentUser?.name || 'Unknown',
            actorRole: currentUser?.role || 'USER',
            action: 'STAGE_CHANGED',
            details: `Transitioned stage from ${item.stage.toUpperCase()} to ${newStage.toUpperCase()}.`,
          };
          const updatedItem = {
            ...item,
            stage: newStage,
            auditTrail: [...item.auditTrail, newAuditLog],
          };
          updateFeedbackAPI(updatedItem); // Persist to DB
          return updatedItem;
        }
        return item;
      })
    );

    if (detailsItem && detailsItem.id === feedbackId) {
      setDetailsItem((prev) => prev ? { ...prev, stage: newStage } : null);
    }
  };

  // Encapsulation Handler
  const handleSaveSpec = (feedbackId: string, spec: EncapsulatedSpec) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === feedbackId) {
          const now = new Date().toISOString();
          const newAuditLog = {
            id: `aud-${Date.now()}`,
            timestamp: now,
            actor: currentUser?.name || 'Unknown',
            actorRole: currentUser?.role || 'USER',
            action: 'ENCAPSULATED',
            details: `Encapsulated raw feedback into technical specification ${spec.id} (${spec.confidenceScore}% fit confidence).`,
          };
          const updatedItem = {
            ...item,
            encapsulatedSpec: spec,
            stage: item.stage === 'inbox' || item.stage === 'triaged' ? 'encapsulated' : item.stage,
            priority: spec.suggestedPriority,
            auditTrail: [...item.auditTrail, newAuditLog],
          };
          updateFeedbackAPI(updatedItem); // Persist to DB
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Submit Feedback Handler
  const handleAddFeedback = async (newItem: FeedbackItem) => {
    setItems((prev) => [newItem, ...prev]);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        console.error("Failed to save feedback to database");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  };

  // Comment Handler
  const handleAddComment = (feedbackId: string, message: string) => {
    const newComment = {
      id: `cm-${Date.now()}`,
      author: currentUser?.name || 'Unknown',
      role: currentUser?.role?.replace('_', ' ') || 'USER',
      timestamp: new Date().toISOString(),
      message,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          const updatedItem = {
            ...item,
            comments: [...item.comments, newComment],
          };
          updateFeedbackAPI(updatedItem); // Persist to DB
          return updatedItem;
        }
        return item;
      })
    );

    if (detailsItem && detailsItem.id === feedbackId) {
      setDetailsItem((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onLogout={handleLogout}
        allowedTabs={allowedTabs}
        canCreateFeedback={canOpenSubmitFeedback(currentUser)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {currentTab === 'feedback' && (
          <FeedbackList
            items={items}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenDetails={(item) => setDetailsItem(item)}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
            canCreateFeedback={canOpenSubmitFeedback(currentUser)}
            canEncapsulate={canEncapsulateFeedback(currentUser)}
          />
        )}

        {currentTab === 'encapsulation' && (
          <EncapsulationDashboard
            items={items}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
            onOpenDetails={(item) => setDetailsItem(item)}
          />
        )}

        {currentTab === 'workflow' && (
          <KanbanBoard
            items={items}
            onStageChange={handleStageChange}
            onOpenDetails={(item) => setDetailsItem(item)}
            onStartEncapsulation={(item) => setEncapsulationItem(item)}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            canSubmitFeedback={canOpenSubmitFeedback(currentUser)}
            canEncapsulate={canEncapsulateFeedback(currentUser)}
            canTransition={canTransitionWorkflow(currentUser)}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard items={items} />
        )}

        {currentTab === 'users' && (
          <UserManagement />
        )}

        {currentTab === 'audit' && (
          <AuditLogDashboard />
        )}
      </main>

      {/* Submit Modal */}
      <SubmitFeedbackModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleAddFeedback}
        currentUser={currentUser}
        currentUserRole={currentUser.role}
      />

      {/* Encapsulation Wizard Modal */}
      <EncapsulationModal
        isOpen={!!encapsulationItem}
        item={encapsulationItem}
        onClose={() => setEncapsulationItem(null)}
        onSaveSpec={handleSaveSpec}
        currentUser={currentUser.name}
      />

      {/* Feedback Item Details Drawer */}
      <FeedbackDetailsDrawer
        isOpen={!!detailsItem}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onStageChange={handleStageChange}
        onAddComment={handleAddComment}
        onStartEncapsulation={(item) => setEncapsulationItem(item)}
        currentUser={currentUser.name}
        canChangeStage={canTransitionWorkflow(currentUser)}
        canEncapsulate={canEncapsulateFeedback(currentUser)}
        canComment={canCommentFeedback(currentUser)}
      />
    </div>
  );
}

export default App;
