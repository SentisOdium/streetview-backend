#!/bin/bash

# Load environment variables
source mysql.env

# Attempt to connect and check if 'node' table exists
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" "$MYSQL_DATABASE" -e "SHOW TABLES LIKE 'node';"
if [ $? -eq 0 ]; then
    echo "MySQL: Connection successful and 'node' table exists."
else
    echo "MySQL: Connection failed or 'node' table does not exist."
fi
