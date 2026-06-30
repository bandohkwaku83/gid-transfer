"use client";

import { useEffect, useState } from "react";
import { isPhotographerSignedIn } from "@/lib/marketing/auth-links";

export function usePhotographerSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(isPhotographerSignedIn());
  }, []);

  return signedIn;
}
