---
title: "From git push to a live container on AWS EC2"
description: "Building a CI/CD pipeline for Spring Boot with GitHub Actions, Docker and an ARM64 Graviton instance — and the 11 mistakes I made along the way."
pubDate: 2026-09-29
tags: [devops, github-actions, docker, aws]
project: ci-cd-playground
---

I could write Spring Boot services, but I'd never owned the path from my laptop to a running server. So I built one: every push to `main` builds the app, packages it as a Docker image, pushes it to Docker Hub and redeploys it on an AWS EC2 instance — no manual steps.

This is how it works, and more usefully, what broke.

## The architecture

```text
Developer ──git push──▶ GitHub ──triggers──▶ GitHub Actions runner
                                               │ build JAR (Maven)
                                               │ build linux/arm64 image (Buildx)
                                               │ push image ──────────▶ Docker Hub
                                               │ SSH into EC2 ──▶ pull + restart container
                                                                        │
                                                         Live app on EC2 :8081
```

| Layer | Tool |
|---|---|
| CI orchestration | GitHub Actions |
| Build | Maven wrapper (`./mvnw`) |
| Packaging | Docker + Buildx |
| Registry | Docker Hub |
| Compute | AWS EC2 — Ubuntu on a `t4g.nano` (ARM64 Graviton) |
| Remote deploy | `appleboy/ssh-action` |

## Step 1: a minimal Dockerfile

```dockerfile
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

A JRE base image (not a full JDK) keeps the image smaller. The JAR is built by Maven before Docker ever runs, so the Dockerfile stays trivial.

## Step 2: the workflow

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - run: ./mvnw clean package -DskipTests

      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - uses: docker/setup-buildx-action@v3

      - uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/arm64
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest

      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            docker stop spring-boot-app || true
            docker rm spring-boot-app || true
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
            docker run -d -p 8081:8081 --name spring-boot-app \
              ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
```

Every credential lives in **GitHub Actions secrets** — the Docker Hub token, the EC2 host, the SSH user and the private key. Nothing sensitive is in the repository.

## The mistakes (this is the real lesson)

### "exec format error"

The pipeline went green. The container started… and exited immediately with code 255. `docker logs` said:

```text
exec format error
```

GitHub's hosted runners are **x86_64**. My EC2 instance is a Graviton **ARM64** machine. I had built an x86 image and asked an ARM CPU to run it. The fix was Docker Buildx with `platforms: linux/arm64`, which cross-builds the image on the x86 runner.

### A Docker Hub token that couldn't push

`docker push` in Actions failed with `insufficient scopes`. Docker Hub's personal access tokens default to **read-only**. The token needs **Read & Write** scope.

### Permission denied on the Docker socket

After `usermod -aG docker ubuntu`, Docker still said `permission denied`. Group changes only apply to new sessions — `newgrp docker` or reconnecting SSH fixed it.

### The app was running but unreachable

`curl localhost:8081` worked *on* the instance, but the browser couldn't reach it. The EC2 **Security Group** didn't allow inbound traffic on 8081. One inbound rule later, it was live.

### The smaller ones

- Running `docker build` from the wrong directory → "failed to read dockerfile".
- Over-indented `run:` in YAML → the step silently didn't parse.
- Assuming the SSH user is `ec2-user` — it's `ubuntu` on Ubuntu AMIs.
- A `@RequestMapping` on the class with no `@GetMapping` on the method → a 404 that looked like a deployment problem but wasn't.

## What I took away

1. **Know your target architecture.** ARM vs x86 is invisible until it isn't.
2. **Least privilege is the default; you have to ask for more.** Tokens, groups and firewalls all start closed.
3. **Separate "it built" from "it runs" from "it's reachable".** They fail for completely different reasons, and the logs for each live in different places.

Next steps for this pipeline: run the test suite instead of `-DskipTests`, tag images with the commit SHA instead of `latest` for easy rollbacks, and add a health check before switching traffic.

The workflow and a full troubleshooting table are on [GitHub](https://github.com/Nayeemshaik29/ci-cd-playground).
