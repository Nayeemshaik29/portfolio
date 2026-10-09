---
title: Skillora
tagline: A LinkedIn-inspired professional network built as microservices.
summary: Users, posts, connections and notifications as independent Spring Boot services behind an API Gateway, with Kafka events, Resilience4j, Zipkin tracing and centralized ELK logging.
order: 3
category: Microservices
status: Complete
repo: https://github.com/Nayeemshaik29/Skillora
stack: [Java, Spring Boot, Spring Cloud Gateway, Eureka, Apache Kafka, Resilience4j, Zipkin, ELK Stack, PostgreSQL, Docker]
highlights:
  - Clear domain boundaries — User, Post, Connections and Notification services with a database per service.
  - API Gateway for centralized routing and security; Eureka for dynamic service discovery.
  - Event-driven notifications over Kafka when users post, like or connect.
  - Resilience4j circuit breakers keep one slow service from cascading failures.
  - Distributed tracing with Zipkin and centralized logs in the ELK stack.
flow:
  - { label: "Client → API Gateway", note: "All requests enter through the gateway, which routes by path." }
  - { label: "Domain services", note: "User, Post and Connections services handle their own data and REST APIs." }
  - { label: "Kafka events", note: "Actions such as a new post or connection publish events." }
  - { label: "Notification Service", note: "Consumes the events and notifies the right users." }
  - { label: "Zipkin + ELK", note: "Every request is traced and every log line is searchable in one place." }
---

## Why I built it

I wanted to practise the parts of microservices that tutorials skip: what happens when one service is slow, how you follow a single request across five services, and how you keep services from sharing a database.

## What it demonstrates

- **Service boundaries.** Each service owns its data; cross-service needs go through APIs or events, never shared tables.
- **Synchronous vs asynchronous.** REST where the caller needs an answer now, Kafka where work can happen later.
- **Fault tolerance.** Circuit breakers and fallbacks so a failing dependency degrades gracefully.
- **Observability from day one.** Zipkin traces and ELK logs made cross-service issues much easier to debug.

## What's next

Real-time updates over WebSockets, a recommendation feed and containerised deployment with Kubernetes manifests.
