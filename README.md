# Project Setup

Clone the repo and follow these steps to set up the project on your local machine:
First, run the development server:


## 1. Install Dependencies

```bash
npm install
# or
yarn install 
# or
pnpm install
# or
bun install 
```

## 2. Configure environment variables

1. Create a new file named `.env` in the project root.
2. Copy the contents of `.env.example` into `.env`:

   ```bash
   cp .env.example .env
3. Open `.env` in your editor and update the values to match your local environment (e.g., database credentials, API keys, ports).  ```

## 3. Run database migrations

You have two options to apply the database schema:

### a) Using the MySQL client

1. Change into the `migrations` directory (if needed):
   ```bash
   cd migrations
   ```
2. Run the schema file against your local database. Replace `username`, `database_name`, and provide your MySQL password when prompted:
   ```bash
   mysql -h localhost -u username -p database_name < schema.sql
   ```

### b) Using the npm script

```bash
npm run migration
```

Both commands will create the necessary tables and seed any default data.


## 4. Start the development server

Finally, launch the app in development mode:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
