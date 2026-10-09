---
title: Live Location with Kafka
tagline: Real-time delivery tracking, the way food-delivery apps do it.
summary: Two Spring Boot services — a delivery-partner producer and an end-user consumer — exchanging live location updates over an Apache Kafka topic.
order: 6
category: Backend
status: Complete
repo: https://github.com/Nayeemshaik29/kafka-learning-spring-boot
stack: [Java, Spring Boot, Apache Kafka, Spring for Apache Kafka, Docker]
highlights:
  - Producer service publishes location updates to location-update-topic.
  - Consumer service subscribes and receives every update independently.
  - Shows publish/subscribe decoupling — any number of consumers can read the same stream.
  - Kafka broker run locally with Docker for a one-command setup.
flow:
  - { label: "Delivery partner app", note: "The deliveryboy service produces a location update every few seconds." }
  - { label: "Kafka topic", note: "location-update-topic stores the stream durably." }
  - { label: "End-user app", note: "The enduser service consumes updates and shows the live position." }
---

## What it teaches

Kafka is easiest to understand with a concrete use case. Here a delivery partner publishes their position once, and Kafka lets any number of subscribers — the customer's app, an ETA calculator, an analytics job — each receive it independently.

| Service | Role | Port |
|---|---|---|
| `deliveryboy` | Producer — publishes location updates | 8080 |
| `enduser` | Consumer — listens for location updates | 8081 |

This small project was the foundation for the event-driven parts of SentinelBank, Skillora and SoftLaunch.
