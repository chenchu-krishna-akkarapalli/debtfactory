# syntax=docker/dockerfile:1.7
# Multi-stage image: base (deps) -> dev (reload) / prod (slim, non-root, gunicorn).

# --------------------------------------------------------------------------- #
# base — shared OS deps + compiled Python requirements.
# --------------------------------------------------------------------------- #
FROM python:3.12-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# tesseract is needed by the OCR jobs service; libpq for asyncpg builds.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install runtime deps first for better layer caching.
COPY requirements/ requirements/
RUN pip install \
        -r requirements/base.txt \
        -r requirements/services/rule_engine.txt \
        -r requirements/services/auth.txt \
        -r requirements/services/domain_logs.txt \
        -r requirements/services/ocr_jobs.txt

COPY pyproject.toml alembic.ini ./
COPY src/ src/
COPY migrations/ migrations/
COPY scripts/ scripts/

ENV PYTHONPATH=/app/src

# --------------------------------------------------------------------------- #
# dev — dev tooling + hot reload. Source is bind-mounted in compose.dev.yaml.
# --------------------------------------------------------------------------- #
FROM base AS dev
RUN pip install -r requirements/dev.txt
COPY docker/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# --------------------------------------------------------------------------- #
# prod — slim, non-root, gunicorn + uvicorn workers.
# --------------------------------------------------------------------------- #
FROM base AS prod
RUN groupadd --system app && useradd --system --gid app --home /app app
COPY docker/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown -R app:app /app
USER app
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "4", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
