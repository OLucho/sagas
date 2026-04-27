import type { UserList } from "@/lib/types";

const MOCK_DELAY_MS = 600;

export const mockUserLists: UserList[] = [
  {
    id: "list-1",
    name: "Cartas en venta",
    isPublic: true,
    userId: "user-1",
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
    cardCount: 42,
  },
  {
    id: "list-2",
    name: "Colección personal",
    isPublic: false,
    userId: "user-1",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-02-05T11:20:00Z",
    cardCount: 128,
  },
  {
    id: "list-3",
    name: "Duplicates",
    isPublic: false,
    userId: "user-1",
    createdAt: "2024-04-01T09:00:00Z",
    updatedAt: "2024-04-01T09:00:00Z",
    cardCount: 7,
  },
];

export function mockFetchUserLists(): Promise<UserList[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUserLists), MOCK_DELAY_MS);
  });
}

export function mockFetchUserListsEmpty(): Promise<UserList[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([]), MOCK_DELAY_MS);
  });
}

export function mockFetchUserListsError(): Promise<UserList[]> {
  return new Promise((_resolve, reject) => {
    setTimeout(
      () => reject(new Error("No se pudieron cargar las listas")),
      MOCK_DELAY_MS
    );
  });
}
