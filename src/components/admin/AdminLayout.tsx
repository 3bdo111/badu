"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import styles from "./admin-layout.module.css";

export function AdminLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.desktopSidebar}>
        <AdminSidebar />
      </div>

      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        >
          <div
            className={styles.mobileDrawer}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className={styles.mainArea}>
        <AdminHeader
          title={title}
          onToggleMobileMenu={() => setMobileOpen((prev) => !prev)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
