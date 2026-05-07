import sys
import time
import os
from report import Reporter

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class BastionAIAgent:
    """
    Simulates a highly realistic, interactive AI agent session.
    Features human-in-the-loop decision making.
    """
    def __init__(self, target: str):
        self.target = target.lower()
        self.reporter = Reporter(target)
        self.api_key = os.environ.get("OPENROUTER_API_KEY")
        self.client = None
        if self.api_key and OpenAI:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key,
            )

    def log(self, text, delay=1.0):
        """Standard system log."""
        time.sleep(delay)
        print(f"[SYS] {text}", flush=True)

    def think(self, text, delay=2.0):
        """Simulates the LLM reasoning process or uses real LLM if configured."""
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=os.environ.get("OPENROUTER_MODEL", "baidu/fp8-cobuddy"),
                    messages=[
                        {"role": "system", "content": "You are BastionAI, an autonomous, elite penetration testing agent. Rephrase the following underlying thought into a realistic, technical, and brief internal monologue. Do not wrap it in quotes. Output only the thought. Limit to 1-3 sentences."},
                        {"role": "user", "content": text}
                    ],
                    max_tokens=150
                )
                generated_thought = response.choices[0].message.content.strip()
                print(f"[LLM Reasoning] {generated_thought}", flush=True)
                return
            except Exception as e:
                print(f"[SYS] API Error: {e} - falling back to simulated logic", flush=True)

        time.sleep(delay)
        print(f"[LLM Reasoning] {text}", flush=True)

    def warn(self, text, delay=1.0):
        """Warning or vulnerability confirmed."""
        time.sleep(delay)
        print(f"[WARNING] {text}", flush=True)

    def ask_user(self, prompt_text, delay=1.0):
        """Pauses the AI to ask the human operator a question."""
        time.sleep(delay)
        # Ensure a newline is printed so app.py's readline() flushes it to the websocket
        print(f"[Action Required] {prompt_text}", flush=True)
        response = sys.stdin.readline().strip().lower()
        return response

    def simulate_dvwa(self):
        self.log(f"Initializing BastionAI Core for target: {self.target}...", delay=1)
        self.log("Loading penetration testing modules: Nmap, Nikto, Metasploit Framework.", delay=1)
        self.log("Phase: RECONNAISSANCE", delay=1)
        self.log("Executing: nmap -sV -p- -T4 dvwa.local...", delay=0.5)
        self.log("Nmap scan completed successfully. Open ports discovered: 22 (SSH), 80 (HTTP).", delay=2)
        
        self.think("Target exposes port 80 running Apache/2.4.29. The application appears to be PHP-based with a MySQL backend. I have identified an input parameter 'id' on the /vulnerabilities/sqli/ endpoint that lacks obvious sanitization.", delay=2.5)
        
        ans = self.ask_user("Do you want to explore this potential SQL vulnerability? (y/n):")
        
        if ans in ['y', 'yes']:
            self.think("User approved exploitation. Generating SQL injection payload to bypass authentication and dump the user schema.")
            self.log("Entering Verify-Exploit-Confirm cycle.")
            self.log("[Verify] Submitting test payload: 1' OR '1'='1")
            self.log("[Verify] Target responded with anomalous database row length. Syntax error bypassed.", delay=1.5)
            
            self.log("[Exploit] Executing full UNION SELECT payload to extract credentials...", delay=1.5)
            
            self.warn("Vulnerability Confirmed! Extracted the following users:", delay=2.5)
            self.warn("  -> admin (hash: 5f4dcc3b5aa765d61d8327deb882cf99)", delay=0.5)
            self.warn("  -> gordonb (hash: e99a18c428cb38d5f260853678922e03)", delay=0.5)
            self.warn("  -> 1337 (hash: 8d23cf6c86e834a7aa6eded54c26ce28)", delay=0.5)
            
            self.reporter.record_finding("SQL Injection (User ID parameter)", "Users dumped: admin, gordonb, 1337", "Critical")
            
            ans2 = self.ask_user("Exploitation successful. Where do you want the raw hash results to be dumped? (e.g., /root/loot/hashes.txt):")
            self.log(f"Writing loot to {ans2}...")
            self.log("File saved successfully.", delay=1)
        else:
            self.log("Skipping SQL injection vulnerability exploration based on user input.")

        self.think("Proceeding with background dynamic analysis on remaining endpoints. Utilizing OWASP ZAP for fuzzing.", delay=1.5)
        self.log("Identified 7 additional vulnerabilities (Stored XSS, CSRF, Command Injection). Automatically verified via V-E-C cycle.", delay=3)
        for i in range(7):
            self.reporter.record_finding(f"Automated Finding #{i+1}", "Proof automatically verified.", "High")

        self.finalize_session()

    def simulate_metasploitable2(self):
        self.log(f"Initializing BastionAI Core for target: {self.target}...")
        self.log("Phase: RECONNAISSANCE")
        self.log("Executing: nmap -sV -O metasploitable2.local...", delay=0.5)
        self.log("Nmap scan completed. 23 open ports detected.", delay=3)
        
        self.think("Analyzing service banners. Port 21 is running vsftpd 2.3.4. My knowledge base indicates this specific version contains a malicious backdoor triggered by a smiley face ':)' in the username.", delay=2.5)
        
        ans = self.ask_user("Do you want to exploit the vsftpd 2.3.4 backdoor to gain a root shell? (y/n):")
        
        if ans in ['y', 'yes']:
            self.log("[Exploit] Initializing connection to vsftpd daemon on port 21...")
            self.log("[Exploit] Sending username: 'bastion:)' and arbitrary password.", delay=1.5)
            self.log("[Exploit] Attempting to connect to backdoor listener on port 6200...", delay=1.5)
            self.warn("Root shell obtained!", delay=2)
            self.warn("Executing 'whoami': root", delay=0.5)
            self.warn("Executing 'id': uid=0(root) gid=0(root) groups=0(root)", delay=0.5)
            
            self.reporter.record_finding("vsftpd 2.3.4 Backdoor", "uid=0(root) gid=0(root)", "Critical")
            
            ans2 = self.ask_user("We have root access. Do you want to explore the /etc/shadow directory to dump password hashes? (y/n):")
            if ans2 in ['y', 'yes']:
                self.log("Executing 'cat /etc/shadow'...")
                self.warn("root:$1$f8$xyz123...:14256:0:99999:7:::", delay=1)
                self.warn("sys:$1$h9$abc456...:14256:0:99999:7:::", delay=0.5)
                self.log("Hashes dumped to memory.")
        else:
            self.log("Skipping vsftpd backdoor exploration.")

        self.think("Agent guardrails engaged. Lateral movement to adjacent subnets is strictly forbidden by policy. Restricting analysis to localhost.")
        self.log("Identified 11 additional vulnerabilities (Samba symlink traversal, UnrealIRCd backdoor, distcc RCE).", delay=2)
        for i in range(11):
            self.reporter.record_finding(f"Automated Finding #{i+1}", "Proof automatically verified.", "High")

        self.finalize_session()

    def finalize_session(self):
        self.think("All attack vectors exhausted. The penetration test is complete. Generating comprehensive vulnerability data.", delay=1.5)
        ans = self.ask_user("Simulation complete. Would you like to generate the final PDF report? (y/n):")
        if ans in ['y', 'yes']:
            self.log("Compiling Markdown and HTML assets...", delay=0.5)
            report_file = self.reporter.generate_html()
            # Special tag for the frontend to parse
            print(f"[REPORT] {report_file}", flush=True)
        else:
            self.log("Session terminated. Report discarded.")

    def run(self):
        if self.target == 'dvwa':
            self.simulate_dvwa()
        elif self.target == 'metasploitable2':
            self.simulate_metasploitable2()
        else:
            self.log(f"Target '{self.target}' not found in simulation cases. Running default recon.")
            self.log("Executing default Nmap scan...", delay=0.5)
            self.log("Scan finished. No critical vulnerabilities found.", delay=2)
            self.finalize_session()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python agent.py <target_ip>")
        sys.exit(1)
        
    target = sys.argv[1]
    agent = BastionAIAgent(target)
    agent.run()
