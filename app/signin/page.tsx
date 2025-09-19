"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // store a fake token
    try {
      localStorage.setItem("fs_token", "dummy-token");
      const user = { name: email ? email.split('@')[0] : 'Admin', email };
      localStorage.setItem("fs_user", JSON.stringify(user));
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white">
      <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl mb-4">Sign In</h2>
        <label className="block mb-2 text-sm">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-3 bg-[#0b0b0b] rounded" />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 bg-[#0b0b0b] rounded" />
        <button className="bg-red-600 px-4 py-2 rounded w-full">Sign In</button>
      </form>
    </div>
  );
}
