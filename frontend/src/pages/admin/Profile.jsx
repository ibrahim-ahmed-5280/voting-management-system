import { useEffect, useState } from "react";
import { FaEdit, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../api/client";
import { formatDate } from "../../utils/formatters";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const load = async () => {
    const { data } = await api.get("/api/admin/profile");
    setProfile(data);
    setForm((f) => ({ ...f, name: data.name || "", email: data.email || "" }));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview]
  );

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : "";
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!isEditing || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email
      };

      const nextPassword = form.newPassword.trim();
      if (nextPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = nextPassword;
      }

      await api.put("/api/admin/profile", payload);
      if (image) {
        const fd = new FormData();
        fd.append("image", image);
        await api.post("/api/admin/profile/image", fd);
      }
      toast.success("Profile updated");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setImage(null);
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setIsEditing(false);
      await load();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Update failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="page-wrap">Loading profile...</div>;

  const avatar = imagePreview || profile.profileImage || "https://via.placeholder.com/120";

  return (
    <div className="page-wrap grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="glass rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">Admin Profile</h1>
          <button
            type="button"
            className="btn border border-slate-300 dark:border-slate-600"
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
          >
            <FaEdit />
            {isEditing ? "Editing" : "Edit"}
          </button>
        </div>

        <form onSubmit={save} className="grid gap-3">
          <div className="mb-1 flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt="Profile"
                className="h-24 w-24 rounded-full border border-black/10 object-cover"
              />
              <label
                htmlFor="profile-image-input"
                className={`absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-white shadow ${
                  isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
                title="Edit image"
              >
                <FaEdit className="text-sm" />
              </label>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!isEditing}
                onChange={onImageChange}
              />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-300">
              <p className="font-semibold text-brand-primary dark:text-brand-secondary">{form.name || "Admin User"}</p>
              <p>{form.email || "-"}</p>
              <p className="mt-1 text-xs">
                {isEditing ? "You can now update details and click Save Changes." : "Click Edit at the top to unlock this form."}
              </p>
            </div>
          </div>
          <div>
            <label className="field-label">Full Name</label>
            <input className="input disabled:cursor-not-allowed disabled:opacity-60" disabled={!isEditing} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="input disabled:cursor-not-allowed disabled:opacity-60" disabled={!isEditing} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <h2 className="mt-2 font-semibold">Change Password</h2>
          <div>
            <label className="field-label">Current Password</label>
            <div className="relative">
              <input
                className="input pr-10 disabled:cursor-not-allowed disabled:opacity-60"
                type={showCurrentPassword ? "text" : "password"}
                disabled={!isEditing}
                placeholder="Current password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
              <button
                type="button"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                disabled={!isEditing}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label">New Password</label>
            <div className="relative">
              <input
                className="input pr-10 disabled:cursor-not-allowed disabled:opacity-60"
                type={showNewPassword ? "text" : "password"}
                disabled={!isEditing}
                placeholder="New password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowNewPassword((prev) => !prev)}
                disabled={!isEditing}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!isEditing || saving}
            >
              <FaSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="glass rounded-xl p-5">
        <h2 className="text-lg font-bold">Activity Summary</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Last login: {formatDate(profile.lastLogin)}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Active session enforced: <strong>Yes</strong>
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Account created: {formatDate(profile.createdAt)}
        </p>
      </section>
    </div>
  );
}

