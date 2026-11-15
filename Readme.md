# Let's Connect 🌍

**Find people moving in the same direction as you. Connect in real time. Travel together.**

Let's Connect is a real-time location-based social application designed to help people discover others travelling in the same direction. Whether you're commuting, travelling alone, or heading to an event, the goal is to make connecting with people along your route easier.

Share your location when you choose, discover potential matches nearby, send connection requests, and coordinate your journeys through a live map.

> 🚧 **Project status:** Under active development. Authentication, friend management, and the WebSocket server are implemented. Live location matching, maps, and navigation are planned features.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How Matching Will Work](#-how-matching-will-work)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [WebSocket Protocol](#-websocket-protocol)
- [Privacy and Security](#-privacy-and-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🌐 Overview

Finding someone travelling along the same route can make everyday journeys more social and convenient.

Let's Connect aims to solve this by combining location sharing, real-time communication, and direction-based matching in one application.

### The core idea

1. **Share your journey** — Choose to share your current location and destination.
2. **Discover nearby travellers** — Find people who are geographically close and heading in a similar direction.
3. **Connect** — Send a connection request to someone you want to travel with.
4. **Coordinate in real time** — Once connected, view each other's permitted location updates and coordinate your journey.

The long-term goal is to build a reliable, privacy-conscious platform for real-time travel connections.

## ✨ Features

### Implemented

- [x] User signup and login with JWT-based authentication.
- [x] Authentication using HttpOnly cookies.
- [x] Add friends using email addresses.
- [x] Retrieve and display a user's friends list.
- [x] PostgreSQL database integration using a connection pool.
- [x] WebSocket server foundation for real-time communication.
- [x] Express-based backend with modular routes and middleware.

### In Progress / Planned

- [ ] Live location sharing over WebSockets.
- [ ] Interactive map with nearby users.
- [ ] Direction and destination-based matching.
- [ ] Connection requests with accept and decline actions.
- [ ] Live navigation and route coordination.
- [ ] Visibility controls and an explicit location-sharing toggle.
- [ ] Approximate location for undisclosed users.
- [ ] Nearby-match notifications.
- [ ] Redis-backed location state and geographic indexing.
- [ ] Mobile application using React Native.

*Feature status reflects the current project description and should be updated as implementation progresses.*

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Language | JavaScript (ES modules) |
| Database | PostgreSQL |
| Database driver | `pg` connection pool |
| Authentication | `jsonwebtoken`, `cookie-parser` |
| Rate limiting | `express-rate-limit` |
| Real-time communication | WebSockets |
| Frontend | HTML, CSS, vanilla JavaScript |
| Planned maps | Leaflet with OpenStreetMap, or another map provider |
| Planned location state | Redis |
| Planned mobile client | React Native |

## 🏗️ Architecture

The application is organized around a modular backend that serves the frontend, handles authentication, manages friend relationships, and provides a foundation for real-time communication.

```text
                    ┌──────────────────────┐
                    │      Web Client      │
                    │   HTML / CSS / JS    │
                    └──────────┬───────────┘
                               │
                    HTTP       │       WebSocket
                               │
                    ┌──────────▼───────────┐
                    │    Node.js Server    │
                    │       Express        │
                    └──────┬────────┬──────┘
                           │        │
                ┌──────────▼──┐  ┌──▼────────────┐
                │ Auth &      │  │ WebSocket     │
                │ Friend APIs │  │ Server        │
                └──────┬──────┘  └──┬────────────┘
                       │             │
                ┌──────▼──────┐  ┌───▼───────────┐
                │ PostgreSQL  │  │ Location State│
                │             │  │ Redis / Memory│
                └─────────────┘  └───────────────┘
```

The diagram represents the intended architecture. Redis-backed location state and the complete location-matching flow are planned, not claimed as implemented.

### Design principles

- **Modularity:** Keep authentication, friend management, database access, and real-time logic separate.
- **Real-time updates:** Use WebSockets for low-latency communication.
- **Scalability:** Avoid checking every connected user for every location update.
- **Security:** Derive user identity from verified authentication rather than trusting client-supplied IDs.
- **Privacy:** Share location only with explicit consent and authorized recipients.

## 🧭 How Matching Will Work

The planned matching system will identify users who are nearby and travelling along similar routes.

### 1. Receive location updates

A client may send a location update in the following format:

```json
{
  "type": "location",
  "lat": 29.9680,
  "lng": 77.5510,
  "heading": 45,
  "destination": {
    "lat": 30.3165,
    "lng": 78.0322
  }
}
```

This is an illustrative payload for the planned protocol, not a guarantee that the current server accepts it.

### 2. Maintain recent location state

Keep the latest authorized location for each active user in memory or Redis. Expire stale entries and avoid retaining a location history unless a separate, explicit feature requires it.

### 3. Reduce the search area

Use a geographic index, such as geohash cells, to identify nearby users without scanning the entire population on every update.

### 4. Calculate route compatibility

Evaluate several signals:

- Distance between users.
- Heading similarity.
- Destination proximity or route overlap.
- Whether both users are actively sharing their locations.
- Freshness of their latest location updates.

A heading difference of 30 degrees could be an initial configurable threshold, but heading alone is not sufficient to determine whether two users are travelling the same route.

### 5. Notify eligible users

Send match suggestions over authenticated WebSocket connections. Reveal exact locations only when the applicable consent and connection rules permit it.

## 📁 Project Structure

```text
lets-connect/
└── Backend/
    ├── server.js          # Express application entry point
    ├── login.js           # Signup and login routes
    ├── auth.js            # Authentication middleware
    ├── getfriends.js      # Friend management routes
    ├── LiveConnect.js     # WebSocket server
    ├── db.js              # PostgreSQL connection pool
    ├── Public/            # Static frontend files
    ├── .env               # Local environment variables (not committed)
    └── package.json       # Backend dependencies and scripts
```

The structure above follows the current project description. Add any additional files, folders, or scripts as they are introduced.

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) 18 or later.
- [PostgreSQL](https://www.postgresql.org/).
- npm, included with Node.js.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/anmolchauhan-trader/lets-connect.git
cd lets-connect/Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `Backend/` directory. See [Environment Variables](#-environment-variables) below.

### 4. Create the database

Create a PostgreSQL database and ensure that the tables expected by your existing application have been created.

For example, using the PostgreSQL command-line client:

```sql
CREATE DATABASE lets_connect;
```

This creates the database only; it does not create the application tables. Use the schema required by your backend.

### 5. Start the server

```bash
node server.js
```

For development with automatic restarts:

```bash
npx nodemon server.js
```

If the server uses port `3000`, open:

```text
http://localhost:3000
```

The frontend should be served from the configured static directory if that behavior is enabled in `server.js`.

## 🔐 Environment Variables

Example `Backend/.env`:

```env
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
DATABASE_URL=postgres://username:password@localhost:5432/lets_connect
NODE_ENV=development
```

| Variable | Purpose |
|---|---|
| `PORT` | HTTP server port |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | Application environment |

**Important:**

- Never commit `.env` or production secrets to GitHub.
- Use a unique, high-entropy JWT secret.
- Use separate credentials for development and production.
- Enable secure cookie settings and HTTPS in production.
- URL-encode special characters in database credentials when necessary.

Add a `.gitignore` entry similar to:

```gitignore
node_modules/
.env
.env.*
!.env.example
npm-debug.log*
```

Commit an `.env.example` containing placeholder values, never real secrets.

## 📡 API Reference

The following routes are based on the current project description. Confirm the exact HTTP methods, paths, request bodies, and responses against the source code before treating this as a complete API specification.

| Method | Route | Authentication | Purpose |
|---|---|---|---|
| POST | `/friend/GetFriends` | Required | Retrieve the current user's friends |
| POST | `/friend/AddFriends` | Required | Add a friend using an email address |
| POST | `/api/...` | Depends on route | Signup and login endpoints; exact paths to be documented |
| WS | `/ws` | Required by design | Planned real-time communication endpoint |

### Authentication behavior

- Signup and login establish the authenticated session according to the backend implementation.
- Protected HTTP endpoints should validate the JWT from the configured HttpOnly cookie.
- Protected endpoints should derive the current user's identity from the verified token.
- WebSocket authentication must be enforced during the connection handshake or through a secure authentication protocol.

The exact WebSocket authentication mechanism and current route behavior should be verified in the implementation.

## 🔌 WebSocket Protocol

The WebSocket server is part of the existing project. The complete live-location protocol is planned.

Future message types may include:

| Message type | Purpose |
|---|---|
| `location` | Share a permitted location update |
| `match_found` | Notify a user about a potential match |
| `connection_request` | Request to connect with another traveller |
| `connection_accepted` | Confirm a connection |
| `connection_declined` | Decline a connection |
| `location_update` | Relay an authorized user's latest position |
| `error` | Report a protocol or validation error |

These are proposed protocol names, not a list of currently supported messages.

Every message should be validated on the server. Reject malformed coordinates, unauthorized actions, stale updates, and messages attempting to impersonate another user.

## 🔒 Privacy and Security

Location data is sensitive. Privacy and security must be treated as core product requirements rather than optional enhancements.

The intended design includes:

- **Explicit consent:** Location sharing starts only when a user chooses to enable it.
- **Visibility controls:** Users can stop sharing or change who is allowed to see their location.
- **Access control:** Only authorized recipients can receive exact location data.
- **Verified identity:** User identity is derived from validated authentication, never trusted from an arbitrary request payload.
- **Secure authentication:** Use HttpOnly cookies, appropriate `SameSite` settings, secure cookies over HTTPS, and CSRF protections where applicable.
- **Input validation:** Validate coordinates, destinations, message types, and request payloads.
- **Rate limiting:** Limit login attempts and sensitive endpoints.
- **Data minimization:** Keep only the location data needed for the active session and expire stale records.
- **Safe defaults:** Do not expose a user's exact location to strangers by default.
- **Connection cleanup:** Remove ephemeral location state when it expires or sharing ends.

The intended design avoids persistent location history by default. Actual retention and deletion behavior must be verified in the implementation before being described as guaranteed.

## 🗺️ Roadmap

### Phase 1 — Core foundation
- [x] Signup and login
- [x] JWT authentication with HttpOnly cookies
- [x] Add friends by email
- [x] Retrieve friends list
- [x] WebSocket server foundation

### Phase 2 — Live location
- [ ] Add explicit location-sharing controls
- [ ] Send validated location updates over WebSockets
- [ ] Track active locations with expiration
- [ ] Implement connection cleanup and stale-location handling

### Phase 3 — Discovery and matching
- [ ] Integrate an interactive map
- [ ] Add geographic proximity search
- [ ] Compare headings and route compatibility
- [ ] Deliver real-time match suggestions

### Phase 4 — Social connections
- [ ] Send, accept, and decline connection requests
- [ ] Restrict location access to authorized connections
- [ ] Add nearby-match notifications
- [ ] Improve real-time coordination

### Phase 5 — Scale and expand
- [ ] Add Redis-backed location state
- [ ] Add monitoring, logging, and integration tests
- [ ] Optimize geographic matching
- [ ] Develop a React Native mobile client
- [ ] Pilot the application in a single city

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and add appropriate tests.
4. Commit your work with a descriptive message.
5. Open a pull request explaining the change.

For major changes, open an issue first to discuss the proposed feature or architecture.

Please avoid committing secrets, personal location data, or other sensitive information.

## 👨‍💻 Author

**Anmol Chauhan**

- GitHub: [@anmolchauhan-trader](https://github.com/anmolchauhan-trader)
- Project repository: [lets-connect](https://github.com/anmolchauhan-trader/lets-connect)

---

If you find the idea interesting, feel free to explore the repository, share feedback, or contribute.

**Let's make everyday journeys more connected. 🌍**
