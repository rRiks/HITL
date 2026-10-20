import React, { useState } from 'react';
import { Brain, Hammer, ShieldCheck, Flame, X, UserCheck } from 'lucide-react';
import * as api from '../services/api';

const ROLES_INFO = {
  architect: {
    id: 'architect',
    label: 'LEAD ARCHITECT',
    icon: '🧠',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/40',
    title: 'The Eyes & Strategist',
    duty: 'Inspects SOQL traps and hidden governor risks. Must guide and instruct the team on what to merge.',
    perk: 'Sees 100% of the code diff with syntax highlights and risk annotations.',
    handicap: 'Cannot authorize merge directly—must instruct the Intern to execute.',
  },
  intern: {
    id: 'intern',
    label: 'JUNIOR INTERN',
    icon: '🔨',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
    title: 'The Hands & PR Merger',
    duty: 'Authorized to execute decisions and PR merges. Must listen closely to the Architect!',
    perk: 'Holds the master submit button for all stage actions.',
    handicap: 'Code diff lines are partially redacted—you rely strictly on team communication!',
  },
  sre: {
    id: 'sre',
    label: 'SITE RELIABILITY ENG',
    icon: '🛡️',
    badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/40',
    title: 'The Tower Whisperer',
    duty: 'Monitors 3D Jenga structural stress and prevents catastrophic collapses.',
    perk: 'Equipped with the VETO SLAP 👋 to knock down dangerous votes.',
    handicap: 'Takes full blame if the tower collapses under high instability.',
  },
  gremlin: {
    id: 'gremlin',
    label: 'CHAOS GREMLIN',
    icon: '😈',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/40',
    title: 'The Secret Traitor',
    duty: 'Secret mission: Incur at least 1 Technical Debt block during the sprint without toppling the tower!',
    perk: 'Can subtly steer discussions toward quick-and-dirty patchwork solutions.',
    handicap: 'If the tower collapses, you are unmasked and lose all points!',
  },
};

export default function RoleBadgeHUD({
  roomId = 'default',
  currentRole = 'architect',
  onRoleChange,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const activeRole = ROLES_INFO[currentRole] || ROLES_INFO.architect;

  const handleSelectRole = async (roleKey) => {
    api.setPlayerRoleLocal(roleKey);
    try {
      await api.setPlayerRoleRemote(roomId, roleKey);
    } catch {}
    if (onRoleChange) onRoleChange(roleKey);
    setModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title="View your Assigned Role & Duties"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-mono font-bold tracking-wider cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-all ${activeRole.badgeClass}`}
      >
        <span>{activeRole.icon}</span>
        <span>ROLE: {activeRole.label}</span>
      </button>

      {/* Role Selection & Mission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
          <div className="w-full max-w-lg p-5 sm:p-6 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-2xl">{activeRole.icon}</span>
              <div>
                <h3 className="text-base font-bold font-theme-heading text-[var(--text-primary)]">
                  TEAM ROLE SPECIFICATION
                </h3>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  Asymmetric Information & Squad Responsibilities
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {Object.values(ROLES_INFO).map((r) => {
                const isSelected = r.id === currentRole;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRole(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--bg-elevated)] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                        <span>{r.icon}</span>
                        <span>{r.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-normal font-sans">
                          • {r.title}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                          ACTIVE ROLE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[var(--text-muted)]">
                          CLICK TO SWITCH
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans mb-1.5 leading-snug">
                      {r.duty}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-[var(--border-subtle)]/50">
                      <div>
                        <strong className="text-emerald-600 dark:text-emerald-400">PERK: </strong>
                        <span className="text-[var(--text-muted)]">{r.perk}</span>
                      </div>
                      <div>
                        <strong className="text-rose-600 dark:text-rose-400">HANDICAP: </strong>
                        <span className="text-[var(--text-muted)]">{r.handicap}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-bold font-mono rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer"
              >
                CLOSE SPECIFICATION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
