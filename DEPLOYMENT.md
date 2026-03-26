# Deployment Guide (Render.com)

Since the application is configured as a **Single-URL Deployment** (the Flask backend serves the Angular frontend), deploying is incredibly easy!

## Step 1: Prepare the Repository
We have added a `render-build.sh` script to your project. This script tells the deployment server how to build both the Angular frontend and the Python backend at the same time.

## Step 2: Create a Render Account
1. Go to [Render](https://render.com/) and create a free account.
2. Link your GitHub account.

## Step 3: Deploy the Web Service
1. Click the **New +** button in the top right corner and select **Web Service**.
2. Select your `thirdpartyorganization` GitHub repository.
3. Configure the service with the following settings:
   - **Name**: `logistics-pro` (or any name you like)
   - **Language/Environment**: `Python`
   - **Branch**: `main`
   - **Root Directory**: *(Leave Blank)*
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `cd backend && gunicorn "app:create_app()"`
4. Select the **Free** instance type.
5. Click **Create Web Service**.

## Step 4: Finished!
Render will now download your code, build the Angular app, install the Python libraries, and start your unified server. You will be provided with a permanent `https://...onrender.com` URL that you can share with anyone!

*(Note: The free tier scales down after a period of inactivity, so the initial load might take 50 seconds if the server went to sleep!)*
