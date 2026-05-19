"""
Migration Script: Safely add new columns to bookings table
and create booking_facilities table.

This script uses ALTER TABLE to add columns without dropping existing data.
Run this ONCE after updating the model files.
"""
from app import create_app, db
from sqlalchemy import text, inspect

def migrate():
    app = create_app()
    with app.app_context():
        inspector = inspect(db.engine)
        existing_columns = [col['name'] for col in inspector.get_columns('bookings')]
        existing_tables = inspector.get_table_names()

        print("=== SIPERU-IPB Database Migration ===")
        print(f"Existing columns in 'bookings': {existing_columns}")
        print(f"Existing tables: {existing_tables}")

        # --- Add new columns to bookings table ---
        new_columns = {
            'booking_code': 'VARCHAR(20) UNIQUE',
            'nama_peminjam': 'VARCHAR(100)',
            'nim_nip': 'VARCHAR(30)',
            'program_studi': 'VARCHAR(100)',
            'email': 'VARCHAR(100)',
            'nomor_hp': 'VARCHAR(20)',
            'jenis_kegiatan': 'VARCHAR(100)',
            'deskripsi_kegiatan': 'TEXT',
            'surat_file': 'VARCHAR(500)',
            'qr_code': 'VARCHAR(500)',
            'notes': 'TEXT',
            'updated_at': 'TIMESTAMP DEFAULT NOW()',
        }

        added = 0
        for col_name, col_type in new_columns.items():
            if col_name not in existing_columns:
                sql = f"ALTER TABLE bookings ADD COLUMN {col_name} {col_type}"
                db.session.execute(text(sql))
                print(f"  ✅ Added column: {col_name} ({col_type})")
                added += 1
            else:
                print(f"  ⏭️  Column '{col_name}' already exists, skipping.")

        # --- Generate booking_code for existing rows that don't have one ---
        db.session.execute(text("""
            UPDATE bookings
            SET booking_code = 'BK-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || LPAD(id::TEXT, 4, '0')
            WHERE booking_code IS NULL
        """))
        print("  ✅ Generated booking_code for existing rows.")

        # --- Create booking_facilities table if not exists ---
        if 'booking_facilities' not in existing_tables:
            db.session.execute(text("""
                CREATE TABLE booking_facilities (
                    id SERIAL PRIMARY KEY,
                    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                    facility_name VARCHAR(100) NOT NULL
                )
            """))
            print("  ✅ Created table: booking_facilities")
        else:
            print("  ⏭️  Table 'booking_facilities' already exists, skipping.")

        db.session.commit()
        print(f"\n=== Migration complete! ({added} columns added) ===")

        # --- Verify ---
        updated_columns = [col['name'] for col in inspector.get_columns('bookings')]
        print(f"Updated columns in 'bookings': {updated_columns}")

        # Check existing data is intact
        result = db.session.execute(text("SELECT COUNT(*) FROM bookings")).scalar()
        print(f"Existing bookings preserved: {result} rows")

        result = db.session.execute(text("SELECT id, booking_code, activity_name, status FROM bookings")).fetchall()
        for row in result:
            print(f"  Booking #{row[0]}: code={row[1]}, activity={row[2]}, status={row[3]}")


if __name__ == '__main__':
    migrate()
