# Database Migrations

This directory contains SQL migration scripts for the wedding form application database.

## Running Migrations

To apply a migration, connect to your MySQL database and run:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> < migrations/migration_file.sql
```

Or using the MySQL client:

```sql
SOURCE /path/to/migration_file.sql;
```

## Available Migrations

### add_pdf_url_to_wedding_forms.sql
Adds a `pdf_url` column to the `wedding_forms` table to store the S3 URL of generated PDFs.

**Required for:** Storing PDF URLs in the database after submission

**Run this migration if:**
- You're upgrading from a version without PDF URL storage
- The `wedding_forms` table doesn't have a `pdf_url` column

**To verify if migration is needed:**
```sql
DESCRIBE wedding_forms;
```

If you don't see `pdf_url` in the output, run this migration.

## Migration History

| Date | Migration File | Description |
|------|----------------|-------------|
| 2025-11-20 | add_pdf_url_to_wedding_forms.sql | Add pdf_url column to wedding_forms table |
