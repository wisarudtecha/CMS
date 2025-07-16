// /src/utils/mapUsersWithRoles.ts
import rawUsers from "@/mocks/userList.json";
import rawRoles from "@/mocks/roleList.json";
import { UserEntity, Role } from "@/types/user";

// Cache roles in a Map for O(1) lookup
const rolesById = new Map<string, Role>(
  (rawRoles as Role[]).map((r) => [r.id, r])
);

/**
 * Returns the user list with the full Role object attached to each user.
 * Falls back to the “Viewer” role (id 6) if the roleId is missing or unknown.
 */
export function mapUsersWithRoles(): UserEntity[] {
  const fallbackRole = rolesById.get("6")!; // Viewer
  return (rawUsers as Omit<UserEntity, "role">[]).map((u) => ({
    ...u,
    role: rolesById.get((u).roleId as string) ?? fallbackRole,
  })) as UserEntity[];
}
