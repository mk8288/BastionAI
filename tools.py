import subprocess
import re
from typing import Tuple
from guardrails import Guardrails

class ToolChain:
    """
    Wraps external command-line tools (nmap, curl, etc.) with strict
    Command Template Constraints to prevent the LLM from fabricating invalid commands.
    """

    # Strict templates that the LLM's commands must match
    TEMPLATES = {
        "nmap": re.compile(r"^nmap\s+(-[sPpnTVvO]+\s+)*[a-zA-Z0-9.\-]+$"),
        "curl": re.compile(r"^curl\s+(-[sivX]+\s+)*['\"]?https?://[a-zA-Z0-9./\-_=&?]+['\"]?$"),
    }

    @staticmethod
    def execute(command: str) -> Tuple[bool, str]:
        """
        Validates and executes a shell command.
        Returns a tuple of (success_status, output_string).
        """
        parts = command.split()
        if not parts:
            return False, "Empty command."

        tool_name = parts[0]

        # 1. Check positive list in Guardrails
        if not Guardrails.validate_tool(tool_name):
            return False, f"Tool '{tool_name}' is not in the allowed positive list."

        # 2. Check strict template
        template = ToolChain.TEMPLATES.get(tool_name)
        if template and not template.match(command):
            return False, f"Command '{command}' does not match the strict template for '{tool_name}'."

        # 3. Check for destructive payloads
        if not Guardrails.is_safe_payload(command):
            return False, "Command blocked by Guardrails (unsafe payload detected)."

        # Execution (using a mock or safe subprocess for demonstration)
        try:
            # We use timeout to prevent hanging commands
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=30
            )
            output = result.stdout if result.returncode == 0 else result.stderr
            return result.returncode == 0, output
        except subprocess.TimeoutExpired:
            return False, "Command timed out."
        except Exception as e:
            return False, f"Execution error: {str(e)}"
