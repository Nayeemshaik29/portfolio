---
title: BookingBlock
tagline: A multi-tenant hotel booking backend that never double-books a room.
summary: Spring Boot and PostgreSQL backend where users book hotels, owners publish listings and admins oversee the marketplace — with JWT security, inventory locking and a strategy-based pricing engine.
order: 4
category: Backend
status: Complete
repo: https://github.com/Nayeemshaik29/BookingBlock
stack: [Java, Spring Boot, Spring Security, JWT, PostgreSQL, JPA / Hibernate, Lombok, JUnit, Postman]
highlights:
  - JWT authentication and role-based authorization for guests, hotel owners and admins.
  - Inventory locking prevents overbooking under concurrent requests.
  - Dynamic pricing engine built with the Strategy pattern — rules can be added without touching existing code.
  - Payment gateway integration and yearly financial / operational reports.
  - Clean layering with DTOs, entities and service classes.
flow:
  - { label: "Authenticate", note: "Users sign in and receive a JWT carrying their role." }
  - { label: "Search & price", note: "The pricing engine applies strategy rules to each room and date." }
  - { label: "Reserve inventory", note: "Rooms are locked for the booking window so two guests can't take the same room." }
  - { label: "Pay & confirm", note: "Payment is processed and the booking is confirmed." }
  - { label: "Report", note: "Owners and admins get yearly financial and operational reports." }
---

## The interesting part: concurrency

Two guests clicking "Book" for the last room at the same moment is the classic race condition. BookingBlock locks the inventory rows for the requested dates inside the booking transaction, so exactly one request wins and the other gets a clear "no longer available" response — no overselling, no manual clean-up.

## Pricing with the Strategy pattern

Prices depend on several rules — base rate, occupancy surges, holidays, urgency. Each rule is its own strategy class, and the engine composes them. Adding a new rule (say, a festival surcharge) means adding one class, not editing a growing `if/else` chain.

## API surface

Authentication, users, hotel browsing, hotel management for owners, bookings and admin reports — documented with a Postman collection in the repository.
