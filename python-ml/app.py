# app.py
# Flask REST API — serves Linear Regression + Recommendation Engine
# Phase 1 + Phase 2 complete

from flask import Flask, request, jsonify
from data_prep import load_and_prepare, normalize, denormalize
from linear_regression import train, predict, mean_squared_error, train_test_split
from recommender import (
    build_user_item_matrix, collaborative_recommend,
    build_product_features, content_based_recommend
)
from linear_regression import (train, predict, mean_squared_error,
                                train_test_split, mean_absolute_error,
                                r_squared)

app = Flask(__name__)

# ── 1. Load data ──────────────────────────────────────────────────────────────

print("Loading data...")
df = load_and_prepare()

# ── 2. Train Linear Regression ────────────────────────────────────────────────

print("\nTraining demand prediction model...")
prices   = df["Price"].tolist()
qty_sold = df["Quantity Sold"].tolist()

x_norm, X_MIN, X_MAX = normalize(prices)
y_norm, Y_MIN, Y_MAX = normalize(qty_sold)

x_train, y_train, x_test, y_test = train_test_split(x_norm, y_norm)
M, B = train(x_train, y_train, learning_rate=0.1, epochs=2000)

test_preds = [predict(x, M, B) for x in x_test]
TEST_MSE   = mean_squared_error(y_test, test_preds)
print(f"Demand model ready. MSE: {TEST_MSE:.6f}")
TEST_MAE = mean_absolute_error(y_test, test_preds)
TEST_R2  = r_squared(y_test, test_preds)

# ── 3. Build Recommendation Engine ────────────────────────────────────────────

print("\nBuilding recommendation engine...")
matrix, customers, product_keys, c_idx, p_idx = build_user_item_matrix(df)
p_vectors, p_details = build_product_features(df)
print(f"Recommender ready. {len(customers)} customers, "
      f"{len(product_keys)} product types.\n")


# ════════════════════════════════════════════════════════════════════════════
#  DEMAND PREDICTION ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "routes": {
            "GET  /":                  "health check",
            "GET  /model/info":        "model details",
            "POST /predict":           "predict demand for one price",
            "POST /predict/batch":     "predict for multiple prices",
            "POST /recommend/user":    "collaborative filtering",
            "POST /recommend/product": "content-based filtering",
            "GET  /customers":         "all customer names",
            "GET  /products":          "all product codes"
        }
    })


@app.route("/model/info", methods=["GET"])
def model_info():
    return jsonify({
        "algorithm":   "Linear Regression + Gradient Descent (from scratch)",
        "trained_on":  len(x_train),
        "tested_on":   len(x_test),
        "features":    ["Price"],
        "target":      "Quantity Sold",
        "slope_m":     round(M, 6),
        "intercept_b": round(B, 6),
        "test_mse":    round(TEST_MSE, 6),
        "test_mae":    round(TEST_MAE, 6),
        "r_squared":   round(TEST_R2,  6),
        "price_range": {"min": X_MIN, "max": X_MAX},
        "qty_range":   {"min": Y_MIN, "max": Y_MAX}
    })

@app.route("/predict", methods=["POST"])
def predict_demand():
    data = request.get_json()
    if not data or "price" not in data:
        return jsonify({"error": "Send JSON with a 'price' field"}), 400

    price = float(data["price"])
    if price < 0:
        return jsonify({"error": "Price cannot be negative"}), 400

    price_norm = (price - X_MIN) / (X_MAX - X_MIN)
    qty_norm   = predict(price_norm, M, B)
    qty_real   = denormalize(qty_norm, Y_MIN, Y_MAX)
    qty_real   = max(1.0, min(10.0, qty_real))

    return jsonify({
        "price":              price,
        "predicted_quantity": round(qty_real, 2),
        "model_mse":          round(TEST_MSE, 6)
    })


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    data = request.get_json()
    if not data or "prices" not in data:
        return jsonify({"error": "Send JSON with a 'prices' list"}), 400

    results = []
    for price in data["prices"]:
        price      = float(price)
        price_norm = (price - X_MIN) / (X_MAX - X_MIN)
        qty_norm   = predict(price_norm, M, B)
        qty_real   = denormalize(qty_norm, Y_MIN, Y_MAX)
        qty_real   = max(1.0, min(10.0, qty_real))
        results.append({
            "price":              price,
            "predicted_quantity": round(qty_real, 2)
        })

    return jsonify({"predictions": results})


# ════════════════════════════════════════════════════════════════════════════
#  RECOMMENDATION ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/recommend/user", methods=["POST"])
def recommend_for_user():
    data = request.get_json()
    if not data or "customer_name" not in data:
        return jsonify({"error": "Send JSON with 'customer_name'"}), 400

    recs = collaborative_recommend(
        data["customer_name"], df,
        matrix, customers, product_keys, c_idx, p_idx
    )

    if not recs:
        return jsonify({
            "error": "Customer not found or no recommendations.",
            "tip":   "Use GET /customers to see available names"
        }), 404

    return jsonify({
        "customer":        data["customer_name"],
        "algorithm":       "Collaborative Filtering (cosine similarity)",
        "recommendations": recs
    })


@app.route("/recommend/product", methods=["POST"])
def recommend_similar_products():
    data = request.get_json()
    if not data or "product_code" not in data:
        return jsonify({"error": "Send JSON with 'product_code'"}), 400

    similar = content_based_recommend(
        data["product_code"], p_vectors, p_details
    )

    if not similar:
        return jsonify({
            "error": "Product code not found.",
            "tip":   "Use GET /products to see available codes"
        }), 404

    return jsonify({
        "product_code":     data["product_code"],
        "algorithm":        "Content-Based Filtering (cosine similarity)",
        "similar_products": similar
    })


@app.route("/customers", methods=["GET"])
def list_customers():
    return jsonify({
        "total":     len(customers),
        "customers": customers
    })


@app.route("/products", methods=["GET"])
def list_products():
    codes = list(p_vectors.keys())
    return jsonify({
        "total":    len(codes),
        "products": codes
    })


# ── Start server ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)