# data_prep.py
import pandas as pd


def load_and_prepare():
    df = pd.read_csv("data/ecommerce.csv")

    df = df[["Product", "Brand", "Product Code", "Price", "Quantity Sold",
             "Inward Date", "Customer Name", "Region", "RAM", "ROM"]]

    df["Month"] = pd.to_datetime(df["Inward Date"]).dt.month
    df = df.dropna(subset=["Price", "Quantity Sold"])
    df["Price"]         = df["Price"].astype(float)
    df["Quantity Sold"] = df["Quantity Sold"].astype(float)

    print(f"Dataset ready: {len(df)} rows")
    print(df[["Product", "Price", "Quantity Sold", "Month"]].head(5))
    return df


def normalize(values):
    min_val = min(values)
    max_val = max(values)
    diff    = max_val - min_val
    normalized = [(v - min_val) / diff for v in values]
    return normalized, min_val, max_val


def denormalize(value, min_val, max_val):
    return value * (max_val - min_val) + min_val


if __name__ == "__main__":
    df = load_and_prepare()
    print(f"\nColumns: {df.columns.tolist()}")
    print(f"Shape:   {df.shape}")