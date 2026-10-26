
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BriefcaseBusiness,
  X
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/projects', label: 'Projects', icon: FolderKanban }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-scrim ${open ? 'visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <BriefcaseBusiness size={21} />
          </span>

          <span>
            People<span className="brand-accent">Flow</span>
            <small>WORKSPACE</small>
          </span>

          <button
            className="icon-button mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-dot" />
            <div>
              <strong>Workspace ready</strong>
              <p>Manage your people and projects in one place.</p>
            </div>
          </div>

          <div className="sidebar-version">
            PEOPLEFLOW · STARTER
          </div>
        </div>
      </aside>
    </>
  );
}
