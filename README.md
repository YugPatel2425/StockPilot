# 📈 StockPilot: Virtual Stock Market Simulator

> **Academic Project:** Full-Stack Web Application  
> **Status:** Active Development

## 📖 Vision Document

### 1. Project Overview
**StockPilot** is a comprehensive virtual stock market simulation platform. It allows users to practice buying and selling stocks using virtual currency in a realistic, risk-free environment. By simulating real-market conditions, StockPilot bridges the gap between theoretical finance knowledge and practical trading experience.

### 2. Problem Statement
Beginner investors and students often lack practical experience in the stock market. Entering the market with real money leads to significant financial loss due to risky experimentation and a lack of understanding of market volatility. There is a need for a "sandbox" environment where strategies can be tested without financial consequence.

### 3. Vision Statement
To empower beginners and enthusiasts to confidently learn stock trading concepts through a realistic, safe, and data-driven simulation platform.

### 4. Target Personas
| Persona | Description | Goal |
| :--- | :--- | :--- |
| **Student Sam** | Finance/CS Undergraduate | Wants to apply classroom theory to real charts without spending money. |
| **Newbie Nancy** | Working Professional | Wants to start investing but is afraid of losing savings; wants to "test drive" the market first. |
| **Analyst Andy** | Hobbyist Trader | Wants to test specific high-risk algorithms or strategies in a controlled environment. |

### 5. Success Metrics
* **System Stability:** 99.9% uptime during simulation hours.
* **Data Accuracy:** Stock prices reflect real-world trends (delayed/simulated) with <1% error margin in calculation.
* **User Engagement:** Users successfully complete at least one "Buy" and one "Sell" transaction within their first session.

### 6. Assumptions & Constraints
* **No Real Money:** All currency is virtual; no connection to real banking gateways.
* **Data Latency:** Stock data may be delayed (15-min standard) or simulated depending on API limits (e.g., Yahoo Finance/Alpha Vantage free tiers).
* **Scope:** Focused on Equities (Stocks) only; no Options/Futures.
* **Deployment:** Localized Docker deployment is sufficient for evaluation.

---

## 🛠️ Tech Stack

This project follows a modern **Containerized Microservice-style** architecture.

* **Frontend:** React.js (Vite), Tailwind CSS, Chart.js (for analytics).
* **Backend:** Python (FastAPI) - Chosen for high performance and easy data processing.
* **Database:** PostgreSQL - Relational database for ACID compliance (critical for financial transactions).
* **DevOps:** Docker, Docker Compose.
* **Version Control:** Git & GitHub.

---

## 🚀 Features (MoSCoW Prioritization)

### Must Have (MVP)
* User Authentication (JWT based Login/Signup).
* Real-time (or near real-time) stock price fetching.
* Buy and Sell functionality with simulated wallet balance.
* Portfolio Dashboard showing current holdings.

### Should Have
* Historical price charts (Line/Candlestick).
* Transaction History log.
* Profit/Loss calculation per trade.

### Could Have
* Leaderboard to compare performance with other users.
* Watchlist functionality.

### Won't Have (Out of Scope)
* Real money integration.
* Derivatives trading (Options/Futures).

---

## 🌳 Branching Strategy (GitHub Flow)

We follow the **GitHub Flow** strategy to ensure code quality and continuous integration.

1.  **`main`**: The stable, production-ready branch.
2.  **`develop`**: The integration branch for testing new features.
3.  **Feature Branches**: Created from `develop` for specific tasks.
    * Format: `feature/feature-name` (e.g., `feature/login-page`, `feature/stock-api`).
    * *Workflow:* Create Branch -> Commit Code -> Pull Request (PR) -> Merge to `develop`.

---

## 💻 Getting Started (Local Development)

Follow these instructions to run the project locally using Docker.

### Prerequisites
* Git installed.
* Docker Desktop installed and running.

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/StockPilot.git](https://github.com/your-username/StockPilot.git)
    cd StockPilot
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory (refer to `.env.example`):
    ```env
    POSTGRES_USER=user
    POSTGRES_PASSWORD=password
    POSTGRES_DB=stockpilot_db
    SECRET_KEY=your_secret_key
    ```

3.  **Run with Docker Compose**
    This command builds the frontend, backend, and database containers.
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application**
    * **Frontend:** http://localhost:5173
    * **Backend API Docs:** http://localhost:8000/docs
    * **Database:** Accessible via port 5432

### Manual Setup (Without Docker)
*See `/backend/README.md` and `/frontend/README.md` for individual setup instructions.*

---

## 📂 Project Structure

```bash
StockPilot/
├── frontend/          # React Application
├── backend/           # FastAPI Application
├── data/              # Database scripts/dumps
├── docker-compose.yml # Orchestration
└── README.md          # Project Documentation
