# linear_regression.py
from data_prep import load_and_prepare, normalize, denormalize


def mean(values):
    return sum(values) / len(values)


def predict(x, m, b):
    return m * x + b


def mean_squared_error(actual, predicted):
    n = len(actual)
    total = 0
    for i in range(n):
        total += (actual[i] - predicted[i]) ** 2
    return total / n

def mean_absolute_error(actual, predicted):
    """
    MAE: average of |actual - predicted|
    More intuitive than MSE — same units as the target.
    """
    n = len(actual)
    total = 0
    for i in range(n):
        total += abs(actual[i] - predicted[i])
    return total / n


def r_squared(actual, predicted):
    """
    R² score: how much variance our model explains.
    1.0 = perfect. 0.0 = no better than predicting the mean.
    Negative = worse than predicting the mean.
    """
    mean_actual = sum(actual) / len(actual)

    # Total variance in the data
    ss_total = sum((a - mean_actual) ** 2 for a in actual)

    # Variance our model didn't explain
    ss_residual = sum((actual[i] - predicted[i]) ** 2
                      for i in range(len(actual)))

    if ss_total == 0:
        return 1.0

    return 1 - (ss_residual / ss_total)

def train(x_values, y_values, learning_rate=0.1, epochs=2000):
    m = 0.0
    b = 0.0
    n = len(x_values)

    for epoch in range(epochs):
        predictions = [predict(x, m, b) for x in x_values]
        errors      = [predictions[i] - y_values[i] for i in range(n)]
        grad_m      = mean([errors[i] * x_values[i] for i in range(n)])
        grad_b      = mean(errors)
        m           = m - learning_rate * grad_m
        b           = b - learning_rate * grad_b

        if epoch % 200 == 0:
            mse = mean_squared_error(y_values, predictions)
            print(f"  Epoch {epoch:4d} | MSE: {mse:.6f} | "
                  f"m: {m:.6f} | b: {b:.6f}")

    return m, b


def train_test_split(x_values, y_values, test_ratio=0.2):
    split       = int(len(x_values) * (1 - test_ratio))
    x_train     = x_values[:split]
    y_train     = y_values[:split]
    x_test      = x_values[split:]
    y_test      = y_values[split:]
    return x_train, y_train, x_test, y_test


if __name__ == "__main__":
    df = load_and_prepare()

    prices   = df["Price"].tolist()
    qty_sold = df["Quantity Sold"].tolist()

    x_norm, x_min, x_max = normalize(prices)
    y_norm, y_min, y_max = normalize(qty_sold)

    x_train, y_train, x_test, y_test = train_test_split(x_norm, y_norm)

    print(f"\nTraining on {len(x_train)} rows, "
          f"testing on {len(x_test)} rows\n")

    m, b = train(x_train, y_train, learning_rate=0.1, epochs=2000)

    test_preds = [predict(x, m, b) for x in x_test]
    test_mse   = mean_squared_error(y_test, test_preds)
    print(f"\nTest MSE: {test_mse:.6f}")

    print("\n--- Demand Predictions ---")
    for price in [10000, 50000, 100000, 150000, 200000]:
        p_norm   = (price - x_min) / (x_max - x_min)
        q_norm   = predict(p_norm, m, b)
        q_real   = denormalize(q_norm, y_min, y_max)
        q_real   = max(1.0, min(10.0, q_real))
        print(f"  Price ₹{price:>7,}  →  "
              f"Predicted quantity: {q_real:.1f}")