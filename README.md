# Instagram Chat Clone using TurboRepo, Websockets, Pub/Subs, and RabbitMQ

# Architecture

![Screenshot 2024-04-20 045625](https://github.com/AnirudhMemani/instagram-chat-clone/assets/46074384/d705140f-1999-4a3d-b12b-6ffffa248e4e)

A fully scalable Instagram-like chat application. It utilizes TurboRepo for project management, Websockets for real-time communication, RabbitMQ for message brokering with Pub/Sub patterns, Prisma ORM with PostgreSQL for database management, Shadcn for UI components, React.js for the frontend, and Node/Express for the backend.

# Features

+ TurboRepo: Management of both the frontend and backend.
+ Real-time Chat: Instant messaging using Websockets for real-time communication.
+ Pub/Sub Messaging: Efficient message distribution using RabbitMQ for Pub/Sub patterns.
+ Scalable Architecture: Designed to handle high loads with RabbitMQ and horizontal scaling.
+ User Authentication: Secure login and registration using JWT.
+ Database Management: Prisma ORM with PostgreSQL for robust database interactions.
+ Modern UI: Shadcn for responsive and modern UI components.
+ Deployment Ready: Configurations for deploying on cloud platforms.

# Tech Stack

+ Frontend: React.js, Shadcn
+ Backend: Node.js, Express
+ Database: PostgreSQL, Prisma ORM
+ Real-time Communication: Websockets
+ Message Brokering: RabbitMQ
+ Authentication: JWT (JSON Web Tokens)
+ TurboRepo: Project management

# Websockets and RabbitMQ Integration

The application uses Websockets for real-time messaging and RabbitMQ for handling message brokering efficiently. Below is a brief overview of the integration:

# Websockets

+ WebSockets: A library for real-time web applications. It enables real-time, bidirectional, and event-based communication.

# RabbitMQ

+ Pub/Sub Pattern: RabbitMQ handles the distribution of messages between the sender and receiver using a publish/subscribe pattern to ensure scalability.

# Prisma ORM

+ Prisma ORM is used to interact with PostgreSQL, providing a type-safe database client.

# Contributing

We welcome contributions from the community! Please fork the repository and submit a pull request with your changes. Make sure to follow the code style and add appropriate tests.
