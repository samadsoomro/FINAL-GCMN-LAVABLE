type RequestConfig = {
  headers?: Record<string, string>;
};

async function request(
  method: string,
  url: string,
  body: any,
  config?: RequestConfig,
) {
  const headers: Record<string, string> = { ...config?.headers };

  let bodyToSend = body;

  // If it's NOT FormData, assume JSON and stringify it
  if (!(body instanceof FormData)) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    bodyToSend = JSON.stringify(body);
  } else {
    // If it IS FormData, remove Content-Type so browser sets boundary
    // even if the caller tried to set it to 'multipart/form-data'
    if (headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: bodyToSend,
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { error: res.statusText };
    }
    const error: any = new Error(errorData.error || res.statusText);
    error.response = { data: errorData, status: res.status };
    throw error;
  }

  const data = await res.json().catch(() => ({}));
  return { data };
}

export const api = {
  get: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { error: res.statusText };
      }
      const error: any = new Error(errorData.error || res.statusText);
      error.response = { data: errorData, status: res.status };
      throw error;
    }
    const data = await res.json().catch(() => ({}));
    return { data };
  },
  post: (url: string, body: any, config?: RequestConfig) =>
    request("POST", url, body, config),
  put: (url: string, body: any, config?: RequestConfig) =>
    request("PUT", url, body, config),
  patch: (url: string, body: any, config?: RequestConfig) =>
    request("PATCH", url, body, config),
  delete: async (url: string) => {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { error: res.statusText };
      }
      const error: any = new Error(errorData.error || res.statusText);
      error.response = { data: errorData, status: res.status };
      throw error;
    }
    const data = await res.json().catch(() => ({}));
    return { data };
  },
};
