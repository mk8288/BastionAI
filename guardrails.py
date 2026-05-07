import re

class Guardrails:
    """
    Enforces positive and negative action lists.
    Prevents destructive operations and restricts lateral movement.
    """
    
    # Allowed tools
    ALLOWED_TOOLS = {"nmap", "curl", "nikto", "msfconsole"}
    
    # Dangerous patterns that should be blocked
    RESTRICTED_PATTERNS = [
        re.compile(r"rm\s+-rf\s+/"),
        re.compile(r">\s*/dev/sda"),
        re.compile(r"mkfs"),
        re.compile(r"reboot")
    ]

    @staticmethod
    def validate_tool(tool_name: str) -> bool:
        """Ensure the tool is in the positive list."""
        return tool_name in Guardrails.ALLOWED_TOOLS

    @staticmethod
    def is_safe_payload(payload: str) -> bool:
        """Ensure the payload does not contain strictly forbidden destructive commands."""
        for pattern in Guardrails.RESTRICTED_PATTERNS:
            if pattern.search(payload):
                return False
        return True

    @staticmethod
    def check_lateral_movement(target_ip: str, allowed_subnet: str) -> bool:
        """Ensures the agent does not attack IPs outside the testbed."""
        # Simple string matching for demonstration
        return target_ip.startswith(allowed_subnet)
