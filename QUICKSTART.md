# Quick Start Guide

## Development Setup

### 1. Environment Configuration

The application needs an environment variable for S3 receipt uploads:

```bash
# Copy the example environment file
cp .env.example .env
```

The `.env` file has been created with a placeholder URL. You have two options:

#### Option A: Skip S3 Setup (Development Only)
- The current `.env` has a placeholder URL
- Receipt upload will show an error but won't break the application
- You can still test all other features

#### Option B: Full S3 Setup (Production Ready)
Follow the complete setup guide in `backend/README_S3_SETUP.md` to:
1. Create an S3 bucket
2. Deploy the presign Lambda function
3. Set up API Gateway
4. Update `VITE_RECEIPT_PRESIGN_URL` in `.env` with your actual endpoint

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Recent Changes

### Button Improvements
- ✅ "Choose Plan" and "Continue" buttons now scroll to top
- ✅ Continue and Back buttons have more compact styling

### S3 Receipt Storage
- ✅ Backend prepared for S3 receipt uploads
- ✅ Database schema includes receipt storage fields
- ⏳ Requires AWS setup (optional for development)

## Database Setup

If you're setting up the backend database, run the migration:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < backend/database_migration.sql
```

This adds the following columns to `partner_applications`:
- `receipt_storage_key` - S3 key for the uploaded receipt
- `receipt_file_name` - Original filename
- `total_payable` - Partnership tier amount

## Need Help?

- **S3 Setup**: See `backend/README_S3_SETUP.md`
- **API Issues**: Check that environment variables are set correctly
- **Database**: Run the migration script in `backend/database_migration.sql`
