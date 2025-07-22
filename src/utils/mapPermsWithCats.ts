// /src/utils/mapPermsWithCats.ts
import rawAllPermissions from "@/mocks/allPermissions.json";
import rawPermissionCategories from "@/mocks/permissionCategories.json";
import { Permission, PermissionCategory } from "@/types/role";

// Cache permission categories in a Map for O(1) lookup

const permissionCategoriesById = new Map<string, PermissionCategory>(
  (rawPermissionCategories as PermissionCategory[]).map((pc) => [pc.id, pc])
);

// const permissionCategoriesById  = (rawPermissionCategories as PermissionCategory[]).map(c => c.id);

/**
 * Returns the permission list with the full category object attached to each permission.
 */
export function mapPermissionsWithCategories(): Permission[] {
  return (rawAllPermissions as Permission[]).map((p) => ({
    ...p,
    category: permissionCategoriesById.get(p.categoryId ?? ""),
  }));
}
