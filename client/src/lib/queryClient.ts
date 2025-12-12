import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

async function getFirebaseToken(): Promise<string | null> {
  // If currentUser exists, get token immediately
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken(true); // force refresh
    } catch (error) {
      console.error("Failed to get Firebase ID token:", error);
      return null;
    }
  }
  
  // Wait for auth state to be ready (handles race condition)
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken(true);
          resolve(token);
        } catch (error) {
          console.error("Failed to get Firebase ID token:", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
    
    // Timeout after 5 seconds to prevent hanging
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);
  });
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  const token = await getFirebaseToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    const token = await getFirebaseToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Build URL properly - if first element is full path, use it; otherwise join
    const url = queryKey.length === 1 
      ? (queryKey[0] as string)
      : queryKey.join("/");
    
    console.log("[Query] Fetching:", url, "Token:", token ? "present" : "missing");
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    console.log("[Query] Response:", url, res.status);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
