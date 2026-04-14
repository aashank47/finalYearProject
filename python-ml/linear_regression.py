# linear_regression.py
# Predicts Quantity Sold from Price.
# Every algorithm written from scratch.

import pandas as pd
from data_prep import load_and_prepare, normalize, denormalize


# ── Pure math helpers ────────────────────────────────────────────────────────

def mean(values):
    return sum(values) / len(values)

def predict(x, m, b):
    """y = mx + b"""
    return m * x + b

def mean_squared_error(actual, predicted):
    """
    MSE = average of (actual - predicted)²
    This measures how wrong our model is. Lower = better.
    """
    n = len(actual)
    total = 0
    for i in range(n):
        diff = actual[i] - predicted[i]
        total += diff ** 2
    return total / n


# ── Train using Gradient Descent ─────────────────────────────────────────────

def train(x_values, y_values, learning_rate=0.01, epochs=1000):
    """
    Finds the best m and b by repeatedly adjusting them
    in the direction that reduces error.
    """
    m = 0.0
    b = 0.0
    n = len(x_values)

    for epoch in range(epochs):

        # Step 1: predict with current m and b
        predictions = [predict(x, m, b) for x in x_values]

        # Step 2: calculate how wrong we are for each point
        errors = [predictions[i] - y_values[i] for i in range(n)]

        # Step 3: calculate gradients
        grad_m = mean([errors[i] * x_values[i] for i in range(n)])
        grad_b = mean(errors)

        # Step 4: take a small step in the right direction
        m = m - learning_rate * grad_m
        b = b - learning_rate * grad_b

        # Log progress every 100 steps
        if epoch % 100 == 0:
            mse = mean_squared_error(y_values, predictions)
            print(f"  Epoch {epoch:4d} | MSE: {mse:.6f} | m={m:.6f} | b={b:.6f}")

    return m, b


# ── Split data: 80% train, 20% test ─────────────────────────────────────────

def train_test_split(x_values, y_values, test_ratio=0.2):
    """
    We write this ourselves too.
    First 80% of data = training. Last 20% = testing.
    """
    split_index = int(len(x_values) * (1 - test_ratio))

    x_train = x_values[:split_index]
    y_train = y_values[:split_index]
    x_test  = x_values[split_index:]
    y_test  = y_values[split_index:]

    return x_train, y_train, x_test, y_test


# ── Main: run everything ─────────────────────────────────────────────────────

if __name__ == "__main__":

    # 1. Load data
    df = load_and_prepare()

    # 2. Extract our feature (x) and target (y)
    prices   = df["Price"].tolist()
    qty_sold = df["Quantity Sold"].tolist()

    # 3. Normalize both so gradient descent is stable
    x_norm, x_min, x_max = normalize(prices)
    y_norm, y_min, y_max = normalize(qty_sold)

    # 4. Split into train and test sets
    x_train, y_train, x_test, y_test = train_test_split(x_norm, y_norm)

    print(f"\nTraining on {len(x_train)} rows, testing on {len(x_test)} rows")
    print("\nTraining started — watch the MSE drop:\n")

    # 5. Train
    m, b = train(x_train, y_train, learning_rate=0.01, epochs=1000)

    # 6. Evaluate on the test set
    test_predictions = [predict(x, m, b) for x in x_test]
    test_mse = mean_squared_error(y_test, test_predictions)
    print(f"\nTest MSE (normalized): {test_mse:.6f}")

    # 7. Make a real-world prediction
    print("\n--- Demand Predictions ---")
    test_prices = [10000, 50000, 100000, 150000, 200000]

    for price in test_prices:
        # normalize the input price the same way we did training data
        price_norm = (price - x_min) / (x_max - x_min)

        # predict (gives normalized result)
        qty_norm = predict(price_norm, m, b)

        # denormalize back to real quantity
        qty_real = denormalize(qty_norm, y_min, y_max)

        print(f"  Price ₹{price:>7,}  →  Predicted quantity sold: {qty_real:.1f}")