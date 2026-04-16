# data_prep.py
# Clean and prepare our dataset for Linear Regression.
# We do everything manually — no sklearn preprocessing.

import pandas as pd

def load_and_prepare(sample_for_recommender=False):
    df = pd.read_csv("data/ecommerce.csv")

    df = df[["Product", "Brand", "Product Code", "Price", "Quantity Sold",
             "Inward Date", "Customer Name", "Region", "RAM", "ROM"]]

    df["Month"] = pd.to_datetime(df["Inward Date"]).dt.month

    df = df.dropna(subset=["Price", "Quantity Sold"])

    df["Price"]         = df["Price"].astype(float)
    df["Quantity Sold"] = df["Quantity Sold"].astype(float)

    if sample_for_recommender:
        # Keep only customers who appear at least 3 times
        # These are the only users we can meaningfully compare
        purchase_counts = df["Customer Name"].value_counts()
        repeat_customers = purchase_counts[purchase_counts >= 3].index
        df = df[df["Customer Name"].isin(repeat_customers)]

        # Also cap at 5000 rows so the matrix stays small
        df = df.head(5000)

        print(f"Recommender dataset: {len(df)} rows, "
              f"{df['Customer Name'].nunique()} customers, "
              f"{df['Product Code'].nunique()} products")
    else:
        print(f"Dataset ready: {len(df)} rows")

    print(df[["Product", "Price", "Quantity Sold", "Month"]].head(10))
    return df
def normalize(values):
    """
    Scale values to 0-1 range so gradient descent works properly.
    Formula: (value - min) / (max - min)
    We write this ourselves — no sklearn.
    """
    min_val = min(values)
    max_val = max(values)
    diff    = max_val - min_val

    normalized = []
    for v in values:
        normalized.append((v - min_val) / diff)

    return normalized, min_val, max_val


def denormalize(normalized_val, min_val, max_val):
    """
    Convert a normalized prediction back to the real scale.
    Reverse of normalize.
    """
    return normalized_val * (max_val - min_val) + min_val


if __name__ == "__main__":
    df = load_and_prepare()

    # Test normalization
    prices = df["Price"].tolist()
    norm_prices, p_min, p_max = normalize(prices)

    print(f"\nOriginal price range:   {p_min} → {p_max}")
    print(f"Normalized price range: {min(norm_prices):.4f} → {max(norm_prices):.4f}")
    print(f"First 5 normalized:     {[round(x,4) for x in norm_prices[:5]]}")