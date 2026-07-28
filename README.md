# SiteSupervise Backend Integration for Tersus MVP S1

This is the dedicated backend service for integrating the Tersus MVP S1 Handheld Scanner into SiteSupervise, a construction project management and Digital Eye platform.

## Project Vision

The backend provides a robust ingestion pipeline capable of receiving scan data (from the Data Producer, Tersus MVP S1), validating metadata, storing assets, managing processing workflows, and exposing APIs consumed by the frontend (the Data Consumer, SiteSupervise).

## Technology Stack

- **Framework**: Python 3.13+, Django, Django REST Framework
- **Database**: PostgreSQL
- **Caching & Queues**: Redis, Celery
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT
- **Tooling**: Pytest, Black, Ruff, pre-commit

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.13 (for local development without Docker)

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Run migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

### Local Development (Virtual Environment)

1. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install pre-commit hooks:
   ```bash
   pre-commit install
   ```

4. Start services (DB and Redis) via Docker, then run local server:
   ```bash
   docker-compose up -d db redis
   python manage.py runserver
   ```

## Architecture

This project follows Clean Architecture and Domain-Driven Design (DDD) principles. Business logic should reside in the service/domain layers, keeping Django views thin and focused on HTTP concerns.

Refer to `AGENTS.md` for complete engineering guidelines and coding standards.
# Tarsus-sitesupervise-Integration-
