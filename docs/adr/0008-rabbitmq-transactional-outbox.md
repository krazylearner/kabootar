# RabbitMQ with a transactional outbox

**Status:** accepted

Domain changes write to an `outbox` table in the same transaction and a relay publishes
to RabbitMQ; adapters consume from their own queues. Direct adapter calls and DB polling
were rejected because they couple availability and lose events; a broker plus outbox
gives at-least-once delivery and a clean path to split services.

**Consequences:** the deployment gains a broker to operate; every consumer must be
idempotent on `event_id`; a dead-letter queue is required. Ordering is per room, not
global.
