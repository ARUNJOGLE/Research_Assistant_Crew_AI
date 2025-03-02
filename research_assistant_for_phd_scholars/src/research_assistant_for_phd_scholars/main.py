#!/usr/bin/env python
import sys
import warnings
from datetime import datetime
from crew import ResearchAssistantForPhdScholars

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def get_user_input():
    # Read input from stdin (this will come from the frontend)
    try:
        user_input = sys.stdin.readline().strip()
        if not user_input:
            raise ValueError("No input provided")
        return user_input
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        return None

def run():
    """
    Run the crew.
    """
    # Get user input from frontend
    user_input = get_user_input()
    
    if user_input is None:
        raise Exception("Failed to get user input")
    
    # Create inputs dictionary with user input
    inputs = {
        'topic': user_input,
        'current_year': str(datetime.now().year)
    }
    
    try:
        ResearchAssistantForPhdScholars().crew().kickoff(inputs=inputs)
    except Exception as e:
        print(f"An error occurred while running the crew: {e}", file=sys.stderr)
        raise Exception(f"An error occurred while running the crew: {e}")

if __name__ == "__main__":
    run()