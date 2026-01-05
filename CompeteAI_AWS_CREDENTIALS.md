# AWS Credentials Configuration

## Your AWS Account Details
- **Account ID**: 601957173510
- **IAM Username**: delveinsight-ai
- **Password**: Puqsun-hyfpaf-3bubsi

## Setup Instructions

### Step 1: Configure AWS CLI
```bash
aws configure
```

When prompted, enter:
- AWS Access Key ID: [Get from AWS Console → IAM → Security credentials → Create access key]
- AWS Secret Access Key: [Generated with Access Key]
- Default region name: us-east-1
- Default output format: json

### Step 2: Get Access Keys
1. Go to: https://console.aws.amazon.com/iam/
2. Click "Users" → "delveinsight-ai"
3. Click "Security credentials" tab
4. Scroll to "Access keys"
5. Click "Create access key"
6. Choose "Command Line Interface (CLI)"
7. Download or copy the keys

### Step 3: Store in .env (for Node.js/Prisma)
Add to `.env.local`:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

### Step 4: Verify Connection
```bash
aws sts get-caller-identity
```

Should return your account details.

## What We'll Use AWS For
- **Phase 1 (NOW)**: Vercel Postgres (no AWS needed initially!)
- **Phase 2**: AWS S3 for file storage (exports, CSVs)
- **Phase 3**: AWS Lambda for heavy data processing

## Current Architecture
```
Frontend → Vercel (FREE)
Database → Vercel Postgres (FREE)
APIs → Next.js API Routes (FREE)
```

**No AWS costs for MVP!**

