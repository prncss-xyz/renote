import { getUUID } from "@/utils/uuid";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

export function useCreateNote() {
  const router = useRouter();
  return useCallback(() => {
    router.navigate({
      to: "/notes/create/$id",
      params: { id: getUUID() },
      search: (x: any) => x,
    });
  }, [router]);
}
