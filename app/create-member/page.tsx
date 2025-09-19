"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "fs_members_v1";
const TOKEN_KEY = "fs_token";

export default function CreateMember() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      try {
        localStorage.removeItem("fs_user");
      } catch (err) {
        console.error(err);
      }
      router.push("/signin");
      return;
    }
    try {
      const rawUser = localStorage.getItem("fs_user");
      if (rawUser) setCurrentUser(JSON.parse(rawUser));
    } catch (err) {
      console.error(err);
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const nextId = list.length ? Math.max(...list.map((r: any) => r.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        name: email.split("@")[0] || "New User",
        email,
        status: "incomplete",
        completed: 0,
        created: new Date().toDateString(),
        role,
      };
      const updated = [newUser, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  }

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("fs_user");
    } catch (err) {
      console.error(err);
    }
    router.push("/signin");
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#e9e9e9]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[220px] bg-[#0f0f0f] border-r border-[#222] min-h-screen p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center rounded">
              <span className="font-bold">TF</span>
            </div>
            <div>
              <div className="font-bold">THE FIT SAPIENS</div>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-3 px-3 py-2 rounded bg-[#2a2a2a]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" fill="#fff" />
              </svg>
              <span>Dashboard</span>
            </button>
            <button onClick={() => router.push('/create-member')} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#1a1a1a]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" fill="#fff" />
              </svg>
              <span>Create Member</span>
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#1a1a1a]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22a10 10 0 0120 0H2z" fill="#fff" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 p-6">
          {/* Top navbar above main content */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-[#0b0b0b] border-b border-[#222] px-4 py-3 rounded-t">
              <div />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2b2b2b] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#fff]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22a10 10 0 0120 0H2z" fill="#fff" />
                  </svg>
                </div>
                <div className="text-sm font-medium">{currentUser?.name ?? "Admin"}</div>
              </div>
            </div>
          </div>

          {/* Create form card */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded p-8 max-w-3xl">
            <h2 className="text-2xl mb-2">Create Member/Admin</h2>
            <p className="text-sm text-[#9a9a9a] mb-6">Create member with same email and password that he provide in wordpress</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
              <label className="col-span-12 sm:col-span-3 self-center">Email</label>
              <input className="col-span-12 sm:col-span-9 bg-[#0b0b0b] p-3 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />

              <label className="col-span-12 sm:col-span-3 self-center">Password</label>
              <input className="col-span-12 sm:col-span-9 bg-[#0b0b0b] p-3 rounded" value={password} onChange={(e) => setPassword(e.target.value)} />

              <label className="col-span-12 sm:col-span-3 self-center">Role</label>
              <select className="col-span-12 sm:col-span-9 bg-[#0b0b0b] p-3 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Member</option>
                <option>Admin</option>
              </select>

              <div className="col-span-12 flex justify-end mt-4">
                <button type="submit" className="bg-red-600 px-5 py-2 rounded">Create Member</button>
              </div>
            </form>
          </div>
        </div>
        {/* Logout confirmation modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#111] rounded p-6 w-[520px] text-center relative">
              <button onClick={() => setShowLogoutModal(false)} className="absolute right-3 top-3 text-[#999]">✕</button>
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-200 mx-auto flex items-center justify-center">⚠️</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign out</h3>
              <p className="text-sm text-[#9a9a9a] mb-6">Are you sure you would like to sign out of your Fit Sapiens account?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => { logout(); }} className="bg-red-600 px-4 py-2 rounded">Sign out</button>
                <button onClick={() => setShowLogoutModal(false)} className="border border-[#333] px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
