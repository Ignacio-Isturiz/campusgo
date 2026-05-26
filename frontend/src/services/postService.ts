const DEFAULT_API_URL =
  'http://localhost:5000';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  DEFAULT_API_URL;

async function request(
  path: string,
  method = 'GET',
  token?: string,
  body?: any
) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      method,

      headers: {
        'Content-Type': 'application/json',

        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },

      ...(body && {
        body: JSON.stringify(body),
      }),
    }
  );

  // DEBUG
  const text = await response.text();

  console.log(
    'RESPONSE:',
    text
  );

  // evitar crash si backend devuelve html
  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Respuesta inválida del servidor: ${text}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || 'Error'
    );
  }

  return data;
}

export function getFeed(token: string) {
  return request(
    '/api/posts',
    'GET',
    token
  );
}

export function getMarketplace(token: string) {
  return request(
    '/api/posts/marketplace',
    'GET',
    token
  );
}

export function createPost(
  data: any,
  token: string
) {
  return request(
    '/api/posts',
    'POST',
    token,
    data
  );
}

export function toggleLike(
  postId: string,
  token: string
) {
  return request(
    `/api/posts/${postId}/like`,
    'POST',
    token
  );
}

export function deletePost(
  postId: string,
  token: string
) {
  return request(
    `/api/posts/${postId}`,
    'DELETE',
    token
  );
}