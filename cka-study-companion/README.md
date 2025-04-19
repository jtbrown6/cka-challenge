# CKA Study Companion App

This application is a web-based study companion for the 30-Day CKA Preparation Challenge. It provides features for tracking progress, viewing daily content, taking notes with markdown support, earning points for completed challenges, and interacting with an AI chatbot for quick assistance. The app is designed to run as a single container on your Docker VM at `192.168.1.214:3010`.

## Prerequisites

- Docker and Docker Compose installed on your Docker VM.
- Access to the Docker VM at `192.168.1.214`.
- An OpenAI API key for the AI chat functionality (set as an environment variable during deployment).

## Deployment Instructions

Follow these steps to build and run the CKA Study Companion App on your Docker VM:

1. **Clone or Copy the Project Files**
   - Ensure all project files are copied to a directory on your Docker VM (e.g., `/home/devops/cka-study-companion`).

2. **Navigate to the Project Directory**
   ```bash
   cd /path/to/cka-study-companion
   ```

3. **Set the OpenAI API Key**
   - Export your OpenAI API key as an environment variable, or set it in a `.env` file for Docker Compose:
     ```bash
     export OPENAI_API_KEY='your-actual-api-key-here'
     ```
   - Alternatively, create a `.env` file in the project directory:
     ```bash
     echo "OPENAI_API_KEY=your-actual-api-key-here" > .env
     ```

4. **Build and Run the Docker Container**
   - Use Docker Compose to build and start the container:
     ```bash
     docker-compose up --build -d
     ```
   - This will build the image, start the container, and map port `3010` on the VM to the app's internal port.

5. **Access the App**
   - Open a web browser on any device connected to your network and navigate to `http://192.168.1.214:3010`.
   - You should see the CKA Study Companion dashboard.

6. **Stopping the App**
   - To stop the container:
     ```bash
     docker-compose down
     ```

7. **Data Persistence**
   - User data (progress, points, notes, and chat history) is stored in a Docker volume named `cka-data`, mapped to `/data/cka-app` inside the container. This ensures data persists across container restarts.

## Troubleshooting

- **Port Conflict**: If port `3010` is already in use, edit the `docker-compose.yml` file to map a different external port (e.g., `3011:3010`).
- **OpenAI API Key Issues**: Ensure the API key is correctly set. If you see errors related to the AI chat, check the container logs:
  ```bash
  docker logs cka-study-companion
  ```
- **Data Loss**: If data does not persist, verify that the Docker volume `cka-data` is correctly mounted and not being recreated on each run.

## Customizing the App

- To add or update the daily content, the `index.html` file can be modified to include the full content from 'daily-helper.md' in the `daysData` array within the JavaScript section.
- Additional features or styling can be added by editing the frontend code in `index.html`.

## Notes

- The app is currently set up with placeholder content for the 30 days. Full integration of content from 'daily-helper.md' will be completed in subsequent development steps.
- Ensure your Docker VM has sufficient resources (CPU, memory) to run the container smoothly.

For further assistance or updates, refer to the project plan in 'cka-study-companion-plan.md'.