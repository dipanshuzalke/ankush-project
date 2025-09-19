"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Member = {
  id: number;
  name: string;
  email: string;
  status: string;
  completed: number;
  created: string;
  role?: string;
};

const initialDummy = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: i % 3 === 0 ? "Uncomplete" : "Vivek",
  email: i % 3 === 0 ? `user${i + 1}@gmail.com` : `user${i + 1}@example.com`,
  status: i % 5 === 0 ? "download" : i % 4 === 0 ? "pending" : "incomplete",
  completed: i % 4 === 0 ? 18 : 0,
  created: ["Feb 17, 2025", "Apr 11, 2025", "Mar 28, 2025", "Sep 19, 2025"][
    i % 4
  ],
}));

const STORAGE_KEY = "fs_members_v1";
const TOKEN_KEY = "fs_token";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email?: string;
  } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    // auth check: remove stored user if no token and redirect
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

    // load current user
    try {
      const rawUser = localStorage.getItem("fs_user");
      if (rawUser) setCurrentUser(JSON.parse(rawUser));
      else setCurrentUser(null);
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
    }

    // initialize members in localStorage if missing
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || !raw.trim()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDummy));
        setMembers(initialDummy);
        setAllMembers(initialDummy);
      } else {
        try {
          const parsed = JSON.parse(raw) as Member[];
          if (Array.isArray(parsed)) {
            setMembers(parsed);
            setAllMembers(parsed);
          } else {
            // unexpected shape, reset
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDummy));
            setMembers(initialDummy);
            setAllMembers(initialDummy);
          }
        } catch (err) {
          console.error(
            "Failed to parse members storage, resetting to initialDummy",
            err
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDummy));
          setMembers(initialDummy);
          setAllMembers(initialDummy);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [router]);

  function persist(list: Member[]) {
    setMembers(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }
    setAllMembers(list);
  }

  function deleteMember(id: number) {
    const updated = members.filter((m) => m.id !== id);
    persist(updated);
  }

  function applyFilter() {
    // filter from allMembers so filters compose properly with reset
    let list = allMembers.slice();
    if (filterStatus) {
      const s = filterStatus.toLowerCase();
      list = list.filter((m) => (m.status || "").toLowerCase() === s);
    }
    setMembers(list);
    setFilterOpen(false);
  }

  function resetFilter() {
    setFilterStatus("");
    setMembers(allMembers.slice());
    setFilterOpen(false);
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
            <button
              onClick={() => router.push("/dashboard")}
              className={`flex items-center gap-3 px-3 py-2 rounded 
      ${
        pathname?.startsWith("/dashboard")
          ? "bg-[#e11d48] text-white" // active → red
          : "bg-[#2a2a2a] text-white" // inactive → black
      }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z"
                  fill="#fff"
                />
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => router.push("/create-member")}
              className={`flex items-center gap-3 px-3 py-2 rounded 
      ${
        pathname?.startsWith("/create-member")
          ? "bg-[#e11d48] text-white"
          : "bg-[#2a2a2a] text-white"
      }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"
                  fill="#fff"
                />
              </svg>
              <span>Create Member</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-3 py-2 rounded bg-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22a10 10 0 0120 0H2z"
                  fill="#fff"
                />
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
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2b2b2b] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#fff]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22a10 10 0 0120 0H2z"
                      fill="#fff"
                    />
                  </svg>
                </div>
                <div className="text-sm font-medium">
                  {currentUser?.name ?? "Admin"}
                </div>
              </div>
            </div>
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-[#111] px-3 py-2 flex items-center gap-3 border border-[#2a2a2a]">
                <svg
                  className="w-4 h-4 text-[#8b8b8b]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#9aa0a6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    stroke="#9aa0a6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  className="bg-transparent outline-none text-sm w-60"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((s) => !s)}
                  className="bg-[#1f1f1f] px-3 py-2 rounded flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 5h18M6 12h12M10 19h4"
                      stroke="#ddd"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm">Filter</span>
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0d0d0d] border border-[#222] rounded p-3 z-20">
                    <label className="text-xs text-[#9a9a9a]">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-2 mb-3 bg-[#0b0b0b] rounded text-sm"
                    >
                      <option value="">Any</option>
                      <option value="incomplete">INCOMPLETE</option>
                      <option value="pending">PENDING</option>
                      <option value="download">DOWNLOAD</option>
                      <option value="submit">SUBMIT</option>
                    </select>
                    <div className="flex justify-between">
                      <button
                        onClick={resetFilter}
                        type="button"
                        className="px-3 py-1 border border-[#333] rounded"
                      >
                        Reset
                      </button>
                      <button
                        onClick={applyFilter}
                        type="button"
                        className="bg-[#e11d48] text-white px-3 py-1 rounded"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/create-member")}
                  className="bg-[#e11d48] text-white px-3 py-2 rounded"
                >
                  + Add Member
                </button>
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9a9a9a] border-b border-[#222]">
                    <th className="py-3 w-10">No.</th>
                    <th className="py-3">Picture</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Completed Fields</th>
                    <th className="py-3">Created</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-[#161616] hover:bg-[#080808]"
                    >
                      <td className="py-4">{m.id}</td>
                      <td className="py-4">
                        <div className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-[#9a9a9a]"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22a10 10 0 0120 0H2z"
                              fill="#9a9a9a"
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[#9a9a9a] text-xs">{m.email}</div>
                      </td>
                      <td className="py-4">
                        {m.status === "incomplete" && (
                          <span className="bg-[#ef4444] text-white px-3 py-1 rounded-full text-xs">
                            Complete Profile
                          </span>
                        )}
                        {m.status === "pending" && (
                          <span className="bg-[#b45309] text-white px-3 py-1 rounded-full text-xs">
                            Pending
                          </span>
                        )}
                        {m.status === "download" && (
                          <span className="bg-[#047857] text-white px-3 py-1 rounded-full text-xs">
                            Download PDF
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="text-xs">{m.completed}/18</div>
                        <div className="w-28 h-2 bg-[#2b2b2b] rounded mt-1">
                          <div
                            className="h-2 bg-[#ef4444] rounded"
                            style={{ width: `${(m.completed / 18) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 text-sm text-[#9a9a9a]">
                        {m.created}
                      </td>
                      <td className="py-4 text-[#9a9a9a] flex gap-3">
                        <button
                          aria-label="view"
                          className="p-1 rounded hover:bg-[#1a1a1a]"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 5c5 0 9 4 9 7s-4 7-9 7-9-4-9-7 4-7 9-7z"
                              stroke="#9aa0a6"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="2"
                              stroke="#9aa0a6"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteMember(m.id)}
                          aria-label="delete"
                          className="p-1 rounded hover:bg-[#1a1a1a] text-red-500"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6h18"
                              stroke="#ef4444"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6"
                              stroke="#ef4444"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11v6M14 11v6M9 6V4h6v2"
                              stroke="#ef4444"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111] rounded p-6 w-[520px] text-center relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute right-3 top-3 text-[#999]"
            >
              ✕
            </button>
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-200 mx-auto flex items-center justify-center">
                ⚠️
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign out</h3>
            <p className="text-sm text-[#9a9a9a] mb-6">
              Are you sure you would like to sign out of your Fit Sapiens
              account?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  logout();
                }}
                className="bg-red-600 px-4 py-2 rounded"
              >
                Sign out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="border border-[#333] px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Logout modal markup is controlled by showLogoutModal state inside the component
