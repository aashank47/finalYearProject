import pandas as pd

# Load your dataset — adjust the filename to match yours
df = pd.read_csv("data/ecommerce.csv")

# ── Basic info ──────────────────────────────────────────
print("Shape (rows, columns):", df.shape)
print()
print("Column names:")
print(df.columns.tolist())
print()
print("First 5 rows:")
print(df.head())
print()

# ── Check for missing values ────────────────────────────
print("Missing values per column:")
print(df.isnull().sum())
print()

# ── Basic statistics ────────────────────────────────────
print("Basic statistics:")
print(df.describe())