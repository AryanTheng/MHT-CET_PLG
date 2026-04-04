import subprocess
import time
import webbrowser
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def start_backend():
    print("🚀 Starting Backend with venv...")

    venv_python = os.path.join(BASE_DIR, "backend", "venv", "Scripts", "python.exe")

    return subprocess.Popen(
        [
            venv_python,
            "-m",
            "uvicorn",
            "main:app",
            "--reload",
            "--port",
            "8000"
        ],
        cwd=os.path.join(BASE_DIR, "backend"),
        shell=True
    )


def start_frontend():
    print("🚀 Starting Frontend...")
    return subprocess.Popen(
        ["cmd", "/c", "npm run dev"],
        cwd=os.path.join(BASE_DIR, "frontend"),
        shell=True
    )


if __name__ == "__main__":
    try:
        backend = start_backend()

        time.sleep(3)

        frontend = start_frontend()

        time.sleep(5)

        print("🌐 Opening Browser...")
        webbrowser.open("http://localhost:5173")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("🛑 Shutting down...")
        backend.terminate()
        frontend.terminate()