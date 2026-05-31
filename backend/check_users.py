import asyncio
import asyncpg
import ssl
import os

async def main():
    # Load .env manually to get credentials
    config = {}
    env_paths = [".env", "backend/.env", "../.env"]
    for path in env_paths:
        if os.path.exists(path):
            with open(path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        config[k.strip()] = v.strip()
            break
            
    user = config.get("user", "postgres")
    password = config.get("password")
    host = config.get("host", "localhost")
    port = int(config.get("port", "6543"))
    dbname = config.get("dbname", "postgres")
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    try:
        conn = await asyncpg.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database=dbname,
            ssl=ssl_context,
            statement_cache_size=0
        )
        print("Successfully connected!")
        
        # Check current columns in public.users table
        columns = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
            ORDER BY ordinal_position;
        """)
        print("\n=== COLUMNS IN 'public.users' TABLE ON SUPABASE ===")
        for col in columns:
            print(f"- {col['column_name']}: {col['data_type']}")
        print("============================================\n")
        
        await conn.close()
    except Exception as e:
        print("Error checking users columns:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
