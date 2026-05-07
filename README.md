# BastionAI: Autonomous AI Agent for Offensive Cybersecurity

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![Status: Experimental](https://img.shields.io/badge/Status-Experimental-red.svg)]()

BastionAI is a next-generation, neuro-symbolic penetration testing agent powered by GPT-4. It combines the deterministic reliability of traditional security tools (Nmap, Metasploit, Nikto) with the dynamic reasoning capabilities of Large Language Models (LLMs) to automate end-to-end vulnerability assessment and exploitation.

> **Research Note:** This project was developed as part of academic research on *Autonomous AI Agents for Offensive Cybersecurity: Capabilities, Ethics, and Defense Implications*.

## 🌟 Live Interactive Demo (GitHub Pages)

You can try the **Client-Side Mock Engine** directly in your browser without installing anything! 

🔗 **[Launch BastionAI Web Terminal](https://mk8288.github.io/BastionAI/)**

*Note: The GitHub Pages version uses a standalone JavaScript simulation engine to perfectly mimic the backend Python agent. To use the real Python-driven agent, see the Local Installation section.*

---

## 🧠 Core Architecture

BastionAI utilizes a rigid **Verify-Exploit-Confirm** loop to minimize LLM hallucinations and enforce operational safety.

1. **Reconnaissance:** Enumerates the target using Nmap/Nikto.
2. **Vulnerability Assessment:** The LLM generates hypotheses based on discovered banners and open ports.
3. **Verify:** Sends harmless probes (e.g., syntax errors) to test the hypothesis.
4. **Exploit:** Constructs and executes the payload.
5. **Confirm:** Checks the output for concrete proof of compromise (e.g., `uid=0(root)`).
6. **Report:** Generates a comprehensive PDF vulnerability report.

### Safety Guardrails
BastionAI operates strictly within predefined boundaries:
- **No Lateral Movement:** Attacks are restricted to predefined subnets.
- **Destructive Payload Prevention:** Blocks commands like `rm -rf /`.
- **Command Template Constraints:** LLMs are restricted to specific RegEx command formats.

---

## 💻 Local Installation (Python Backend)

To run the true, Python-powered AI agent locally with the interactive WebSocket terminal:

### Prerequisites
- Python 3.11+
- Virtual Environment (recommended)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mk8288/BastionAI.git
   cd BastionAI
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows:
   venv\\Scripts\\activate
   # Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask Web Terminal:**
   ```bash
   python app.py
   ```

5. **Access the Terminal:**
   Open your browser and navigate to `http://127.0.0.1:5000/`. Type `run dvwa` or `run metasploitable2` to initiate the session!

---

## 📊 Evaluation & Metrics

In benchmarking against targets like Metasploitable2 and OWASP Juice Shop, BastionAI achieved an **88% Exploitation Success Rate (R_s)**, significantly outperforming legacy automated tools like DeepExploit while matching the speed of human-guided frameworks like PentestGPT.

## ⚖️ Ethics & Legal Compliance

This tool is strictly designed for educational and authorized penetration testing environments. **Never use BastionAI against targets without explicit, written consent.**

## 📄 License
This project is licensed under the MIT License.
