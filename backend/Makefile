# Loan Platform Backend — developer task runner.
.DEFAULT_GOAL := help
COMPOSE_DEV := docker compose -f compose.yaml -f compose.dev.yaml
COMPOSE_PROD := docker compose -f compose.yaml -f compose.prod.yaml

.PHONY: help
help: ## Show this help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: up
up: ## Start the dev stack (api + db + redis, hot reload).
	$(COMPOSE_DEV) up --build

.PHONY: down
down: ## Stop the dev stack and remove containers.
	$(COMPOSE_DEV) down

.PHONY: prod-config
prod-config: ## Validate the prod compose configuration.
	$(COMPOSE_PROD) config

.PHONY: lint
lint: ## Run ruff + black --check.
	ruff check .
	black --check .

.PHONY: format
format: ## Auto-format with black + ruff --fix.
	ruff check --fix .
	black .

.PHONY: type
type: ## Run mypy on application code.
	mypy src

.PHONY: test
test: ## Run the test suite.
	pytest

.PHONY: check
check: lint type test ## Run lint + type + test (what CI runs).

.PHONY: migrate
migrate: ## Apply all service migration heads.
	alembic upgrade heads

.PHONY: revision
revision: ## Create a revision: make revision SERVICE=auth MSG="add users".
	alembic revision --autogenerate \
		--branch-label $(SERVICE) \
		--version-path migrations/versions/$(SERVICE) \
		-m "$(MSG)"

.PHONY: jdm
jdm: ## Regenerate the Rule Engine JDM artifact from the matrix.
	python scripts/generate_jdm.py

.PHONY: requirements
requirements: ## Recompile all requirements lockfiles.
	bash scripts/compile_requirements.sh
