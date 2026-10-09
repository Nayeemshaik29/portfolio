---
title: SoftLaunch
tagline: A cloud-native dating backend with Kafka-driven notifications.
summary: Production-style microservices for a modern dating app — sign up, build a rich profile, swipe, match and get notified — on Java 25, Spring Boot 4, Spring Cloud, Kafka, PostgreSQL and Redis.
order: 2
category: Microservices
status: Active development
repo: https://github.com/Nayeemshaik29/softlaunch
stack: [Java 25, Spring Boot 4.1, Spring Cloud Gateway, Eureka, Config Server, Kafka 4 (KRaft), PostgreSQL 17, Redis 7, OpenFeign, Resilience4j]
highlights:
  - Gateway-level JWT validation that forwards identity as X-User-Id and strips any client-supplied copy — no identity spoofing.
  - Constant-time login (dummy hash compare for unknown emails) to defeat user enumeration by timing.
  - Race-safe matching — a match is stored as a sorted user pair, so A↔B and B↔A can never create duplicates.
  - Daily swipe quota with Redis INCR + TTL, returning 429 when exceeded.
  - Idempotent notification consumer with retries and a dead-letter topic.
  - RFC 9457 ProblemDetail error responses across every service.
flow:
  - { label: "Client → API Gateway", note: "JWT filter validates the token and propagates X-User-Id." }
  - { label: "Match Service", note: "Records LIKE / PASS / SUPER_LIKE swipes; checks the target user via OpenFeign + circuit breaker." }
  - { label: "Mutual like", note: "Creates a Match (sorted pair) and publishes match.created after the DB commit." }
  - { label: "Kafka", note: "Delivers the event to the notification-service consumer group." }
  - { label: "Notification Service", note: "Stores notifications for both users, idempotent on (source_event_id, recipient_id)." }
---

## What it is

SoftLaunch is a learning-driven, production-style backend for a dating app. Every service owns its own data; services find each other through Eureka, pull configuration from a Config Server, and are reached only through the API Gateway.

## Services

| Service | Responsibility |
|---|---|
| **Registry** (`:8761`) | Eureka — every service registers here |
| **Config Server** (`:8888`) | Central config from `config-repo/`, services fail fast without it |
| **API Gateway** (`:8080`) | Single entry point, JWT filter, `/internal/**` is never routed |
| **User Service** | Signup/login with BCrypt + short-lived JWT, `@Adult` validator, rich profiles with completion % |
| **Match Service** | Swipes, mutual-like matching, unmatch, Redis daily quota, Feign + circuit breaker |
| **Notification Service** | Kafka consumer, idempotent storage, retries + DLT, read/unread API |

## Engineering decisions worth calling out

- **Publish after commit.** `match.created` is only sent once the transaction has committed, so consumers never see a match that was rolled back.
- **Treat 404 as an answer, not a failure.** The circuit breaker around the User Service ignores 404s, so a missing user doesn't trip the breaker for everyone.
- **Validate events, don't retry bad ones.** Malformed events are rejected immediately; only transient failures are retried before going to the DLT.

## Roadmap

Redis GEO nearby feed with gRPC, a WebSocket chat service, KYC verification, observability with Zipkin + Prometheus + Grafana, an AI assistant and a Flutter client.
