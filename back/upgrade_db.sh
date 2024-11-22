#!/bin/bash

alembic revision --autogenerate -m "new_revision"
alembic upgrade head