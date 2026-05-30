"use client";
import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, Globe, Trash2, RefreshCw } from "lucide-react";
import { BACKEND_URL } from "@/constants";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;   // ISO string
  isCurrent: boolean;
}

interface Props {
  email: string;
  onClose: () => void;
}

const API = BACKEND_URL;

async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? data?.message ?? "Request failed");
  return data;
}

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? data?.message ?? "Request failed");
  return data;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function DeviceIcon({ type }: { type: Session["deviceType"] }) {
  const cls = "w-5 h-5";
  if (type === "mobile")  return <Smartphone className={cls} />;
  if (type === "tablet")  return <Tablet className={cls} />;
  if (type === "desktop") return <Monitor className={cls} />;
  return <Globe className={cls} />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function LoginActivityModal({ email, onClose }: Props) {
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [loading, setLoading]         = useState(true);
  const [revoking, setRevoking]       = useState<string | null>(null); // session id being revoked
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError]             = useState("");

  /* ── fetch sessions on mount ── */
  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/api/login-activity/sessions?email=${encodeURIComponent(email)}`);
      setSessions(data.sessions ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(sessionId: string) {
    setRevoking(sessionId);
    setError("");
    try {
      await apiPost("/api/login-activity/revoke", { email, sessionId });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRevoking(null);
    }
  }

  async function revokeAllOther() {
    setRevokingAll(true);
    setError("");
    try {
      await apiPost("/api/login-activity/revoke-all", { email });
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRevokingAll(false);
    }
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#cb6f4d] px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Login Activity</h2>
            <p className="text-[#fde8df] text-xs mt-0.5">Devices currently logged into your account.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-40"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors text-xl leading-none" aria-label="Close">✕</button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#cb6f4d]" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sessions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No active sessions found.</p>
          )}

          {/* Current session */}
          {!loading && currentSession && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Current Session
              </p>
              <SessionCard session={currentSession} isCurrent revoking={false} onRevoke={() => {}} />
            </div>
          )}

          {/* Other sessions */}
          {!loading && otherSessions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Other Sessions ({otherSessions.length})
                </p>
                <button
                  onClick={revokeAllOther}
                  disabled={revokingAll}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                >
                  {revokingAll ? "Signing out…" : "Sign out all others"}
                </button>
              </div>
              <div className="space-y-3">
                {otherSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isCurrent={false}
                    revoking={revoking === session.id}
                    onRevoke={() => revokeSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No other devices */}
          {!loading && !error && currentSession && otherSessions.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-green-500 text-lg">✓</span>
              <p className="text-sm text-green-700">No other devices are logged in.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#cb6f4d] text-white py-3 rounded-lg font-bold hover:bg-[#b55d3e] transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Session Card sub-component
───────────────────────────────────────────── */
function SessionCard({
  session,
  isCurrent,
  revoking,
  onRevoke,
}: {
  session: Session;
  isCurrent: boolean;
  revoking: boolean;
  onRevoke: () => void;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-4 ${
      isCurrent ? "border-[#cb6f4d] bg-[#fef5f1]" : "border-gray-200 bg-white"
    }`}>
      {/* Icon */}
      <div className={`mt-0.5 shrink-0 ${isCurrent ? "text-[#cb6f4d]" : "text-gray-400"}`}>
        <DeviceIcon type={session.deviceType} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-800 text-sm truncate">{session.deviceName}</p>
          {isCurrent && (
            <span className="text-[10px] font-bold bg-[#cb6f4d] text-white px-2 py-0.5 rounded-full shrink-0">
              This device
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {session.browser} · {session.os}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {session.ipAddress} · {session.location}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Last active: {timeAgo(session.lastActive)}
        </p>
      </div>

      {/* Revoke button */}
      {!isCurrent && (
        <button
          onClick={onRevoke}
          disabled={revoking}
          className="shrink-0 text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors mt-0.5"
          aria-label="Sign out this device"
        >
          {revoking
            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-4 h-4" />
          }
        </button>
      )}
    </div>
  );
}