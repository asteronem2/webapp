#!/bin/bash

psql -d webapp -c "DROP TABLE IF EXISTS alembic_version;"

alembic revision --autogenerate -m "new_revision"
alembic upgrade head