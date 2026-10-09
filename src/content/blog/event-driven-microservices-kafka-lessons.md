---
title: "Event-driven microservices with Kafka: what actually matters"
description: "Lessons from building SoftLaunch and Skillora — when to use events instead of REST, publishing after commit, idempotent consumers, retries and dead-letter topics."
pubDate: 2026-10-03
tags: [kafka, microservices, spring-boot, resilience]
project: softlaunch
---

Kafka tutorials usually stop at "the producer sends, the consumer receives". In my projects — a dating backend (**SoftLaunch**), a professional network (**Skillora**) and a banking platform (**SentinelBank**) — the interesting work started right after that. Here's what I'd tell anyone adding Kafka to a Spring Boot system.

## 1. Choose REST or events per interaction, not per system

The question isn't "should my architecture be event-driven?" It's "does the caller need the answer *right now*?"

- **Need an answer now → REST.** In SoftLaunch, before recording a swipe the Match Service must know the target user exists. That's a synchronous OpenFeign call.
- **Something should happen as a consequence → event.** When two users like each other, the Match Service publishes `match.created`. Whether the notification is stored 50 ms later doesn't matter, and the Match Service shouldn't care who listens.

Events decouple *time* (the consumer can be down) and *knowledge* (the producer doesn't know its consumers). That second part is what lets you add an analytics service later without touching the Match Service.

## 2. Publish after the transaction commits

The tempting version publishes `match.created` inside the method that saves the match. But if anything later in that transaction fails — a constraint violation, say — the database rolls back while the event has already gone out. The notification service would tell two users they'd matched, and the match wouldn't exist.

SoftLaunch avoids this by publishing only once the transaction has committed. In Spring, the pattern looks like this:

```java
@Transactional
public Match createMatch(UUID a, UUID b) {
    Match m = matches.save(Match.sortedPair(a, b));
    events.publishEvent(new MatchCreated(m.getId(), a, b)); // in-process event
    return m;
}

@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
void send(MatchCreated e) {
    kafka.send("match.created", e.matchId().toString(), e);
}
```

For money (SentinelBank) I went one step further with a **transactional outbox**, because "after commit" still loses the event if the process dies right then. For notifications, after-commit is a sensible trade-off.

## 3. Assume every message arrives twice

Kafka's default is at-least-once delivery. Rebalances, retries and crashes all produce duplicates. So every consumer needs to be **idempotent**.

In SoftLaunch's Notification Service, the idempotency is enforced by the database itself: a unique key on `(source_event_id, recipient_id)`. A redelivered `match.created` tries to insert the same rows, hits the constraint, and is treated as "already done". No extra lookup table, no race between check and insert.

```sql
ALTER TABLE notification
  ADD CONSTRAINT uq_event_recipient UNIQUE (source_event_id, recipient_id);
```

Letting the database enforce uniqueness is the most reliable idempotency you can get — the same trick SoftLaunch uses to store a match as a *sorted* user pair so that A↔B and B↔A can never both exist.

## 4. Separate "bad message" from "bad moment"

Not all failures deserve a retry.

- **Bad message** — a required field is null, the payload can't be parsed. Retrying will never help. SoftLaunch validates events with `@NotNull` and rejects them immediately.
- **Bad moment** — the database is briefly unavailable, a downstream call timed out. Retrying probably helps.

SoftLaunch retries transient failures twice, one second apart, before giving up. Spring for Apache Kafka makes this explicit with a `DefaultErrorHandler` — transient exceptions get retries with back-off, and validation exceptions are marked non-retryable:

```java
@Bean
DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template);   // → <topic>.DLT
    var handler = new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 2));
    handler.addNotRetryableExceptions(ConstraintViolationException.class);
    return handler;
}
```

## 5. Dead-letter topics keep the queue moving

A message that fails forever is a **poison pill**: Kafka consumes partitions in order, so everything behind it waits. The dead-letter publisher moves it to `match.created.DLT` *with the exception details in the headers*, and the consumer moves on.

The DLT isn't a bin — it's an inbox. Once the bug is fixed, those messages can be replayed.

## 6. Key messages for the order you need

Kafka only guarantees order within a partition, and the message key picks the partition. In SentinelBank I key transfer events by `accountId`, so one account's events are processed in sequence while different accounts run in parallel. In SoftLaunch, the same idea applies to `match.created` and `match.removed`: keying both by match ID keeps the events for one match in order.

Choosing the key is choosing your ordering guarantee — make it a deliberate decision.

## 7. Make it observable

In Skillora, the moment I had five services and Kafka in between, "why didn't this notification arrive?" became impossible to answer from logs alone. Adding **Zipkin** tracing and centralised **ELK** logging, with a correlation ID carried through REST calls *and* Kafka headers, turned a long hunt through five log files into a single search.

## The checklist I now use

- [ ] Does the caller need an answer now? If not, use an event.
- [ ] Is the event published only after the change committed (or via an outbox)?
- [ ] Is the consumer idempotent — ideally enforced by a unique constraint?
- [ ] Are non-retryable errors separated from transient ones?
- [ ] Is there a DLT, and do I know how to replay it?
- [ ] Is the message key giving me the ordering I need?
- [ ] Can I trace one request across every service it touches?

The code for these patterns is on GitHub: [SoftLaunch](https://github.com/Nayeemshaik29/softlaunch), [Skillora](https://github.com/Nayeemshaik29/Skillora) and [SentinelBank](https://github.com/Nayeemshaik29/SentinelBank).
