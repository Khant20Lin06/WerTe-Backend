"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
exports.matchesActorScopedResource = matchesActorScopedResource;
exports.hasOwnedResourceAccess = hasOwnedResourceAccess;
function hasRole(currentUser, expectedRole) {
    return currentUser.role === expectedRole;
}
function hasAnyRole(currentUser, expectedRoles) {
    return expectedRoles.includes(currentUser.role);
}
function matchesActorScopedResource(actorScopedResourceId, resourceId) {
    return actorScopedResourceId === undefined || actorScopedResourceId === resourceId;
}
function hasOwnedResourceAccess({ currentUser, expectedRole, ownerUserId, resourceId, actorScopedResourceId, }) {
    return (hasRole(currentUser, expectedRole) &&
        currentUser.userId === ownerUserId &&
        matchesActorScopedResource(actorScopedResourceId, resourceId));
}
//# sourceMappingURL=tenant-access-policy.helper.js.map