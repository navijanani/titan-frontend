import { useState, type FC, type FormEvent } from "react";
import { IconUser, IconLock, IconLogout } from "@tabler/icons-react";
import { useAuth } from "../auth/AuthContext";
import { updateProfileApi, changePasswordApi } from "../auth/authApi";
import type { ProfileUpdateRequest } from "../types/auth";

export const ProfilePage: FC = () => {
  const { user, logout, setUser } = useAuth();
  const [name, setName] = useState(user?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setProfileLoading(true);
    try {
      const body: ProfileUpdateRequest = {};
      if (name !== user?.display_name) body.display_name = name;
      if (email !== user?.email) body.email = email;
      if (Object.keys(body).length > 0) {
        const updated = await updateProfileApi(body);
        setUser(updated);
      }
      setProfileMsg("Profile updated");
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePasswordApi({ current_password: currentPassword, new_password: newPassword });
      setPasswordMsg("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.hash = "#login";
  };

  if (!user) return null;

  return (
    <div className="studio-content">
      <div className="content-header">
        <div className="content-header-title">
          <div className="content-header-label">ACCOUNT</div>
          <h1 className="content-header-name">Profile & Settings</h1>
        </div>
        <div className="header-actions">
          <button className="btn-danger" onClick={handleLogout} disabled={loggingOut}>
            <IconLogout size={16} strokeWidth={2} />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>

      <div className="content-body">
      <div className="profile-layout">
        <div className="section">
          <div className="section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconUser size={20} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
              <h3>Account Information</h3>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="profile-form">
            {profileError && <div className="msg error">{profileError}</div>}
            {profileMsg && <div className="msg success">{profileMsg}</div>}
            <div className="form-group">
              <label htmlFor="profile-name">Display name</label>
              <input id="profile-name" type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={profileLoading}>
                {profileLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="section">
          <div className="section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconLock size={20} strokeWidth={2} style={{ color: "var(--color-primary)" }} />
              <h3>Change Password</h3>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="profile-form">
            {passwordError && <div className="msg error">{passwordError}</div>}
            {passwordMsg && <div className="msg success">{passwordMsg}</div>}
            <div className="form-group">
              <label htmlFor="current-pw">Current password</label>
              <input
                id="current-pw"
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-pw">New password</label>
              <input
                id="new-pw"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <input
                id="confirm-pw"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? "Changing…" : "Change password"}
              </button>
            </div>
          </form>
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Account Details</h3>
          </div>
          <table className="meta-table">
            <tbody>
              <tr><td>User ID</td><td>{user.id}</td></tr>
              <tr><td>Email</td><td>{user.email}</td></tr>
              <tr><td>Display name</td><td>{user.display_name || "—"}</td></tr>
              <tr><td>Active</td><td>{user.is_active ? "Yes" : "No"}</td></tr>
              <tr><td>Created</td><td>{new Date(user.created_at).toLocaleDateString()}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
