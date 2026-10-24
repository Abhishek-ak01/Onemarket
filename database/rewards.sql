INSERT INTO reward_transactions (id, user_id, order_id, amount, type, description) VALUES
(1, 'user-cust-1', 'LL-2026-1042', 8, 'EARNED', 'Earned from completed order #LL-2026-1042 (₹860 spend)'),
(2, 'user-cust-1', NULL, 37, 'EARNED', 'OneMarket Local Loyalty Welcome Bonus'),
(3, 'user-cust-1', 'LL-LIVE-1792817549008', -5, 'REDEEMED', 'Redeemed 5 OneMarket tokens on Order #LL-LIVE-1792817549008'),
(4, 'user-cust-1', 'LL-LIVE-1792817549008', 5, 'REFUND', 'Refund of 5 tokens redeemed on cancelled Order #LL-LIVE-1792817549008'),
(5, 'user-sell-1', 'LL-2026-4808', 20, 'EARNED', 'Earned 20 OneMarket tokens for order #LL-2026-4808')
ON CONFLICT (id) DO NOTHING;