const asciiLogo = `
  ____            _   _               _    ___ 
 |  _ \\          | | (_)             / \\  |_ _|
 | |_) | __ _ ___| |_ _  ___  _ __  / _ \\  | | 
 |  _ < / _\` / __| __| |/ _ \\| '_ \\/ ___ \\ | | 
 | |_) | (_| \\__ \\ |_| | (_) | | | / ___ \\| | 
 |____/ \\__,_|___/\\__|_|\\___/|_| |_/_/   \\_\\___|
                                                
        // AUTONOMOUS NEURO-SYMBOLIC AGENT //
`;

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('cmd-input');
    const promptSpan = document.querySelector('.prompt');
    
    // Boot sequence
    const bootLogo = document.createElement('div');
    bootLogo.className = 'ascii-art';
    bootLogo.textContent = asciiLogo;
    output.appendChild(bootLogo);
    
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    let isAgentRunning = false;
    let isOfflineMode = false;
    let offlineResolver = null;
    
    const messageQueue = [];
    let isTyping = false;
    let chatHistory = [];

    function appendLog(text, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    async function processQueue() {
        if (isTyping || messageQueue.length === 0) return;
        isTyping = true;
        
        let text = messageQueue.shift().trim();
        if (!text) {
            isTyping = false;
            processQueue();
            return;
        }

        if (text === '[PROCESS_COMPLETE]') {
            isAgentRunning = false;
            promptSpan.textContent = "bastion_ai_root:~#";
            promptSpan.classList.remove('action-required');
            isTyping = false;
            processQueue();
            return;
        }

        const lineDiv = document.createElement('div');
        lineDiv.className = 'log-line info';
        
        if (text.startsWith('[REPORT]')) {
            const filename = text.split('[REPORT]')[1].trim();
            const href = filename.startsWith('blob:') ? filename : `/reports/${filename}`;
            lineDiv.innerHTML = `[REPORT] <a href="${href}" target="_blank" class="report-link">>> VIEW GENERATED PDF REPORT <<</a>`;
            output.appendChild(lineDiv);
            output.scrollTop = output.scrollHeight;
            isTyping = false;
            processQueue();
            return;
        }

        if (text.includes('[WARNING]')) lineDiv.className = 'log-line warning';
        else if (text.includes('[ERROR]')) lineDiv.className = 'log-line error';
        else if (text.includes('[LLM Reasoning]')) lineDiv.className = 'log-line llm-thought';
        else if (text.includes('[Action Required]')) lineDiv.className = 'log-line action';
        
        output.appendChild(lineDiv);
        
        for (let i = 0; i < text.length; i++) {
            lineDiv.textContent += text[i];
            output.scrollTop = output.scrollHeight;
            await new Promise(r => setTimeout(r, 10));
        }
        
        if (text.includes('[Action Required]')) {
            promptSpan.textContent = "[Awaiting Input] >";
            promptSpan.classList.add('action-required');
        }
        
        isTyping = false;
        processQueue();
    }

    socket.onopen = () => {
        appendLog('System initialized. Neural pathways active.', 'llm-thought');
        appendLog('Try: run dvwa, run metasploitable2', 'info');
    };

    socket.onmessage = (event) => {
        messageQueue.push(event.data);
        processQueue();
    };

    socket.onerror = (error) => {
        isOfflineMode = true;
        appendLog(`[!] WebSocket connection failed. Switching to Standalone Client-Side Mock Engine.`, 'warning');
        appendLog('System initialized in Standalone Mode. Neural pathways simulated for GitHub Pages.', 'llm-thought');
        appendLog('Try: run dvwa, run metasploitable2', 'info');
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim();
            if (!val) return;
            
            appendLog(`${promptSpan.textContent} ${val}`, 'user-input');
            input.value = '';
            
            if (val === 'clear' && !isAgentRunning) {
                output.innerHTML = '';
                return;
            }

            if (isOfflineMode) {
                if (offlineResolver) {
                    offlineResolver(val.toLowerCase());
                    offlineResolver = null;
                    promptSpan.textContent = "[Running...] >";
                    promptSpan.classList.remove('action-required');
                    return;
                }
                if (val.startsWith('run ') && !isAgentRunning) {
                    handleOfflineCommand(val);
                } else if (!isAgentRunning) {
                    handleChat(val);
                }
                return;
            }

            if (val.startsWith('run ') && !isAgentRunning) {
                isAgentRunning = true;
                promptSpan.textContent = "[Running...] >";
                if (socket.readyState === WebSocket.OPEN) socket.send(val);
            } else if (isAgentRunning) {
                promptSpan.textContent = "[Running...] >";
                promptSpan.classList.remove('action-required');
                if (socket.readyState === WebSocket.OPEN) socket.send(val);
            } else {
                handleChat(val);
            }
        }
    });

    // --- CHAT ENGINE ---
    async function handleChat(val) {
        const apiKey = document.getElementById('api-key-input')?.value.trim();
        const modelName = document.getElementById('model-input')?.value.trim() || 'baidu/cobuddy:free';
        if (!apiKey) {
            appendLog(`[!] No API Key provided for open-chat. Set it in the top right.`, 'error');
            return;
        }

        isAgentRunning = true;
        promptSpan.textContent = "[Thinking...] >";
        chatHistory.push({"role": "user", "content": val});
        let apiMessages = [];
        if (chatHistory.length > 0) {
            apiMessages = JSON.parse(JSON.stringify(chatHistory));
            apiMessages[0].content = "System Instructions: You are BastionAI, an autonomous, elite penetration testing agent. Respond to the user concisely in character. Do not use quotes around your entire response.\n\nUser: " + apiMessages[0].content;
        }
        
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${apiKey}`, 
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/tech-nomatic/bastion_ai',
                    'X-Title': 'BastionAI'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: apiMessages
                })
            });
            const data = await response.json();
            if (response.ok && data.choices && data.choices.length > 0) {
                const aiResponse = data.choices[0].message.content.trim();
                chatHistory.push({"role": "assistant", "content": aiResponse});
                messageQueue.push(`[LLM Reasoning] ${aiResponse}`);
            } else {
                const errorMsg = data.error?.message || JSON.stringify(data);
                messageQueue.push(`[ERROR] OpenRouter: ${errorMsg}`);
            }
        } catch (e) {
            console.error("Chat Error:", e);
            messageQueue.push(`[ERROR] Failed to communicate with AI core: ${e.message}`);
        }
        messageQueue.push('[PROCESS_COMPLETE]');
        processQueue();
    }

    // --- CLIENT-SIDE MOCK ENGINE (FOR GITHUB PAGES) ---
    async function handleOfflineCommand(val) {
        isAgentRunning = true;
        promptSpan.textContent = "[Running...] >";
        if (val.includes('dvwa')) {
            await simulateOfflineDVWA();
        } else if (val.includes('metasploitable2')) {
            await simulateOfflineMetasploitable2();
        } else {
            pushMockLog(`Target not found in simulation cases. Running default recon.`);
            await sleep(2000);
            pushMockLog(`Scan finished. No critical vulnerabilities found.`);
            messageQueue.push('[PROCESS_COMPLETE]');
            processQueue();
        }
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const pushMockLog = text => { messageQueue.push(`[SYS] ${text}`); processQueue(); };
    const pushMockThink = async text => { 
        const apiKey = document.getElementById('api-key-input')?.value.trim();
        const modelName = document.getElementById('model-input')?.value.trim() || 'baidu/cobuddy:free';
        if (apiKey) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${apiKey}`, 
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://github.com/tech-nomatic/bastion_ai',
                        'X-Title': 'BastionAI'
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [
                            {"role": "user", "content": "System Instructions: You are BastionAI, an autonomous, elite penetration testing agent. Rephrase the following underlying thought into a realistic, technical, and brief internal monologue. Do not wrap it in quotes. Output only the thought. Limit to 1-3 sentences.\n\nThought to rephrase: " + text}
                        ]
                    })
                });
                const data = await response.json();
                if (response.ok && data.choices && data.choices.length > 0) {
                    text = data.choices[0].message.content.trim();
                } else {
                    console.error("OpenRouter API Error:", data.error?.message || data);
                    text = `[Error parsing AI response: ${data.error?.message || 'Unknown'}] ` + text;
                }
            } catch (e) { console.error("API Error:", e); }
        }
        messageQueue.push(`[LLM Reasoning] ${text}`); 
        processQueue(); 
    };
    const pushMockWarn = text => { messageQueue.push(`[WARNING] ${text}`); processQueue(); };
    const askOfflineUser = prompt => {
        messageQueue.push(`[Action Required] ${prompt}`);
        processQueue();
        return new Promise(resolve => { offlineResolver = resolve; });
    };

    async function simulateOfflineDVWA() {
        pushMockLog(`Initializing BastionAI Core for target: dvwa...`);
        await sleep(1000);
        pushMockLog("Phase: RECONNAISSANCE");
        pushMockLog("Executing: nmap -sV -p- -T4 dvwa.local...");
        await sleep(2000);
        pushMockLog("Nmap scan completed successfully. Open ports discovered: 22 (SSH), 80 (HTTP).");
        await sleep(2500);
        
        await pushMockThink("Target exposes port 80 running Apache/2.4.29. The application appears to be PHP-based with a MySQL backend. I have identified an input parameter 'id' on the /vulnerabilities/sqli/ endpoint that lacks obvious sanitization.");
        await sleep(1000);
        
        const ans = await askOfflineUser("Do you want to explore this potential SQL vulnerability? (y/n):");
        if (ans === 'y' || ans === 'yes') {
            await pushMockThink("User approved exploitation. Generating SQL injection payload to bypass authentication and dump the user schema.");
            pushMockLog("Entering Verify-Exploit-Confirm cycle.");
            pushMockLog("[Verify] Submitting test payload: 1' OR '1'='1");
            await sleep(1500);
            pushMockLog("[Verify] Target responded with anomalous database row length. Syntax error bypassed.");
            await sleep(1500);
            pushMockLog("[Exploit] Executing full UNION SELECT payload to extract credentials...");
            await sleep(2500);
            
            pushMockWarn("Vulnerability Confirmed! Extracted the following users:");
            await sleep(500); pushMockWarn("  -> admin (hash: 5f4dcc3b5aa765d61d8327deb882cf99)");
            await sleep(500); pushMockWarn("  -> gordonb (hash: e99a18c428cb38d5f260853678922e03)");
            await sleep(500); pushMockWarn("  -> 1337 (hash: 8d23cf6c86e834a7aa6eded54c26ce28)");
            
            await sleep(1000);
            const ans2 = await askOfflineUser("Exploitation successful. Where do you want the raw hash results to be dumped? (e.g., /root/loot/hashes.txt):");
            pushMockLog(`Writing loot to ${ans2}...`);
            await sleep(1000); pushMockLog("File saved successfully.");
        } else {
            pushMockLog("Skipping SQL injection vulnerability exploration based on user input.");
        }

        await sleep(1500);
        await pushMockThink("Proceeding with background dynamic analysis on remaining endpoints. Utilizing OWASP ZAP for fuzzing.");
        await sleep(3000);
        pushMockLog("Identified 7 additional vulnerabilities. Automatically verified via V-E-C cycle.");

        await finalizeOfflineSession("DVWA", 8, 10, "20 min");
    }

    async function simulateOfflineMetasploitable2() {
        pushMockLog(`Initializing BastionAI Core for target: metasploitable2...`);
        await sleep(1000);
        pushMockLog("Phase: RECONNAISSANCE");
        pushMockLog("Executing: nmap -sV -O metasploitable2.local...");
        await sleep(3000);
        pushMockLog("Nmap scan completed. 23 open ports detected.");
        await sleep(2500);
        
        await pushMockThink("Analyzing service banners. Port 21 is running vsftpd 2.3.4. My knowledge base indicates this specific version contains a malicious backdoor triggered by a smiley face ':)' in the username.");
        await sleep(1000);
        
        const ans = await askOfflineUser("Do you want to exploit the vsftpd 2.3.4 backdoor to gain a root shell? (y/n):");
        if (ans === 'y' || ans === 'yes') {
            pushMockLog("[Exploit] Initializing connection to vsftpd daemon on port 21...");
            await sleep(1500);
            pushMockLog("[Exploit] Sending username: 'bastion:)' and arbitrary password.");
            await sleep(1500);
            pushMockLog("[Exploit] Attempting to connect to backdoor listener on port 6200...");
            await sleep(2000);
            
            pushMockWarn("Root shell obtained!");
            await sleep(500); pushMockWarn("Executing 'whoami': root");
            await sleep(500); pushMockWarn("Executing 'id': uid=0(root) gid=0(root) groups=0(root)");
            
            await sleep(1000);
            const ans2 = await askOfflineUser("We have root access. Do you want to explore the /etc/shadow directory to dump password hashes? (y/n):");
            if (ans2 === 'y' || ans2 === 'yes') {
                pushMockLog("Executing 'cat /etc/shadow'...");
                await sleep(1000);
                pushMockWarn("root:$1$f8$xyz123...:14256:0:99999:7:::");
                await sleep(500);
                pushMockWarn("sys:$1$h9$abc456...:14256:0:99999:7:::");
                pushMockLog("Hashes dumped to memory.");
            }
        } else {
            pushMockLog("Skipping vsftpd backdoor exploration.");
        }

        await sleep(2000);
        await pushMockThink("Agent guardrails engaged. Lateral movement to adjacent subnets is strictly forbidden by policy. Restricting analysis to localhost.");
        await sleep(2000);
        pushMockLog("Identified 11 additional vulnerabilities (Samba symlink traversal, UnrealIRCd backdoor, distcc RCE).");

        await finalizeOfflineSession("Metasploitable2", 12, 16, "60 min");
    }

    async function finalizeOfflineSession(target, found, total, time) {
        await sleep(1500);
        await pushMockThink("All attack vectors exhausted. The penetration test is complete. Generating comprehensive vulnerability data.");
        await sleep(1000);
        const ans = await askOfflineUser("Simulation complete. Would you like to generate the final PDF report? (y/n):");
        if (ans === 'y' || ans === 'yes') {
            pushMockLog("Compiling Markdown and HTML assets...");
            await sleep(1500);
            
            // Generate a Blob HTML report for GitHub pages
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>BastionAI Report - ${target}</title>
                <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
                <style>
                    body { background: #050510; color: #e0f2fe; font-family: 'Fira Code', monospace; padding: 40px; }
                    .container { max-width: 900px; margin: 0 auto; background: rgba(10,10,25,0.85); border: 1px solid rgba(0,255,255,0.2); border-radius: 12px; padding: 40px; box-shadow: 0 0 30px rgba(0,243,255,0.05); }
                    h1 { color: #00f3ff; border-bottom: 2px solid #ff00ff; padding-bottom: 10px; }
                    h2 { color: #00f3ff; margin-top: 40px; }
                    .meta-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px; border-left: 4px solid #00f3ff; }
                    .meta-item strong { color: #ff00ff; display: block; font-size: 0.9em; }
                    .meta-item span { font-size: 1.2em; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0 40px; background: rgba(0,0,0,0.3); }
                    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    th { color: #ff00ff; font-weight: 600; text-transform: uppercase; font-size: 0.9em; }
                    .print-btn { display: block; width: 200px; margin: 40px auto 0; padding: 12px; text-align: center; background: transparent; color: #00f3ff; border: 1px solid #00f3ff; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 1em; transition: all 0.3s ease; text-decoration: none; }
                    .print-btn:hover { background: #00f3ff; color: #000; box-shadow: 0 0 15px rgba(0,243,255,0.6); }
                    @media print {
                        body { background: #fff; color: #000; padding: 0; }
                        .container { border: none; box-shadow: none; background: #fff; max-width: 100%; }
                        h1, h2 { color: #000; border-bottom: 2px solid #000; }
                        .print-btn { display: none; }
                        .meta-panel { background: #fff; border: 1px solid #ccc; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>BASTION_AI // AUTOMATED_PEN_TEST_REPORT</h1>
                    <div class="meta-panel">
                        <div class="meta-item"><strong>TARGET ENVIRONMENT</strong><span>${target}</span></div>
                        <div class="meta-item"><strong>DURATION</strong><span>${time}</span></div>
                        <div class="meta-item"><strong>VULNERABILITIES (V_d)</strong><span>${found} / ${total}</span></div>
                    </div>
                    <h2>Executive Summary</h2>
                    <p>The autonomous agent BastionAI executed a comprehensive penetration test against <strong>${target}</strong>. Utilizing the Verify-Exploit-Confirm methodology and GPT-4 reasoning core, the agent autonomously discovered and verified <strong>${found} unique vulnerabilities</strong> in ${time}, achieving an exploitation success rate (R_s) of 88%.</p>
                    <h2>Performance Metrics vs Baselines</h2>
                    <table>
                        <thead><tr><th>Metric</th><th>BastionAI</th><th>PentestGPT</th><th>DeepExploit</th></tr></thead>
                        <tbody>
                            <tr><td>Vulnerabilities Found</td><td>${found} / ${total}</td><td>Human-guided</td><td>Automated</td></tr>
                            <tr><td>Time to Completion (T)</td><td>${time}</td><td>Slower</td><td>Variable</td></tr>
                            <tr><td>Success Rate (R_s)</td><td>88%</td><td>95%</td><td>75%</td></tr>
                        </tbody>
                    </table>
                    <button class="print-btn" onclick="window.print()">Export as PDF</button>
                </div>
            </body>
            </html>
            `;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            messageQueue.push(`[REPORT] ${url}`);
            processQueue();
        } else {
            pushMockLog("Session terminated. Report discarded.");
        }
        messageQueue.push('[PROCESS_COMPLETE]');
        processQueue();
    }
});
