# RoTT frontend

This project uses generative AI to create short assessment moments for students. It was developed as part of the
part-time HBO-ICT program. A prerequisite for running this project is to have the backend service operational.

## Contributors

- Ahmed Benhajar (21024154)
- Edwin Ross (19137052)
- Jennifer Goudswaard (21155496)
- Marjo Salo (21146942)
- Sander in ‘t Hout (15126463)

## Getting started

1. **Set Up Environment Variables:**
   Before starting the application, you need to configure your environment variables. Copy the example environment file
   and rename it:

```bash
   cp .env.example .env
```

2. **Install Dependencies:**
   After setting up the .env file, install the required libraries by running:

```bash
   npm install
```

2. **Start the Application:**
   Once the dependencies are installed, start the application using:

```bash
   npm start
```

## Accessing the Application

With the application running, you can access the React frontend in your web browser
at: [React app](http://127.0.0.1:3000)

## Structure

The project is built with React, and the project structure is as follows:

```bash
rott-frontend/
├── node_modules/                 # Installed npm packages
├── public/                       # Public files (static assets)
├── src/                          # Source files for the React application
│   ├── api/                      # API call functions and configurations
│   ├── components/               # Reusable React components
│   │   ├── answers/              # Components related to answer functionality
│   │   └── AppBar/               # Components for the AppBar (navigation bar)
│   ├── configs/                  # Configuration files
│   ├── App.css                   # Global styles for the application
│   ├── App.js                    # Main application component
│   ├── index.css                 # Styles for the entry point
│   ├── index.js                  # Application entry point
│   ├── logo.svg                  # Logo for the application
│   ├── reportWebVitals.js        # Performance measuring utilities
│   ├── setupTests.js             # Setup for testing utilities
├── .env.example                  # Example of how the environment file should look like
├── .gitignore                    # Git ignore file
├── craco.config.js               # Configuration file for Create React App Override (CRACO)
├── jsconfig.json                 # Configuration file for JavaScript project
├── package.json                  # Project metadata and dependencies
├── package-lock.json             # Lock file for npm dependencies
└── README.md                     # Project documentation

