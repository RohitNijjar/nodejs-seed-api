# nodejs-seed-api
Template API using NodeJS

Project Overview
================

This is a Node.js backend API built using **TypeScript** and **Express**. The project follows **Clean Architecture** principles to ensure scalability, maintainability, and testability. The API is designed with best practices in mind, and several popular packages are used to ensure security, performance, and code quality.

Packages and Dependencies
-------------------------

This project uses the following key packages:

### 1\. **express**

*   A web framework for building APIs.
    
*   Handles routing, middleware, and request/response management.
    
*   Used to create RESTful endpoints for the application.
    

### 2\. **typescript**

*   TypeScript is used to provide static type checking and to improve code quality by enforcing type safety.
    
*   It helps avoid runtime errors and provides better development experience.
    

### 3\. **dotenv**

*   Used to load environment variables from a .env file into process.env.
    
*   Useful for separating environment-specific settings like database credentials, API keys, etc.
    

### 4\. **helmet**

*   Adds security-related HTTP headers to your app to help prevent common vulnerabilities (e.g., XSS, clickjacking).
    
*   Helps make the API more secure by default.
    

### 5\. **morgan**

*   HTTP request logger middleware for Node.js.
    
*   Logs request details (e.g., method, URL, status code) for easier debugging and monitoring.
    

### 6\. **body-parser**

*   Middleware for parsing incoming request bodies.
    
*   express.json() and express.urlencoded() can be used to handle JSON and form data, respectively.
    

### 7\. **cors**

*   A middleware to handle Cross-Origin Resource Sharing (CORS) and enable secure cross-origin requests.
    
*   Configured to allow specific methods and origins.
    

### 8\. **mongoose**

*   MongoDB object modeling for Node.js.
    
*   Used to interact with MongoDB and define data schemas and models.
    

### 9\. **morgan**

*   HTTP request logger middleware for Node.js, useful for logging requests and responses.
    

Middlewares
-----------

The following middlewares are used to ensure security, proper data parsing, and consistent API behavior:

### 1\. **helmet()**

*   Secures the app by setting various HTTP headers to protect against common security vulnerabilities (e.g., XSS, clickjacking, and content sniffing).
    

### 2\. **express.json()**

*   Parses incoming requests with application/json payloads and makes the data available in req.body.
    

### 3\. **express.urlencoded({ extended: true })**

*   Parses incoming requests with URL-encoded data, typically sent from HTML forms.
    
*   Allows parsing of complex objects or arrays in the body.
    

### 4\. **bodyParser.json()** and **bodyParser.urlencoded()**

*   These are used for backward compatibility or when you prefer body-parser over the built-in Express middleware. In most cases, the built-in express.json() and express.urlencoded() suffice.
    

### 5\. **cors()**

*   Configures CORS headers to allow cross-origin requests and defines which methods and origins are permitted.
    

### 6\. **morgan()**

*   Logs HTTP requests to the console, including method, URL, status code, and other relevant details, useful for debugging and monitoring.
    

Project Architecture
--------------------

### Clean Architecture

We follow the **Clean Architecture** principles in organizing the project. This architecture ensures separation of concerns, scalability, and maintainability. It consists of several layers that are decoupled from one another:

1.  **Controller Layer (Routes)**:
    
    *   Handles incoming HTTP requests, validates input, and returns appropriate responses.
        
    *   Controllers interact with the service layer and map data between the request and response.
        
2.  **Service Layer**:
    
    *   Contains the business logic and interacts with the repository layer to fetch, manipulate, or store data.
        
    *   Services are isolated from external dependencies like the database or third-party APIs.
        
3.  **Repository Layer**:
    
    *   Deals with data access and persistence.
        
    *   In this case, it abstracts MongoDB interactions, using Mongoose models to query the database.
        
4.  **Entities (Models)**:
    
    *   Represents the core business objects of the system.
        
    *   Entities are defined in the repository layer and serve as data models for interacting with the database.
        
5.  **Middleware Layer**:
    
    *   Contains reusable middlewares that are applied globally to routes.
        
    *   Example: helmet() for security, express.json() for parsing JSON, and cors() for cross-origin requests.
