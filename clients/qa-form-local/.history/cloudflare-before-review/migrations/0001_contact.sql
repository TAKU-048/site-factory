CREATE TABLE inquiries (id TEXT PRIMARY KEY,request_id TEXT NOT NULL UNIQUE,payload_hash TEXT NOT NULL,fields TEXT NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE outbox (id TEXT PRIMARY KEY REFERENCES inquiries(id),payload TEXT NOT NULL,idempotency_key TEXT NOT NULL UNIQUE,state TEXT NOT NULL DEFAULT 'pending',created_at INTEGER NOT NULL,first_attempt INTEGER,attempts INTEGER NOT NULL DEFAULT 0,next_at INTEGER NOT NULL,lease TEXT,lease_until INTEGER NOT NULL DEFAULT 0,provider_id TEXT,updated_at INTEGER NOT NULL);
CREATE INDEX outbox_due ON outbox(state,next_at);
