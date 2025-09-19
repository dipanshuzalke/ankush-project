"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/signup"); // redirect to /signup
  }, [router]);

  return null; // nothing is rendered on this page
}
