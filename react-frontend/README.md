# Demand Prediction and Product Recommendation System

A full-stack AI system for e-commerce analytics.

## Tech Stack
- **Python + Flask** — ML algorithms and REST API
- **Node.js + Express** — Backend server and business logic
- **MongoDB + Mongoose** — Database
- **React** — Frontend dashboard

## Algorithms (all built from scratch)
- **Linear Regression** with Gradient Descent — demand prediction
- **Collaborative Filtering** with Cosine Similarity — user recommendations
- **Content-Based Filtering** with Cosine Similarity — product recommendations

## Setup

### 1. Python ML Service
```bash
cd python-ml
pip install pandas numpy flask
python app.py
```
Runs on port 5000.

### 2. Node Backend
```bash
cd node-backend
npm install
node seed.js
node server.js
```
Runs on port 4000.

### 3. React Frontend
```bash
cd react-frontend
npm install
npm start
```
Runs on port 3000.

## API Routes

### Python Flask (port 5000)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Health check |
| GET | /model/info | Model details |
| POST | /predict | Predict demand |
| POST | /predict/batch | Batch prediction |
| POST | /recommend/user | Collaborative filtering |
| POST | /recommend/product | Content-based filtering |

### Node Express (port 4000)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /products | All products |
| GET | /products/filter/laptops | Laptops only |
| GET | /products/filter/phones | Phones only |
| GET | /customers | All customers |
| POST | /ml/predict | Demand prediction |
| POST | /ml/recommend/user | User recommendations |
| POST | /ml/recommend/product | Product recommendations |

## Dataset
- 10,000 rows of electronics sales data
- Products: Laptops and Mobile Phones
- Brands: Apple, Samsung, HP, Dell, Lenovo and more