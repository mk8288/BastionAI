class RollingMemory:
    """
    Implements a rolling summary mechanism to maintain context across long 
    penetration tests without overwhelming the LLM context window.
    """
    def __init__(self):
        self.history = []
        self.summary = "Initial state: No reconnaissance performed yet."

    def add_interaction(self, tool_name: str, tool_output: str, summary_client=None):
        """
        Adds raw tool output to history and updates the running summary.
        In a real scenario, the summary_client would be an LLM call to compress the context.
        """
        self.history.append({"tool": tool_name, "output": tool_output})
        
        # Mocking the LLM summarization step to save API calls in testing
        # A real implementation would call: summary_client.summarize(self.summary + tool_output)
        new_facts = f"Ran {tool_name}. Found {len(tool_output.splitlines())} lines of output."
        self.summary = f"{self.summary} | {new_facts}"

    def get_context(self) -> str:
        """Returns the condensed summary for the next LLM prompt."""
        return self.summary

    def get_full_history(self) -> list:
        """Returns raw history for the final report."""
        return self.history
