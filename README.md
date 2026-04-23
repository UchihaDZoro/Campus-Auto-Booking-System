# 🛺 EcoLoop — Campus Ride-Booking Prototype

EcoLoop is a real-time, multi-user **frontend simulation of a campus ride-hailing ecosystem**. Built using React and TypeScript, it models the complete lifecycle of ride booking, dispatch, and management across three roles: **Passengers, Drivers, and Administrators**.

The system is designed as a **zero-backend prototype**, leveraging browser-native capabilities to simulate live interactions. It enables side-by-side testing across multiple tabs, making it ideal for demonstrations, academic evaluation, and rapid prototyping.

---

## ✨ Core Features

### 👨‍🎓 Passenger Portal

* **Campus Authentication**
  Access shall be restricted to valid institutional email domains (e.g., `@iitism.ac.in`).

* **Interactive Map-Based Booking**
  Users may define pickup and drop-off locations via map pin placement.

* **Automated Ride Dispatch**
  The system shall assign the nearest available driver based on simulated proximity.

* **Live Ride Tracking**
  Users can monitor driver movement toward the pickup location in real time.

* **Ride History & Feedback**
  Passengers may view previous trips, inspect fare estimates, and submit ratings.

---

### 🚙 Driver Terminal

* **Secure Access Control**
  Drivers shall authenticate using predefined credentials (default passcode: `123`).

* **Availability Management**
  Drivers may toggle status between `Online`, `Offline`, and `Busy`.
  Status changes must propagate across all active sessions instantly.

* **Incoming Ride Requests**
  Drivers receive dispatch alerts with contextual passenger data.

* **Ride Lifecycle Management**
  Drivers must be able to:

  * Accept or reject rides
  * Confirm pickup
  * Start and complete trips

* **Performance Tracking**
  Ride completion and earnings metrics shall update dynamically.

---

### 🛡️ Admin Dashboard (Control Center)

* **Real-Time Analytics**
  Displays active drivers, ride counts, and simulated revenue metrics.

* **Fleet Management (CRUD Operations)**
  Admins may create, update, or remove driver profiles.
  Newly added drivers must appear instantly in the Driver Portal.

* **Access Control Enforcement**
  Admins can suspend or activate drivers.
  Suspended drivers shall be restricted from receiving ride requests.

* **Live Map Control ("God Mode")**
  Admins may reposition driver markers arbitrarily.
  All connected clients must reflect updated positions in real time.

---

## 🛠️ Technology Stack

| Layer              | Technology                     |
| ------------------ | ------------------------------ |
| Core Framework     | React 19 + TypeScript + Vite   |
| Styling            | Tailwind CSS v4                |
| Mapping            | Leaflet + React-Leaflet        |
| Animations         | Framer Motion (`motion/react`) |
| Icons              | lucide-react                   |
| Data Visualization | Recharts                       |
| State Management   | Custom Hook (`useDemoStore`)   |

---

## 🧠 Architecture: Cross-Tab Synchronization Model

EcoLoop implements a **frontend-only distributed state system**.

### Mechanism:

* All application state shall be written to `localStorage`.
* Each browser tab must subscribe to `storage` events.
* On detecting updates, tabs shall rehydrate and synchronize local state immediately.

### Implications:

* No backend server is required.
* Real-time interaction is simulated across multiple tabs.
* The system behaves analogously to a WebSocket-driven architecture.

### Constraints:

* State persistence is limited to the browser environment.
* Concurrency conflicts are not strictly resolved.
* Not suitable for production deployment without backend replacement.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn package manager

### Installation

```bash
# Clone repository
git clone <your-repo-url>

# Navigate to project directory
cd ecoloop

# Install dependencies
npm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Application will be available at:

```
http://localhost:3000
```

---

## 🎬 Demo Workflow

To fully experience real-time behavior:

1. Open the application in your browser.
2. Duplicate the tab (minimum two instances required).

### Scenario Setup

**Window A (Passenger):**

* Select *Passenger Portal*
* Login using: `23je0699@iitism.ac.in`
* Set pickup and drop locations
* Click **Request Ride**

**Window B (Driver):**

* Select *Driver Portal*
* Choose a driver (e.g., Rajesh)
* Login using passcode: `123`
* Set status to **Online**

➡️ Observe: Incoming ride request appears instantly.

**Optional (Window C - Admin):**

* Open *Admin Dashboard*
* Navigate to Live Map
* Drag driver marker to simulate movement

➡️ All windows shall reflect updates in real time.

---

## 📦 Deliverables

* Passenger Web Application
* Driver Interface
* Admin Dashboard
* Frontend State Engine (localStorage-based simulation)

---

## ⚠️ Limitations

* No persistent backend (data resets on storage clear)
* No real authentication or encryption
* No production-grade concurrency handling
* Simulated routing and ETA calculations

---

## 🌱 Future Enhancements

* Replace localStorage with WebSocket + backend (Node.js / Firebase)
* Integrate real routing engines (OSRM / Mapbox)
* Add payment simulation layer
* Implement demand prediction and fleet optimization (ML-based)
* Introduce ride pooling and dynamic pricing

---

## 👥 Team 24

* **23JE0699** — Pathan Gulamgaush
* **23JE0689** — Parepalli Sai Ram
* **23JE0705** — Peddireddy Pranava Swaroop Reddy
* **23JE0720** — Prabhala Kartikeya

---

## 📌 Academic Context

This project was developed as part of a **Software Engineering Laboratory coursework**, with a focus on system design, real-time simulation, and frontend architecture.

---

## 📄 License

This project is intended for academic and demonstration purposes.
Usage beyond evaluation or learning contexts shall require explicit permission.

---
