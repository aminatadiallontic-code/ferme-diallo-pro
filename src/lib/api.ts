export type PaginatedResponse<T> = {

  data: T[];

  current_page: number;

  last_page: number;

  per_page: number;

  total: number;

};



function getAuthToken(): string | null {

  return localStorage.getItem('ferme_diallo_api_token');

}



async function request<T>(path: string, init?: RequestInit): Promise<T> {

  const token = getAuthToken();

  const res = await fetch(path, {

    headers: {

      Accept: "application/json",

      "Content-Type": "application/json",

      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      ...(init?.headers || {}),

    },

    ...init,

  });



  if (!res.ok) {

    const text = await res.text();

    throw new Error(text || `HTTP ${res.status}`);

  }



  if (res.status === 204) {

    return undefined as T;

  }



  const text = await res.text();

  if (!text) {

    return undefined as T;

  }



  return JSON.parse(text) as T;

}



export const api = {

  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: (path: string) => request<unknown>(path, { method: "DELETE" }),

};

