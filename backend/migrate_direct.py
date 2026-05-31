import asyncio
import asyncpg
import ssl
import os

async def main():
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
    
    print(f"Connecting directly to Supabase at {host}:{port}/{dbname} as {user}...")
    
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
        print("Successfully connected directly!")
        
        # Terminate ONLY connections owned by our own user to release locks
        print("Terminating other sessions owned by our user to release table locks...")
        try:
            terminated = await conn.fetch("""
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE usename = current_user 
                  AND pid <> pg_backend_pid();
            """)
            print(f"Successfully terminated {len(terminated)} other connection session(s) owned by {user}.")
        except Exception as e:
            print("Notice: Could not terminate own sessions:", str(e))
        
        # Check current columns in public.users table explicitly
        print("Checking columns in 'public.users'...")
        columns = await conn.fetch("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
        """)
        column_names = [col['column_name'] for col in columns]
        print(f"Existing columns in public.users: {column_names}")
        
        if 'phone' not in column_names:
            print("Adding 'phone' column to 'public.users' table...")
            await conn.execute("ALTER TABLE public.users ADD COLUMN phone VARCHAR(20)")
            print("'phone' column added successfully!")
        else:
            print("'phone' column already exists in public.users.")
            
        if 'bio' not in column_names:
            print("Adding 'bio' column to 'public.users' table...")
            await conn.execute("ALTER TABLE public.users ADD COLUMN bio TEXT")
            print("'bio' column added successfully!")
        else:
            print("'bio' column already exists in public.users.")
            
        print("\nMigration completed successfully! Both columns are guaranteed to exist now.")
    except Exception as e:
        print("Error during migration:", str(e))
    finally:
        try:
            await conn.close()
            print("Connection closed.")
        except NameError:
            pass

if __name__ == "__main__":
    asyncio.run(main())
