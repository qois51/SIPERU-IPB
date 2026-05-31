import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings

def test():
    print("=== SUPABASE CONFIG TEST ===")
    print("os.environ.get('SUPABASE_URL'):", os.environ.get("SUPABASE_URL"))
    print("os.environ.get('SUPABASE_KEY'):", os.environ.get("SUPABASE_KEY")[:10] + "..." if os.environ.get("SUPABASE_KEY") else "None")
    
    print("\nSettings Loaded:")
    print("settings.supabase_url:", settings.supabase_url)
    print("settings.supabase_key:", settings.supabase_key[:10] + "..." if settings.supabase_key else "None")
    
if __name__ == "__main__":
    test()
