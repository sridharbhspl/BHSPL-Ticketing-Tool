import psycopg2
import sys

# Defensively reconfigure console encoding to prevent charmap crashes on Windows with emojis
if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(errors='replace')
    except Exception:
        pass

def test_connection():
    print("🐘 Testing PostgreSQL connection diagnostics...")
    
    # Try 1: bavyadb
    try:
        print("🔍 Trying to connect to 'bavyadb' database...")
        conn = psycopg2.connect(
            dbname="bavyadb",
            user="postgres",
            password="Sridhar",
            host="localhost",
            port="5432",
            connect_timeout=3
        )
        print("✅ SUCCESS: Successfully connected to PostgreSQL database 'bavyadb' as user 'postgres'!")
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print(f"🖥️ Database Version: {db_version[0]}")
        cursor.close()
        conn.close()
        return True
    except psycopg2.OperationalError as e1:
        print(f"❌ Connection to 'bavyadb' failed: {e1}")
        
        # Try 2: postgres fallback
        try:
            print("\n🔍 Trying to connect to 'postgres' fallback database...")
            conn = psycopg2.connect(
                dbname="postgres",
                user="postgres",
                password="Sridhar",
                host="localhost",
                port="5432",
                connect_timeout=3
            )
            print("✅ SUCCESS: Successfully connected to PostgreSQL database 'postgres' as user 'postgres'!")
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()
            print(f"🖥️ Database Version: {db_version[0]}")
            cursor.close()
            conn.close()
            return True
        except psycopg2.OperationalError as e2:
            print("❌ ERROR: All connection attempts failed.", file=sys.stderr)
            print(f"📝 Diagnostic Details for 'postgres': {e2}", file=sys.stderr)
            print("\n💡 Troubleshooting Tips:", file=sys.stderr)
            print("1. Verify that your PostgreSQL server is currently running on localhost (127.0.0.1).", file=sys.stderr)
            print("2. Ensure the user 'postgres' exists and the password 'Sridhar' is correct.", file=sys.stderr)
            print("3. Check if password authentication is configured properly in pg_hba.conf.", file=sys.stderr)
            return False

if __name__ == "__main__":
    test_connection()
