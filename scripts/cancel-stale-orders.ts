/**
 * One-time backfill: cancel orders that are stuck in PLACED / MERCHANT_ACCEPTED
 * without progressing beyond the timeout window.
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register scripts/cancel-stale-orders.ts
 *
 * Dry-run (no DB writes):
 *   DRY_RUN=true npx ts-node -r tsconfig-paths/register scripts/cancel-stale-orders.ts
 */

import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === 'true';

const MERCHANT_TIMEOUT_MINUTES = 30;
const RIDER_TIMEOUT_MINUTES = 30;

// Statuses considered "stuck" with no rider assigned
const STUCK_NO_RIDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.MERCHANT_ACCEPTED,
];

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('Finding stale orders...\n');

  const now = new Date();

  // ── 1. PLACED orders older than MERCHANT_TIMEOUT_MINUTES ─────────────────
  const merchantTimeoutCutoff = new Date(
    now.getTime() - MERCHANT_TIMEOUT_MINUTES * 60 * 1000,
  );
  const stalePlaced = await prisma.order.findMany({
    where: {
      status: OrderStatus.PLACED,
      placedAt: { lt: merchantTimeoutCutoff },
    },
    select: {
      id: true,
      orderCode: true,
      placedAt: true,
      status: true,
      customerProfile: { select: { user: { select: { id: true } } } },
    },
    orderBy: { placedAt: 'asc' },
  });

  // ── 2. MERCHANT_ACCEPTED orders older than RIDER_TIMEOUT_MINUTES with no rider ──
  const riderTimeoutCutoff = new Date(
    now.getTime() - RIDER_TIMEOUT_MINUTES * 60 * 1000,
  );
  const staleAccepted = await prisma.order.findMany({
    where: {
      status: OrderStatus.MERCHANT_ACCEPTED,
      delivery: null,
      // Use the status history entry for MERCHANT_ACCEPTED as the clock start.
      // Fallback: use placedAt if no history entry found (rare).
      statusHistory: {
        some: {
          toStatus: OrderStatus.MERCHANT_ACCEPTED,
          createdAt: { lt: riderTimeoutCutoff },
        },
      },
    },
    select: {
      id: true,
      orderCode: true,
      placedAt: true,
      status: true,
      customerProfile: { select: { user: { select: { id: true } } } },
    },
    orderBy: { placedAt: 'asc' },
  });

  console.log(`Stale PLACED (merchant_timeout):     ${stalePlaced.length}`);
  console.log(`Stale MERCHANT_ACCEPTED (rider_timeout): ${staleAccepted.length}`);
  console.log('');

  if (stalePlaced.length === 0 && staleAccepted.length === 0) {
    console.log('Nothing to cancel.');
    return;
  }

  const toCancel = [
    ...stalePlaced.map((o) => ({ ...o, reasonCode: 'merchant_timeout' as const })),
    ...staleAccepted.map((o) => ({ ...o, reasonCode: 'rider_timeout' as const })),
  ];

  for (const order of toCancel) {
    const ageMin = Math.round(
      (now.getTime() - order.placedAt.getTime()) / 60_000,
    );
    console.log(
      `[${order.reasonCode}] ${order.orderCode} (${order.id}) — ${ageMin} min old`,
    );

    if (DRY_RUN) continue;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              changedByUserId: 'system:cancel-stale-orders',
              reasonCode: order.reasonCode,
              note: 'Auto-cancelled by backfill script due to timeout.',
            },
          },
        },
      });

      const customerUserId = order.customerProfile?.user?.id;
      if (customerUserId !== undefined) {
        const body =
          order.reasonCode === 'merchant_timeout'
            ? `Order #${order.orderCode} was cancelled because the merchant did not respond in time.`
            : `Order #${order.orderCode} was cancelled because no rider could be assigned in time.`;

        await tx.notification.create({
          data: {
            userId: customerUserId,
            type: 'ORDER_STATUS_UPDATED',
            title: 'Order Cancelled Automatically',
            body,
            navigationPath: `/orders/${order.id}`,
            metadataJson: {
              orderCode: order.orderCode,
              reasonCode: order.reasonCode,
            },
            orderId: order.id,
          },
        });
      }
    });

    console.log(`  ✓ Cancelled`);
  }

  if (!DRY_RUN) {
    console.log(`\nDone. Cancelled ${toCancel.length} stale orders.`);
  } else {
    console.log(`\nDry run complete. Would cancel ${toCancel.length} orders.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
