# CKA Study Companion App Plan

This document outlines the updated plan to develop a web-based study companion app for the 30-Day CKA Preparation Challenge. The app is designed to support progress tracking, viewing daily content, taking notes, earning points for completed challenges, and interacting with an AI chatbot for quick assistance. It will be built as a single JavaScript-based container using Node.js and Express.js for both frontend and backend, hosted on a Docker VM at `192.168.1.214:3010` with server-side data storage.

## Overview
The app will be a full-stack web application built entirely in JavaScript, providing a user-friendly interface for the CKA Preparation Challenge. It ensures accessibility across different client devices by hosting on the user's Docker VM and storing data server-side. Users can select any day of the 30-day challenge without being forced to go in order, facilitated by a navigable dashboard.

## Features and Implementation Details
1. **Progress Tracking**
   - **Functionality**: A dashboard displaying a 30-day overview with progress bars or completion indicators (e.g., checkboxes) for each day, color-coded by domain (Troubleshooting, Cluster Architecture, etc.).
   - **Gamification with Points**: Award points for completing daily challenges (e.g., 10 points per day) and additional points based on self-assessed grading criteria (e.g., 5 bonus points for meeting all criteria). Display total points on the dashboard with a visual badge or score counter.
   - **Implementation**: Use JavaScript to manage state for completed days and points, with data saved to the server via API calls to the integrated backend.

2. **Daily Content Viewer (Tips, Hints, and Solutions)**
   - **Functionality**: For each day, display challenge overview, helpful hints and tips, topics to explore, and grading criteria in collapsible sections. Solutions will be hidden by default with a controlled reveal mechanism (e.g., a button labeled "Reveal Solution" that prompts a confirmation dialog like "Have you attempted this challenge?" before showing the content).
   - **Non-Sequential Access**: Users can select any day via a navigable list or grid on the dashboard, accessing content, tracking progress, and taking notes independently of completion order.
   - **Implementation**: HTML for structure, CSS for collapsible styling, and JavaScript for toggle functionality and solution reveal logic. Content will be statically embedded from 'daily-helper.md' or dynamically loaded if feasible.

3. **Note-Taking with Markdown Rendering and Export**
   - **Functionality**: Provide a text area for each day where users can write notes in markdown. Render the markdown in real-time below the input area, with proper formatting for code blocks (bash, YAML) using a library like `marked.js` and syntax highlighting via `highlight.js`.
   - **Export Feature**: Allow users to export notes for a specific day or all days as markdown files, downloadable from the browser.
   - **Implementation**: Use JavaScript to handle markdown input, render it with CDN-hosted libraries, and create export functionality to generate `.md` files for download.

4. **Server-Based Storage on Docker VM**
   - **Functionality**: Save progress, points, and notes to a directory on the Docker VM at `192.168.1.214:3010`. This ensures data persistence across devices.
   - **Implementation**: Develop a backend API using Node.js with Express.js to handle CRUD operations for data storage in a server directory (e.g., `/data/cka-app`). The frontend will communicate with this API internally within the same container, avoiding CORS issues.

5. **AI Chat Client Integration**
   - **Functionality**: Embed a chat interface in the app for quick questions related to the CKA challenge, adapted from the provided Flask code to use the OpenAI API in JavaScript. The chat will retain context for the last 3 messages for continuity.
   - **Implementation**: Implement the AI chat backend in Node.js using the `openai` package to interact with the OpenAI API, maintaining conversation history in memory. Create a simple chat UI in the frontend with JavaScript to send requests and display responses seamlessly within the same app container.

6. **Aesthetic Design**
   - **Functionality**: Ensure the app is visually appealing with a clean, modern look, supporting light mode by default with styling that reflects the CKA domains (e.g., color-coded sections).
   - **Implementation**: Use Tailwind CSS via CDN for responsive and attractive design, with a layout that prioritizes usability (e.g., dashboard at the top, daily content in the middle, notes and chat on the side or bottom).

## Technical Architecture
- **Frontend and Backend in Single Container**:
  - **Frontend**: HTML for structure, embedding static content from 'daily-helper.md' for the 30 days. Tailwind CSS (CDN) for styling, and JavaScript for interactivity, managing state, markdown rendering (`marked.js` and `highlight.js` via CDN), and internal API calls to the backend.
  - **Backend**: Node.js with Express.js for serving the frontend static files and handling API requests. API endpoints for saving/loading progress and notes (e.g., `/api/save`, `/api/load`), and for chat (`/api/chatbot`). Data stored in a directory on the Docker VM (e.g., `/data/cka-app` for JSON or markdown files). AI chat functionality implemented using the `openai` Node.js package, adapted from the provided Flask code.
  - **Integration**: The frontend and backend run in the same Node.js environment, eliminating CORS issues and simplifying communication through internal routing.
- **Deployment on Docker VM**:
  - Host the app on `192.168.1.214:3010` using a Docker container.
  - Use a simple Dockerfile to bundle the frontend files and backend server, installing Node.js and necessary dependencies, and mapping a volume for data persistence.
  - Provide instructions for building and running the container on the specified port.

## Development Steps
1. Create a project directory structure for the app (e.g., `cka-study-companion/` with subfolders for frontend and backend code, though integrated in one container).
2. Develop the frontend (`index.html`, embedded CSS/JS) with all UI components (dashboard, daily content, notes, chat).
3. Implement the backend API in Node.js with Express.js, integrating the AI chat functionality using the OpenAI API client for JavaScript and adding endpoints for data storage.
4. Write a Dockerfile and docker-compose.yml for easy deployment on the Docker VM at `192.168.1.214:3010`, including volume mapping for data persistence.
5. Test the app locally to ensure all features (progress tracking, solution reveal, note export, AI chat) work as expected within a single container.
6. Provide deployment instructions for running the app on the specified port.

This plan ensures a unified codebase in JavaScript within a single container, seamless integration of frontend and backend, non-sequential access to daily content, and deployment on the specified port as requested.