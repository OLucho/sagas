import type { User, UserList, ListCard, CollectionCard, UserCardVariants, CardVariant } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  whatsapp?: string,
  instagram?: string
): Promise<{ userId: string; username: string }> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      username,
      whatsapp,
      instagram,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al crear cuenta' }));
    throw new Error(error.message || 'Error al crear cuenta');
  }
  
  return response.json();
}

export async function signIn(
  email: string,
  password: string
): Promise<{ token: string; userId: string; username: string }> {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Credenciales inválidas' }));
    throw new Error(error.message || 'Credenciales inválidas');
  }
  
  return response.json();
}

export async function fetchCurrentUser(token: string | null): Promise<User | null> {
  const response = await fetch(`${API_BASE}/users/me`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Error al obtener perfil');
  }

  return response.json();
}

export async function updateProfile(
  data: { username?: string; whatsapp?: string; instagram?: string },
  token: string | null
): Promise<User> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al actualizar perfil' }));
    throw new Error(error.message || 'Error al actualizar perfil');
  }

  return response.json();
}

export async function fetchUserLists(token: string | null): Promise<UserList[]> {
  const response = await fetch(`${API_BASE}/lists`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener listas');
  }
  
  return response.json();
}

export async function fetchList(listId: string, token: string | null): Promise<UserList | null> {
  const response = await fetch(`${API_BASE}/lists/${listId}`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

export async function createList(
  name: string,
  isPublic: boolean,
  token: string | null
): Promise<UserList> {
  const response = await fetch(`${API_BASE}/lists`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name, isPublic }),
  });
  
  if (!response.ok) {
    throw new Error('Error al crear lista');
  }
  
  return response.json();
}

export async function updateList(
  listId: string,
  updates: Partial<Pick<UserList, "name" | "isPublic">>,
  token: string | null
): Promise<UserList> {
  const response = await fetch(`${API_BASE}/lists/${listId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar lista');
  }
  
  return response.json();
}

export async function deleteList(listId: string, token: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/lists/${listId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar lista');
  }
}

export async function fetchListCards(listId: string, token: string | null): Promise<ListCard[]> {
  const response = await fetch(`${API_BASE}/lists/${listId}/cards`, {
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener cartas');
  }
  
  return response.json();
}

export async function addCardToList(
  listId: string,
  cardId: string,
  variants: UserCardVariants,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE}/lists/${listId}/cards`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ cardId, variants }),
  });
  
  if (!response.ok) {
    throw new Error('Error al agregar carta');
  }
}

export async function updateCardInList(
  listId: string,
  cardId: string,
  variants: UserCardVariants,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE}/lists/${listId}/cards/${cardId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ variants }),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar carta');
  }
}

export async function removeCardFromList(
  listId: string,
  cardId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE}/lists/${listId}/cards/${cardId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar carta');
  }
}

export async function fetchUserCollection(
  setId: string,
  token: string | null
): Promise<Record<string, CollectionCard>> {
  // Kept for backward compat but deprecated
  return {};
}

export async function fetchAllUserCollections(
  token: string | null
): Promise<Array<{ id: string; cardId: string; setId: string; variants: Record<string, number>; needed: boolean }>> {
  const response = await fetch(`${API_BASE}/collections`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('No pudimos cargar tu colección. Intenta de nuevo.');
  }

  return response.json();
}

export async function updateCardInCollection(
  setId: string,
  cardId: string,
  variants: UserCardVariants,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE}/collections/${setId}/cards/${cardId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ variants }),
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar colección');
  }
}

export async function markCardAsNeed(
  setId: string,
  cardId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE}/collections/${setId}/cards/${cardId}/need`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error('Error al marcar carta');
  }
}
