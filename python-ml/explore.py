# app.py
from flask import Flask, request, jsonify
from data_prep import load_and_prepare, normalize, denormalize
from linear_regression import (train, predict,
                                mean_squared_error, train_test_split)
from recommender import (build_user_item_matrix, collaborative_recommend,
                         build_product_features, content_based_recommend)

app = Flask(__name__)

# ── Load data ─────────────────────────────────────────────────────────────────
print("Loading data...")
df = load_and_prepare()

# ── Train Linear Regression ───────────────────────────────────────────────────
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

# ── Build Recommender ─────────────────────────────────────────────────────────
print("\nBuilding recommendation engine...")
matrix, customers, product_keys, c_idx, p_idx = \
    build_user_item_matrix(df)
p_vectors, p_details = build_product_features(df)
print(f"Recommender ready. {len(customers)} customers, "
      f"{len(product_keys)} product types.\n")


# ── Routes ────────────────────────────────────────────────────────────────────

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
            "GET  /customers":         "sample customer names",
            "GET  /products":          "sample product codes"
        }
    })


@app.route("/model/info", methods=["GET"])
def model_info():
    return jsonify({
        "algorithm":   "Linear Regression + Gradient Descent",
        "trained_on":  len(x_train),
        "tested_on":   len(x_test),
        "features":    ["Price"],
        "target":      "Quantity Sold",
        "slope_m":     round(M, 6),
        "intercept_b": round(B, 6),
        "test_mse":    round(TEST_MSE, 6)
    })


@app.route("/predict", methods=["POST"])
def predict_demand():
    data = request.get_json()
    if not data or "price" not in data:
        return jsonify({"error": "Send JSON with a 'price' field"}), 400
    price      = float(data["price"])
    p_norm     = (price - X_MIN) / (X_MAX - X_MIN)
    q_norm     = predict(p_norm, M, B)
    q_real     = denormalize(q_norm, Y_MIN, Y_MAX)
    q_real     = max(1.0, min(10.0, q_real))
    return jsonify({
        "price":              price,
        "predicted_quantity": round(q_real, 2),
        "model_mse":          round(TEST_MSE, 6)
    })


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    data = request.get_json()
    if not data or "prices" not in data:
        return jsonify({"error": "Send JSON with a 'prices' list"}), 400
    results = []
    for price in data["prices"]:
        price  = float(price)
        p_norm = (price - X_MIN) / (X_MAX - X_MIN)
        q_norm = predict(p_norm, M, B)
        q_real = denormalize(q_norm, Y_MIN, Y_MAX)
        q_real = max(1.0, min(10.0, q_real))
        results.append({
            "price":              price,
            "predicted_quantity": round(q_real, 2)
        })
    return jsonify({"predictions": results})


@app.route("/recommend/user", methods=["POST"])
def recommend_for_user():
    data = request.get_json()
    if not data or "customer_name" not in data:
        return jsonify({"error": "Send JSON with 'customer_name'"}), 400
    recs = collaborative_recommend(
        data["customer_name"], df, matrix,
        customers, product_keys, c_idx, p_idx
    )
    if not recs:
        return jsonify({
            "error": "Customer not found or no recommendations.",
            "tip":   "Use GET /customers to see available names"
        }), 404
    return jsonify({
        "customer":        data["customer_name"],
        "algorithm":       "Collaborative Filtering",
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
        "algorithm":        "Content-Based Filtering",
        "similar_products": similar
    })


@app.route("/customers", methods=["GET"])
def list_customers():
    return jsonify({
        "total":  len(customers),
        "sample": customers[:15]
    })


@app.route("/products", methods=["GET"])
def list_products():
    codes = list(p_vectors.keys())
    return jsonify({
        "total":  len(codes),
        "sample": codes[:15]
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)