---
title: SentinelBank
tagline: Moving money correctly when networks fail, messages repeat and services crash.
summary: A banking microservices platform — 9 Spring Boot services, Kafka, PostgreSQL, MongoDB and an Angular front end — built around idempotency, a transactional outbox and saga-based compensation.
order: 1
category: Microservices
status: Feature complete
repo: https://github.com/Nayeemshaik29/SentinelBank
stack: [Java 25, Spring Boot 4, Apache Kafka, PostgreSQL, MongoDB, Angular, Spring AI, Docker Compose, Resilience4j]
highlights:
  - Idempotency keys so a double-clicked "Send" moves money exactly once.
  - Transactional outbox — the balance change and the event are written in the same DB transaction.
  - Transfer saga with automatic compensation when the partner bank rejects or times out.
  - Optimistic locking (@Version) on balances so concurrent updates never overwrite each other.
  - Retry topics and a dead-letter topic so a poison message never blocks the queue.
  - Guardrailed AI assistant — read-only tools, PII masking and a local LLM via Ollama.
flow:
  - { label: "API Gateway", note: "Validates the JWT, rate-limits and attaches a correlation ID." }
  - { label: "Transaction Service", note: "Checks the Idempotency-Key and creates the transfer as PENDING." }
  - { label: "Account Service", note: "Debits the account idempotently, protected by optimistic locking." }
  - { label: "Outbox → Kafka", note: "transfer.initiated is published from the outbox, keyed by accountId for ordering." }
  - { label: "Partner Bank / Fraud / Audit", note: "Consume the event in parallel — credit, score risk, append to the audit trail." }
  - { label: "Saga completes or compensates", note: "COMPLETED on success, otherwise COMPENSATING → REVERSED with a refund." }
---

## The problem

Most demo banking apps show *features*. SentinelBank is about *correctness*: what actually happens to a customer's money when a client retries, a service crashes between writing to the database and publishing an event, or Kafka delivers the same message twice.

| Real-world failure | What SentinelBank does |
|---|---|
| User double-clicks "Send" or the client retries | **Idempotency keys** — the second request returns the first result |
| Service crashes between "save" and "publish" | **Transactional outbox** — the event is saved in the same DB transaction |
| Kafka delivers a message twice | **Idempotent consumers** — processed event IDs are skipped |
| Two requests change the same balance | **Optimistic locking** — the loser retries instead of overwriting |
| Partner bank rejects after we debited | **Saga with compensation** — the debit is reversed |
| A message keeps failing | **Retry topics, then a DLT** — never blocks the queue |

## Architecture

Nine Spring Boot services sit behind a single API Gateway: Auth, Account, Transaction, Partner Bank (mock), Fraud, Notification, Audit and an AI Agent. Services that need an immediate answer talk over REST (Transaction asks Account to debit); everything that can happen afterwards flows through Kafka.

Each stateful service owns its own schema — services can't reach into each other's tables, so the contracts are APIs and events. Fraud and Audit use MongoDB; the rest use PostgreSQL.

## The transfer state machine

```text
PENDING ──debit ok──▶ DEBITED ──partner ok──▶ COMPLETED
   │                     │
   └─debit rejected─▶ FAILED   └─partner failed─▶ COMPENSATING ──refund──▶ REVERSED
```

Every transition is persisted, so a crash at any point can be resumed instead of guessed at.

## Design decisions

- **Saga instead of two-phase commit.** Distributed transactions don't survive real networks. Each step has an explicit undo.
- **Key Kafka messages by `accountId`.** Events for one account stay ordered while different accounts process in parallel.
- **Fraud flags, it doesn't block.** Rules run asynchronously on the consumed event, so a slow rule never slows a transfer.
- **Append-only audit.** No update or delete endpoints — a tamper-evident trail for every transfer.
