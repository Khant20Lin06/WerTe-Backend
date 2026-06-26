/**
 * ABAC is implemented at the service layer, not the guard layer.
 *
 * All resource-level authorization (ownership, tenant scope, state-driven
 * permissions) is enforced inside service methods after loading the resource
 * from the database. This is intentional: a guard fires before the resource
 * is loaded, so it cannot perform the ID-level ownership checks that
 * hasOwnedResourceAccess() requires.
 *
 * The authorization stack works in three layers:
 *
 *   1. JwtAuthGuard  — every request must carry a valid session token
 *   2. RolesGuard    — controller/handler declares which roles are allowed
 *   3. Policy helpers — services call canXxx() / requireXxx() after loading
 *                       the resource, throwing 403 when the check fails
 *
 * See:
 *   src/common/policies/tenant-access-policy.helper.ts  (core ownership check)
 *   src/modules/orders/policies/order-policy.service.ts (example: 13 policy methods)
 *   src/modules/payments/policies/finance-access-policy.helper.ts
 *   src/modules/messaging/policies/message-access-policy.helper.ts
 *   (and 28 other policy files across feature modules)
 *
 * A declarative @Policies() decorator guard would require a second DB round-trip
 * to load the resource before the service loads it anyway. Prefer service-layer
 * checks for zero overhead and correct ownership semantics.
 */
export {};
