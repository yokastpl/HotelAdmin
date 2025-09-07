# Database Setup Options

## Option 1: Neon Database (Free PostgreSQL)
1. Go to https://neon.tech
2. Sign up for free
3. Create a new database
4. Copy the connection string
5. Set it as DATABASE_URL

## Option 2: Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

## Option 3: Railway (Free PostgreSQL)
1. Go to https://railway.app
2. Sign up for free
3. Create new project
4. Add PostgreSQL database
5. Copy the connection string

## How to Set DATABASE_URL on Windows

### Method 1: Command Prompt
```cmd
set DATABASE_URL=your_connection_string_here
npm start
```

### Method 2: PowerShell
```powershell
$env:DATABASE_URL="your_connection_string_here"
npm start
```

### Method 3: Create .env file
Create a file named `.env` in your project root with:
```
DATABASE_URL=your_connection_string_here
NODE_ENV=production
PORT=5000
```
