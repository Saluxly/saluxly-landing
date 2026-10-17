"""Local preview of saluxly.com: serves the repository root the way GitHub Pages does (directory
index.html, /404.html for what is missing) and answers the waitlist form at POST /api/waitlist,
printing each submission; an email containing "fail" gets a 500, to see the error state.
Run: python3 tools/preview.py [port]   (default 8080; reachable from the phone on the same network)"""
import json
import mimetypes
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("image/webp", ".webp")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path.split("?")[0] != "/api/waitlist":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        body = json.loads(self.rfile.read(length) or b"{}")
        failing = "fail" in str(body.get("email", ""))
        print(f"waitlist: {body}  → {'500' if failing else '200'}", flush=True)
        self.send_response(500 if failing else 200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok": true}' if not failing else b'{"ok": false}')

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (ROOT / "404.html").exists():
            page = (ROOT / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.end_headers()
            self.wfile.write(page)
            return
        super().send_error(code, message, explain)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        if "/api/" in (args[0] if args else ""):
            return
        super().log_message(format, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"preview at http://localhost:{port}/  (phone: http://<this Mac's IP>:{port}/)", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
