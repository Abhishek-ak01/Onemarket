INSERT INTO reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase) VALUES
(1, 'prod-101', 'user-cust-1', 'Aditi Rao', 5, 'Phenomenal aroma! The pods are large and bursting with seeds. Brewed with afternoon chai and the difference from supermarket cardamom is night and day.', TRUE),
(2, 'prod-201', 'user-cust-2', 'Rohan Mehra', 5, 'Powers my MacBook Pro and Pixel 8 simultaneously without heating up. Compact enough to carry in my jacket pocket.', TRUE),
(3, 'prod-301', 'user-cust-1', 'Aditi Rao', 5, 'The khadi weave is soft, authentic, and supremely breathable in Bengaluru weather. Stitching is immaculate.', TRUE),
(4, 'prod-401', 'user-cust-2', 'Rohan Mehra', 5, 'The deckle-edge handmade paper handles fountain pen inks with zero bleed or feathering. Truly archival quality.', TRUE),
(5, 'prod-501', 'user-cust-1', 'Aditi Rao', 5, 'Earthy terracotta planter with excellent drainage. Arrived carefully wrapped with not a single chip.', TRUE),
(6, 'prod-601', 'user-cust-2', 'Rohan Mehra', 5, 'Gentle on skin and does not strip moisture. Lasts a good 3-4 weeks of daily use. Highly recommended apothecary!', TRUE)
ON CONFLICT (id) DO NOTHING;