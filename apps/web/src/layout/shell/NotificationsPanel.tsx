import { AlertTriangle, CheckCircle, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";

import { NOTIFICATION_FILTERS } from "./mock-data";
import { useShell } from "./ShellProvider";

function formatAlertTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Notification center — risk alerts from GET /risk/alerts */
export function NotificationsPanel() {
  const navigate = useNavigate();
  const {
    overlay,
    closeOverlay,
    notificationFilter,
    setNotificationFilter,
    markAllNotificationsRead,
    hasUnreadNotifications,
    alerts,
    alertsLoading,
    alertsError,
  } = useShell();

  if (overlay !== "notifications") return null;

  const filtered =
    notificationFilter === "all"
      ? alerts
      : alerts.filter((a) => {
          if (notificationFilter === "alerts") return a.status !== "read";
          if (notificationFilter === "ai") return a.channel === "ai";
          return true;
        });

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-50 bg-[rgba(6,54,59,0.35)] animate-fv-fade"
        onClick={closeOverlay}
      />
      <aside
        role="dialog"
        aria-label="Notifications"
        className="fixed top-0 right-0 bottom-0 z-[51] flex w-[min(400px,100vw)] flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-slide-in-right"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-[18px] py-4">
          <h2 className="m-0 flex-1 text-base font-bold text-[var(--text-strong)]">Notifications</h2>
          {hasUnreadNotifications && (
            <button
              type="button"
              onClick={() => void markAllNotificationsRead()}
              className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-[var(--text-link)]"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={closeOverlay}
            className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)]"
          >
            <X size={17} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)] px-3.5 py-2.5">
          {NOTIFICATION_FILTERS.map((f) => {
            const active = notificationFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setNotificationFilter(f.id)}
                className="cursor-pointer rounded-full border px-3 py-1 text-[13px] whitespace-nowrap transition-colors"
                style={{
                  borderColor: active ? "var(--color-teal-300)" : "var(--border-subtle)",
                  background: active ? "var(--color-teal-50)" : "transparent",
                  color: active ? "var(--color-deep-teal)" : "var(--text-body)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {alertsLoading && (
            <p className="px-[18px] py-6 text-sm text-[var(--text-muted)]">Loading alerts…</p>
          )}
          {alertsError && (
            <p className="px-[18px] py-6 text-sm text-[var(--text-muted)]">
              Alerts didn&apos;t load. Try again later.
            </p>
          )}
          {!alertsLoading &&
            !alertsError &&
            filtered.map((a) => {
              const Icon =
                a.channel === "ai" ? Sparkles : a.status === "read" ? CheckCircle : AlertTriangle;
              const unread = a.status !== "read";
              return (
                <div
                  key={a.id}
                  className="flex gap-3 border-b border-[var(--border-subtle)] px-[18px] py-3.5"
                  style={{ background: unread ? "var(--color-neutral-50)" : "transparent" }}
                >
                  <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                    <Icon size={17} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-[13.5px] font-semibold text-[var(--text-strong)]">
                        {a.reason}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-[var(--text-muted)]">
                        {formatAlertTime(a.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-snug text-[var(--text-body)]">
                      Student alert · {a.channel}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2 h-8"
                      onClick={() => {
                        closeOverlay();
                        navigate(`/students/${a.student_id}`);
                      }}
                    >
                      Open student
                    </Button>
                  </div>
                  {unread && (
                    <span
                      aria-hidden
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-amber)]"
                    />
                  )}
                </div>
              );
            })}
          {!alertsLoading && !alertsError && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center text-[var(--text-muted)]">
              <CheckCircle
                className="text-[var(--color-neutral-400)]"
                size={28}
                strokeWidth={iconDefaults.strokeWidth}
              />
              <div className="text-sm">You are all caught up.</div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] px-[18px] py-3">
          <button
            type="button"
            onClick={() => {
              closeOverlay();
              navigate("/settings");
            }}
            className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--text-link)]"
          >
            Notification settings
          </button>
        </div>
      </aside>
    </>
  );
}
