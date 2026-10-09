---
title: "Moving money correctly when networks fail"
description: "Idempotency keys, a transactional outbox and a saga with compensation — how SentinelBank makes sure a transfer happens exactly once, even when everything around it goes wrong."
pubDate: 2026-10-08
tags: [microservices, kafka, spring-boot, system-design]
project: sentinelbank
---

When I started building **SentinelBank**, I set myself one rule: features don't matter if the money is wrong. A banking demo that can transfer ₹500 is easy. A system that transfers ₹500 *exactly once* — when the user double-clicks, when a service crashes halfway, when Kafka redelivers a message — is the actual engineering problem.

This post walks through the failure modes I designed for and the pattern I used for each.

## The happy path hides all the problems

Here's the naive version of a transfer in a microservices world:

1. Transaction Service receives `POST /transfers`.
2. It calls Account Service to debit the sender.
3. It publishes `transfer.initiated` to Kafka.
4. Partner Bank consumes it and credits the receiver.

Every arrow in that list is a network call, and every network call can fail, time out or be repeated. Let's take them one at a time.

## Failure 1: the user clicks "Send" twice

Mobile networks are flaky. A client times out, retries, and suddenly two identical transfer requests are in flight.

**Fix: idempotency keys.** The client generates a unique `Idempotency-Key` header per transfer. The server stores the key together with the result of the first request. A repeat request with the same key doesn't run again — it gets the original response back.

```java
@PostMapping("/transfers")
public ResponseEntity<TransferResponse> create(
        @RequestHeader("Idempotency-Key") String key,
        @Valid @RequestBody TransferRequest req) {
    return idempotencyStore.find(key)
        .map(ResponseEntity::ok)                       // retry → same answer
        .orElseGet(() -> ResponseEntity.status(201)
            .body(transferService.initiate(req, key)));
}
```

The important detail is that the key and the transfer are saved in the **same database transaction**. Otherwise you can crash between "money moved" and "key stored" and be back to double-spending.

## Failure 2: the service crashes between "save" and "publish"

This one is subtle. Transaction Service debits the account, updates its own row to `DEBITED`, and then publishes an event. If the process dies after the commit but before the publish, the downstream services never hear about the transfer. The customer's money is gone and nothing happens.

Publishing *first* is worse: you might announce a transfer that then rolls back.

**Fix: the transactional outbox.** Instead of talking to Kafka inside the business transaction, I write the event into an `outbox` table in the **same** transaction as the state change:

```java
@Transactional
public Transfer markDebited(Transfer t) {
    t.setStatus(DEBITED);
    transfers.save(t);
    outbox.save(OutboxEvent.of("transfer.initiated", t.getAccountId(), t));
    return t;   // both rows commit together, or neither does
}
```

A separate publisher reads unpublished outbox rows and sends them to Kafka, marking them as sent afterwards. If it crashes, it simply picks up where it left off. The event can never be lost, and it can never be invented for a change that didn't commit.

The trade-off: the outbox gives **at-least-once** delivery. A row can be published, and then the publisher crashes before marking it sent — so it gets published again. Which brings us to the next failure.

## Failure 3: Kafka delivers the same event twice

At-least-once means consumers *will* see duplicates eventually. If the Partner Bank credits the receiver twice, we've invented money.

**Fix: idempotent consumers.** Every event carries a unique event ID. Each consumer records the IDs it has processed and skips any it has already seen:

```java
@KafkaListener(topics = "transfer.initiated")
@Transactional
public void on(TransferInitiated e) {
    if (processed.existsById(e.eventId())) return;   // duplicate → ignore
    partnerBank.credit(e);
    processed.save(new ProcessedEvent(e.eventId()));
}
```

Again, the "mark as processed" write lives in the same transaction as the business effect. Kafka gives at-least-once delivery; the consumer turns it into an **exactly-once effect**.

## Failure 4: two requests update the same balance

Two transfers from the same account arrive at the same moment. Both read a balance of ₹1,000, both subtract ₹700, both write ₹300. The customer just spent ₹1,400 from ₹1,000.

**Fix: optimistic locking.** The `Account` entity has a `@Version` column. Hibernate includes it in the `UPDATE ... WHERE version = ?` clause. The second writer's update matches zero rows, gets an `OptimisticLockException`, and retries with fresh data — at which point it correctly sees insufficient funds.

I chose optimistic over pessimistic locking because conflicts on a single account are rare, and I didn't want to hold database locks across a network call.

## Failure 5: the partner bank says no — after we debited

The sender has been debited. The event goes out. The partner bank rejects the credit (closed account, timeout, whatever). You can't roll back a committed transaction in another service.

**Fix: a saga with compensation.** Instead of one distributed transaction, a transfer is a sequence of local steps, each with an explicit undo:

```text
PENDING → DEBITED → COMPLETED
               ↘ COMPENSATING → REVERSED   (refund credited back)
PENDING → FAILED                            (debit rejected, nothing to undo)
```

When Transaction Service consumes `transfer.failed`, it moves the transfer to `COMPENSATING`, credits the money back to the sender (idempotently, keyed by the transaction ID), and ends in `REVERSED`. The customer gets a notification instead of a mystery.

Every state transition is persisted, so if the service crashes mid-saga it resumes from the last known state rather than guessing.

## Failure 6: a message that always fails

Some messages are poison — a bug or bad data means processing will never succeed. If the consumer just retries forever, every message behind it on that partition is stuck.

**Fix: retry topics and a dead-letter topic.** Failed messages move to `transfer.initiated.retry` with back-off. After N attempts they land in `transfer.initiated.dlt`, where I can inspect and replay them. The main topic keeps flowing.

## Keeping order where it matters

One more small decision with a big effect: Kafka messages are keyed by `accountId`. Kafka guarantees order *within a partition*, and the key decides the partition. So all events for one account are processed in order, while different accounts still process in parallel.

## What I'd tell my past self

- **Design for the failure, not the feature.** Write down every "what if this call fails?" before writing code.
- **Put the side effect and its bookkeeping in one transaction.** It's the trick behind idempotency keys, the outbox and idempotent consumers alike.
- **At-least-once + idempotent processing = exactly-once effect.** Chasing true exactly-once delivery across systems is a trap.

The full source — nine services, the Angular front end and Docker Compose setup — is on [GitHub](https://github.com/Nayeemshaik29/SentinelBank), and the architecture is summarised on the [project page](/projects/sentinelbank).
