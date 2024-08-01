# Use Python 3.7.9 as the base image
FROM python:3.7.9

# Set the working directory inside the container
WORKDIR /app

# Install the necessary Python packages
RUN pip install django \
    django-tailwind \
    'django-tailwind[reload]' \
    scikit-learn==0.23.2

# Copy the entire project into the container
COPY . /app

# Define the entry point for the container to run the Django development server
ENTRYPOINT ["python", "manage.py", "runserver"]
