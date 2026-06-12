"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "~/hooks/api/auth/index";
import { useWindowManager } from "~/components/windows-context";

export function RegisterForm() {
  const router = useRouter();
  const { closeWindow } = useWindowManager();
  const { createUserWithEmailAndPassword, isError, error, isPending } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    createUserWithEmailAndPassword(
      { fullName, email, password },
      {
        onSuccess: () => {
          closeWindow("signup");
          router.push("/");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="field-row-stacked">
        <label htmlFor="reg-name">Full Name</label>
        <input
          id="reg-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <input
          id="reg-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 text-xs">
          {error?.message ?? "Registration failed"}
        </div>
      )}

      <div className="field-row justify-end gap-2 mt-2">
        <button type="button" onClick={() => router.push("/login")}>
          Back to Login
        </button>
        <button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Register"}
        </button>
      </div>
    </form>
  );
}
