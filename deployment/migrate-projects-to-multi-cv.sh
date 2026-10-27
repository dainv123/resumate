#!/bin/bash
# Migration script: Convert isAddedToCv (boolean) to cvIds (array) in projects table

DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USERNAME:-"postgres"}
DB_NAME=${DB_NAME:-"postgres"}

echo "Starting migration: isAddedToCv → cvIds for projects table..."
echo "Connecting to: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

# SQL commands to execute
SQL_COMMANDS="
DO \$\$
BEGIN
    -- Step 1: Add new cvIds column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'cvIds') THEN
        ALTER TABLE projects ADD COLUMN \"cvIds\" text[] DEFAULT '{}';
        RAISE NOTICE 'Added cvIds column to projects table.';
    ELSE
        RAISE NOTICE 'cvIds column already exists.';
    END IF;

    -- Step 2: Drop old isAddedToCv column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'isAddedToCv') THEN
        ALTER TABLE projects DROP COLUMN \"isAddedToCv\";
        RAISE NOTICE 'Dropped isAddedToCv column from projects table.';
    ELSE
        RAISE NOTICE 'isAddedToCv column does not exist.';
    END IF;

    RAISE NOTICE 'Migration completed successfully!';
END
\$\$;
"

# Execute SQL commands
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$SQL_COMMANDS"

if [ $? -eq 0 ]; then
  echo "✅ Database migration executed successfully."
  echo ""
  echo "Note: Existing projects will have empty cvIds arrays."
  echo "Users can now add projects to multiple CVs using the new 'Manage CVs' feature."
else
  echo "❌ Error executing database migration."
  exit 1
fi

