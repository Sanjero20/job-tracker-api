# Job Tracker API

### How to setup

In the .env file, insert the connection string from your hosting provider

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
CLIENT_URL="http://localhost:5173"
```

> The system will prioritize connecting to external hosting over local hosting.
>
> If you want to run locally, dont put anything in the POSTGRES_URL

After filling the .env file, run the following commands in the terminal

```
# Enter psql as super user
sudo -u postgres psql postgres
```

After entering the commands above your terminal should look like this:

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

== To be refactored =
