"""One-command launcher for HITL Jenga.

    uv run run.py            # local: venv + FastAPI (8000) + Vite (5173)
    uv run run.py --docker   # docker compose --profile tunnel (Cloudflare named tunnel, token from .env)

Ctrl+C stops everything.
"""
import argparse
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
VENV = ROOT / ".venv"
IS_WIN = os.name == "nt"


def need(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        sys.exit(f"'{tool}' not found on PATH - please install it first.")
    return path


def load_env_file() -> None:
    """Load KEY=VALUE pairs from HITL/.env without overriding the real environment."""
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip("'\""))


def stream(proc: subprocess.Popen, tag: str, on_line=None) -> None:
    def pump():
        for line in proc.stdout:
            print(f"[{tag}] {line}", end="")
            if on_line:
                on_line(line)
    threading.Thread(target=pump, daemon=True).start()


def spawn(cmd, tag, cwd=None, env=None, on_line=None) -> subprocess.Popen:
    proc = subprocess.Popen(
        cmd, cwd=cwd, env=env, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        start_new_session=not IS_WIN,
    )
    stream(proc, tag, on_line)
    return proc


def terminate(procs) -> None:
    for p in procs:
        if p.poll() is None:
            try:
                if IS_WIN:
                    p.terminate()
                else:
                    os.killpg(p.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
    deadline = time.time() + 8
    for p in procs:
        try:
            p.wait(timeout=max(0.1, deadline - time.time()))
        except subprocess.TimeoutExpired:
            if not IS_WIN:
                os.killpg(p.pid, signal.SIGKILL)
            else:
                p.kill()


def wait_all(procs) -> None:
    """Block until Ctrl+C or any child exits."""
    while all(p.poll() is None for p in procs):
        time.sleep(0.5)


# --------------------------------------------------------------------------- local
def run_local() -> None:
    npm = need("npm")
    need("node")

    # `uv run` has already synced the project env (.venv) from pyproject.toml / uv.lock.
    py = sys.executable
    print(f"[run] Using virtual env: {VENV}")

    if not (FRONTEND / "node_modules").exists():
        print("[run] npm install")
        subprocess.check_call([npm, "install"], cwd=FRONTEND)

    env = {**os.environ, "ENVIRONMENT": "development", "PYTHONUNBUFFERED": "1"}
    env.pop("CORS_ORIGINS", None)  # .env value targets the public domain; use backend's localhost defaults
    procs = [
        spawn([py, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
              "backend", cwd=BACKEND, env=env),
        spawn([npm, "run", "dev", "--", "--host", "127.0.0.1"], "frontend", cwd=FRONTEND, env=env),
    ]
    print("\n[run] Frontend: http://localhost:5173   Backend: http://127.0.0.1:8000/docs   (Ctrl+C to stop)\n")
    try:
        wait_all(procs)
    except KeyboardInterrupt:
        pass
    finally:
        print("\n[run] Shutting down...")
        terminate(procs)


# --------------------------------------------------------------------------- docker
def compose_cmd() -> list:
    docker = shutil.which("docker")
    if docker and subprocess.call([docker, "compose", "version"], stdout=subprocess.DEVNULL,
                                  stderr=subprocess.DEVNULL) == 0:
        return [docker, "compose"]
    return [need("docker-compose")]


def ensure_docker_daemon() -> None:
    docker = need("docker")
    if subprocess.call([docker, "info"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0:
        return
    if shutil.which("colima"):
        print("[run] Docker daemon not reachable; starting colima")
        subprocess.check_call(["colima", "start"])
    else:
        sys.exit("Docker daemon is not running.")


def run_docker() -> None:
    load_env_file()
    missing = [k for k in ("TUNNEL_TOKEN", "ADMIN_SECRET_KEY", "CORS_ORIGINS") if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing {', '.join(missing)} - set them in HITL/.env (see .env.example).")
    ensure_docker_daemon()
    compose = compose_cmd()
    base = compose + ["--profile", "tunnel"]

    print("[run] docker compose --profile tunnel up -d --build --wait")
    subprocess.check_call(base + ["up", "-d", "--build", "--wait"], cwd=ROOT)
    print("[run] App + Cloudflare tunnel are up. Streaming logs (Ctrl+C stops everything).\n")

    logs = spawn(base + ["logs", "-f", "--tail", "20"], "docker", cwd=ROOT)
    try:
        wait_all([logs])
    except KeyboardInterrupt:
        pass
    finally:
        print("\n[run] Shutting down...")
        terminate([logs])
        subprocess.call(base + ["down"], cwd=ROOT)


def main() -> None:
    ap = argparse.ArgumentParser(description="Launch HITL Jenga locally or via Docker + tunnel.")
    ap.add_argument("--docker", action="store_true", help="docker compose + cloudflared tunnel")
    args = ap.parse_args()
    if args.docker:
        run_docker()
    else:
        load_env_file()
        run_local()


if __name__ == "__main__":
    main()
