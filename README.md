# Job Tracker API

### How to setup

> This if the first part of the installation for this project, the front end of this project is located at this [repository](https://github.com/Sanjero20/job-tracker)

```bash
git clone git@github.com:Sanjero20/job-tracker-api.git
mv job_tracker-api ./server
cd ./server
```

Create an <code>.env</code> file and insert the connection string from your hosting provider

```env
# For External hosting
POSTGRES_URL="connection_string"
PORT=8000

# For Local
DB_USER=""
DB_PASS=""
DB_NAME="job_tracker"
DB_HOST="localhost"
DB_PORT=5432

JWT_SECRET=""
JWT_SECRET_LIFE="1d"

# If you have a deployed front end put that instead
CLIENT_URL="http://localhost:5173"
```

> The system will prioritize connecting to external hosting over local hosting.
> If you want to run locally, dont put anything in the POSTGRES_URL.

### Using external hosted database

If you want to deploy the database externally, you can use the [database.sql](./src/config/database.sql) to initialize the tables

---

### Using local database

> Make sure that you already installed postgres on you local device

```
# Enter psql as super user
sudo -u postgres psql postgres
```

After entering the commands above your terminal should look like this:

Run the following commands to set up database locally,

```
postgres=#
```

Next

```
CREATE DATABASE job_tracker;
\q
```

Load the .sql file to generate the schema

```
psql -d job_tracker < ./src/config/database.sql
```

---

After setting up your <code>.env</code> and database, install the dependencies and start the server.

```bash
pnpm i
pnpm build && pnpm start
```
