---
title: Environment & Tooling
tags: [debtfactory, environment, python, windows]
created: 2026-06-03
---

# 🐍 Environment & Tooling

How the local dev environment is set up, and the Windows-specific traps. See
[[Troubleshooting Log]] for the errors these prevent.

## Python version — 3.12 only

- `pyproject.toml` pins `requires-python = ">=3.12,<3.13"`.
- The venv runs **Python 3.12.8** (installed per-user under `%LOCALAPPDATA%\Programs\Python\Python312`).
- A 3.13 interpreter will run the code but **blocks `pip install -e .`** with `requires a different Python`.

## Setup (one time)

```powershell
$py312 = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
& $py312 -m venv .venv
.venv\Scripts\python -m pip install -r requirements\... 
.venv\Scripts\python -m pip install -e .        # editable install — the key step
```

## The editable install matters

`pip install -e .` puts the `app` package on `sys.path` permanently, so:

```powershell
.venv\Scripts\python -m uvicorn app.main:create_app --factory --reload   # just works
```

Without it you get `ModuleNotFoundError: No module named 'app'` (the app lives in `src/app`).

## Windows gotchas (learned the hard way)

- **PowerShell ≠ bash.** `PYTHONPATH=src cmd` does nothing in PowerShell. Use `$env:PYTHONPATH="src"` — or better, the editable install so you never need it.
- **Do NOT `pip install --upgrade pip` in place.** Windows Defender locks pip's own vendor files mid-rewrite → corrupts the venv (`ModuleNotFoundError: pip._internal.cli`). The bundled pip is fine.
- **Deleting `.venv` can fail** if a `uvicorn --reload` process still holds `greenlet`'s `.pyd`. Kill the python process first (`Get-CimInstance Win32_Process | … Stop-Process`).
- PowerShell wraps a native exe's **stderr** as a red `NativeCommandError` even on success — check for the actual success line (e.g. `Successfully installed …`), not the red text.

## Quality gates (what CI runs)

```powershell
.venv\Scripts\python -m ruff check src tests
.venv\Scripts\python -m black --check src tests
.venv\Scripts\python -m mypy src        # strict
.venv\Scripts\python -m pytest -q
```

#environment #windows #python
