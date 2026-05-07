from flask import Flask, send_from_directory
from flask_sock import Sock
import subprocess
import os
import threading

# Serve static files from the root directory
app = Flask(__name__, static_folder='', static_url_path='/static_unused')
sock = Sock(app)

os.makedirs("reports", exist_ok=True)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if filename in ['style.css', 'main.js']:
        return send_from_directory('.', filename)
    return "Not Found", 404

@app.route('/reports/<path:filename>')
def serve_report(filename):
    return send_from_directory('reports', filename)

@sock.route('/ws')
def terminal_socket(ws):
    process = None
    
    def read_stdout(proc):
        for line in iter(proc.stdout.readline, ''):
            if line:
                try:
                    ws.send(line)
                except:
                    break
        try:
            ws.send("[PROCESS_COMPLETE]\n")
        except:
            pass

    while True:
        try:
            data = ws.receive()
            if not data:
                break
                
            if data.startswith("run "):
                if process is not None and process.poll() is None:
                    ws.send("\n[!] Error: An agent is already running. Type your response.\n")
                    continue
                    
                target = data[4:].strip()
                python_exec = os.path.join("venv", "Scripts", "python.exe")
                if not os.path.exists(python_exec):
                    python_exec = "python"
                    
                process = subprocess.Popen(
                    [python_exec, "-u", "agent.py", target],
                    stdout=subprocess.PIPE,
                    stdin=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    cwd=os.path.dirname(os.path.abspath(__file__))
                )
                
                threading.Thread(target=read_stdout, args=(process,), daemon=True).start()
                
            elif process is not None and process.poll() is None:
                process.stdin.write(data + "\n")
                process.stdin.flush()
            else:
                ws.send(f"\n[!] Command not found or no agent running: {data}. Try 'run <target>'\n")
                
        except Exception as e:
            print(f"WebSocket error: {e}")
            break

if __name__ == '__main__':
    app.run(debug=True, port=5000)
