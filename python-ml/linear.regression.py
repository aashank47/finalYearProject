# linear_regression.py
# Linear Regression built entirely from scratch.
# No sklearn. Only math.

import pandas as pd


# ── Helper math functions (no numpy needed for these) ───────────────────────

def mean(values):
    """Calculate the average of a list of numbers."""
    return sum(values) / len(values)


def predict(x, m, b):
    """
    Apply the line formula: y = mx + b
    x = input value (e.g. month number)
    m = slope
    b = intercept
    """
    return m * x + b


# ── The core algorithm ──────────────────────────────────────────────────────

def train(x_values, y_values, learning_rate=0.01, epochs=1000):
    """
    Train Linear Regression using Gradient Descent.

    x_values     : list of input values  (e.g. [1,2,3,4,5...])
    y_values     : list of target values (e.g. units sold per month)
    learning_rate: how big each adjustment step is
    epochs       : how many times we loop through all the data
    """

    m = 0.0   # start slope at 0 (random starting point)
    b = 0.0   # start intercept at 0

    n = len(x_values)   # number of data points

    for epoch in range(epochs):

        # ── Step 1: make predictions with current m and b ──
        predictions = []
        for x in x_values:
            predictions.append(predict(x, m, b))

        # ── Step 2: calculate errors (predicted - actual) ──
        errors = []
        for i in range(n):
            error = predictions[i] - y_values[i]
            errors.append(error)

        # ── Step 3: calculate gradients (which direction to move) ──
        # Gradient for m: average of (error × x)
        grad_m_total = 0
        for i in range(n):
            grad_m_total += errors[i] * x_values[i]
        grad_m = grad_m_total / n

        # Gradient for b: average of error
        grad_b = mean(errors)

        # ── Step 4: update m and b (take one step) ──
        m = m - learning_rate * grad_m
        b = b - learning_rate * grad_b

        # Print progress every 100 epochs so we can watch it learn
        if epoch % 100 == 0:
            # Calculate MSE (Mean Squared Error) to see how wrong we are
            mse = mean([e ** 2 for e in errors])
            print(f"Epoch {epoch:4d} | MSE: {mse:.4f} | m: {m:.4f} | b: {b:.4f}")

    return m, b


# ── Evaluation ──────────────────────────────────────────────────────────────

def mean_squared_error(actual, predicted):
    """
    MSE: average of (actual - predicted)²
    Lower = better. 0 = perfect.
    """
    n = len(actual)
    total = 0
    for i in range(n):
        total += (actual[i] - predicted[i]) ** 2
    return total / n


# ── Run it on real data ─────────────────────────────────────────────────────

if __name__ == "__main__":

    df = pd.read_csv("data/ecommerce.csv")

    # We'll use these two columns — adjust names to match YOUR dataset
    # x = some numeric feature (e.g. month, price, discount_percent)
    # y = what we want to predict (e.g. units_sold, quantity)

    print("Your columns:", df.columns.tolist())
    print(df.head())

    # ── Tell me your column names and I'll fill these in exactly ──
    # x_col = "month"       ← replace with your column
    # y_col = "units_sold"  ← replace with your column

    # x_values = df[x_col].tolist()
    # y_values = df[y_col].tolist()

    # print(f"\nTraining on {len(x_values)} data points...")
    # m, b = train(x_values, y_values)

    # print(f"\nFinal model: sales = {m:.4f} × month + {b:.4f}")

    # # Test a prediction
    # test_month = 13
    # prediction = predict(test_month, m, b)
    # print(f"Predicted sales for month {test_month}: {prediction:.1f}")