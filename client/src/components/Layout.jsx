
import React, { useState } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Management</strong>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">People & Projects</span>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>

            <div className="profile-chip">
              <span className="avatar">PF</span>
              <span className="profile-name">
                Workspace Admin
                <small>Administrator</small>
              </span>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <main className="content-area">{children}</main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} PeopleFlow</span>
          <span>Employee & Project Management</span>
        </footer>
      </div>
    </div>
  );
}
