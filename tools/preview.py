"""Local preview of saluxly.com: serves the repository root the way GitHub Pages does (directory
index.html, /404.html for what is missing).
Run: python3 tools/preview.py [port]   (default 8080; reachable from the phone on the same network)"""
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


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"preview at http://localhost:{port}/  (phone: http://<this Mac's IP>:{port}/)", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
