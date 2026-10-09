---
title: CI/CD Playground
tagline: From git push to a live container on AWS EC2 — fully automated.
summary: A self-built pipeline that compiles a Spring Boot app, builds an ARM64 Docker image, pushes it to Docker Hub and redeploys it on an AWS Graviton instance with GitHub Actions.
order: 5
category: DevOps
status: Complete
repo: https://github.com/Nayeemshaik29/ci-cd-playground
stack: [GitHub Actions, Docker, Docker Buildx, Docker Hub, AWS EC2 (Graviton), Maven, Spring Boot, SSH]
highlights:
  - One push to main builds, containerises and deploys — no manual steps.
  - Cross-builds linux/arm64 images on x86 runners with Buildx for a t4g.nano Graviton instance.
  - Secrets (Docker Hub token, EC2 host, SSH key) stored as GitHub Actions secrets, never in the repo.
  - Documented 11 real mistakes and their fixes — from exec format errors to Security Group rules.
flow:
  - { label: "git push", note: "A push to main triggers the workflow." }
  - { label: "Build", note: "Checkout, JDK 21, ./mvnw clean package." }
  - { label: "Containerise", note: "Buildx builds a linux/arm64 image and pushes it to Docker Hub." }
  - { label: "Deploy", note: "appleboy/ssh-action connects to EC2 and swaps the running container." }
  - { label: "Live", note: "The new version serves traffic on port 8081." }
---

## Why this project

Writing code is half the job; getting it running somewhere reliably is the other half. I built this pipeline from scratch to understand every moving part instead of clicking through a managed service.

## The workflow, in short

```yaml
on:
  push:
    branches: [ "main" ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin', cache: maven }
      - run: ./mvnw clean package -DskipTests
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with: { platforms: linux/arm64, push: true, tags: user/spring-boot-app:latest }
      - uses: appleboy/ssh-action@v1.0.3   # stop old container, pull, run new one
```

## The mistake that taught me the most

The first deploy "worked" — the container started and immediately exited with code 255. The logs said `exec format error`. GitHub's runners are x86_64, but the EC2 instance is ARM64 (Graviton). The fix was building with Buildx for `linux/arm64`. The full write-up is on the [blog](/blog/cicd-spring-boot-aws-ec2).
