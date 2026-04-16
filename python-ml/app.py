# app.py
# Flask REST API — serves our Linear Regression model.
# Node.js will call this to get demand predictions.

from flask import Flask, request, jsonify
from data_prep import load_and_prepare, normalize, denormalize
from linear_regression import train, predict, mean_squared_error, train_test_split
from recommender import (
    build_user_item_matrix, collaborative_recommend,
    build_product_features, content_based_recommend
)

app = Flask(__name__)

# ── Train the model once when the server starts ──────────────────────────────
# We don't retrain on every request — that would be too slow.

print("Loading data and training model...")

df = load_and_prepare()

prices   = df["Price"].tolist()
qty_sold = df["Quantity Sold"].tolist()

x_norm, X_MIN, X_MAX = normalize(prices)
y_norm, Y_MIN, Y_MAX = normalize(qty_sold)

x_train, y_train, x_test, y_test = train_test_split(x_norm, y_norm)

M, B = train(x_train, y_train, learning_rate=0.1, epochs=2000)

# Evaluate and store accuracy
test_preds = [predict(x, M, B) for x in x_test]
TEST_MSE   = mean_squared_error(y_test, test_preds)

print(f"Model ready. Test MSE: {TEST_MSE:.6f}\n")

# recommendation engine setup
print("Building recommendation engine...")
matrix, customers, products_list, c_idx, p_idx = build_user_item_matrix(df)
p_vectors, p_details = build_product_features(df)
print(f"Ready. {len(customers)} customers, {len(products_list)} products.\n")

# ── Route 1: Health check ────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "model":  "Linear Regression (from scratch)",
        "mse":    round(TEST_MSE, 6)
    })


# ── Route 2: Predict demand for a given price ────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict_demand():
    """
    Expects JSON body: { "price": 75000 }
    Returns:          { "price": 75000, "predicted_quantity": 5.4 }
    """
    data = request.get_json()

    # Validate input
    if not data or "price" not in data:
        return jsonify({"error": "Please send a JSON body with a 'price' field"}), 400

    price = float(data["price"])

    if price < 0:
        return jsonify({"error": "Price cannot be negative"}), 400

    # Normalize → predict → denormalize
    price_norm   = (price - X_MIN) / (X_MAX - X_MIN)
    qty_norm     = predict(price_norm, M, B)
    qty_real     = denormalize(qty_norm, Y_MIN, Y_MAX)

    # Clamp to valid range (1–10)
    qty_real = max(1.0, min(10.0, qty_real))

    return jsonify({
        "price":              price,
        "predicted_quantity": round(qty_real, 2),
        "model_mse":          round(TEST_MSE, 6)
    })


# ── Route 3: Predict for multiple prices at once ─────────────────────────────

@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Expects JSON body: { "prices": [10000, 50000, 100000] }
    Returns list of predictions.
    """
    data = request.get_json()

    if not data or "prices" not in data:
        return jsonify({"error": "Please send a JSON body with a 'prices' list"}), 400

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


# ── Route 4: Model info ──────────────────────────────────────────────────────

@app.route("/model/info", methods=["GET"])
def model_info():
    return jsonify({
        "algorithm":     "Linear Regression with Gradient Descent",
        "trained_on":    len(x_train),
        "tested_on":     len(x_test),
        "features":      ["Price"],
        "target":        "Quantity Sold",
        "slope_m":       round(M, 6),
        "intercept_b":   round(B, 6),
        "test_mse":      round(TEST_MSE, 6),
        "price_range":   {"min": X_MIN, "max": X_MAX},
        "qty_range":     {"min": Y_MIN, "max": Y_MAX}
    })


# ── Route 5: Collaborative Filtering recommendations ─────────────────────────

@app.route("/recommend/user", methods=["POST"])
def recommend_for_user():
    """
    Expects: { "customer_name": "William Hess" }
    Returns: list of recommended products
    """
    data = request.get_json()
    if not data or "customer_name" not in data:
        return jsonify({"error": "Send a JSON body with 'customer_name'"}), 400

    recs = collaborative_recommend(
        data["customer_name"], df, matrix,
        customers, products_list, c_idx, p_idx
    )

    if not recs:
        return jsonify({"error": "Customer not found"}), 404

    return jsonify({
        "customer":        data["customer_name"],
        "recommendations": recs
    })


# ── Route 6: Content-Based recommendations ───────────────────────────────────

@app.route("/recommend/product", methods=["POST"])
def recommend_similar_products():
    """
    Expects: { "product_code": "88EB4558" }
    Returns: list of similar products
    """
    data = request.get_json()
    if not data or "product_code" not in data:
        return jsonify({"error": "Send a JSON body with 'product_code'"}), 400

    similar = content_based_recommend(
        data["product_code"], p_vectors, p_details
    )

    if not similar:
        return jsonify({"error": "Product code not found"}), 404

    return jsonify({
        "product_code":    data["product_code"],
        "similar_products": similar
    })


# ── Route 7: List available customers (for testing) ──────────────────────────

@app.route("/customers", methods=["GET"])
def list_customers():
    return jsonify({
        "total":     len(customers),
        "sample":    customers[:10]
    })

# ── Start server ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)