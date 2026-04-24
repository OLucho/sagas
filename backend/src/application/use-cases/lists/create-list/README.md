CreateList use‑case

Provides a mechanism to create a new card list for an authenticated user.

DTOs
- **CreateListRequest** – input
- **CreateListResponse** – output

Repository contract
- **IListRepository** – one method: createList

Business flow
1. Validate name not empty.
2. Delegate persistence to the repository.
3. Return created list data.
