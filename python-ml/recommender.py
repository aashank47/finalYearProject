# recommender.py
# Collaborative Filtering + Content-Based Filtering
# Built entirely from scratch. No surprise libraries.

import pandas as pd
import math
from data_prep import load_and_prepare


# ════════════════════════════════════════════════════════════════
#  CORE MATH — used by both algorithms
# ════════════════════════════════════════════════════════════════

def dot_product(vec_a, vec_b):
    """
    Multiply matching pairs and sum them.
    [1,2,3] · [4,5,6] = 1×4 + 2×5 + 3×6 = 32
    """
    total = 0
    for i in range(len(vec_a)):
        total += vec_a[i] * vec_b[i]
    return total


def magnitude(vec):
    """
    Length of a vector = square root of sum of squares.
    |[3,4]| = √(9+16) = √25 = 5
    """
    total = 0
    for v in vec:
        total += v ** 2
    return math.sqrt(total)


def cosine_similarity(vec_a, vec_b):
    """
    How similar are two vectors? Returns 0.0 to 1.0.
    1.0 = identical direction, 0.0 = nothing in common.
    """
    mag_a = magnitude(vec_a)
    mag_b = magnitude(vec_b)

    # Avoid division by zero (empty vector)
    if mag_a == 0 or mag_b == 0:
        return 0.0

    return dot_product(vec_a, vec_b) / (mag_a * mag_b)


# ════════════════════════════════════════════════════════════════
#  PART 1 — COLLABORATIVE FILTERING
#  "Users who bought what you bought, also bought this"
# ════════════════════════════════════════════════════════════════

def build_user_item_matrix(df):
    """
    Build a matrix where:
      rows    = customers
      columns = Product+Brand combinations (e.g. "Laptop_Apple")
      values  = total quantity purchased

    We use Product+Brand instead of Product Code because every
    Product Code is unique — no two customers share the same code,
    making all similarities 0. Product+Brand gives real overlap.
    """
    # Create a product key from Product + Brand
    df = df.copy()
    df["product_key"] = df["Product"] + "_" + df["Brand"]

    customers    = df["Customer Name"].unique().tolist()
    product_keys = df["product_key"].unique().tolist()

    customer_index = {c: i for i, c in enumerate(customers)}
    product_index  = {p: i for i, p in enumerate(product_keys)}

    # Empty matrix
    matrix = []
    for _ in customers:
        matrix.append([0] * len(product_keys))

    # Fill in quantities
    for _, row in df.iterrows():
        c_idx = customer_index[row["Customer Name"]]
        p_idx = product_index[row["product_key"]]
        matrix[c_idx][p_idx] += row["Quantity Sold"]

    return matrix, customers, product_keys, customer_index, product_index
def find_similar_users(target_customer, matrix, customers,
                       customer_index, top_n=5):
    """
    Find the top N users most similar to the target customer.
    Similarity is measured by cosine similarity of their
    purchase history vectors.
    """
    if target_customer not in customer_index:
        return []

    target_idx    = customer_index[target_customer]
    target_vector = matrix[target_idx]

    similarities = []
    for i, customer in enumerate(customers):
        if customer == target_customer:
            continue   # skip comparing to self

        sim = cosine_similarity(target_vector, matrix[i])
        similarities.append((customer, sim))

    # Sort by similarity descending, take top N
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_n]


def collaborative_recommend(target_customer, df, matrix, customers,
                            products, customer_index, product_index,
                            top_n=5):
    """
    Recommend product+brand combos based on similar users' purchases.
    """
    if target_customer not in customer_index:
        return []

    df = df.copy()
    df["product_key"] = df["Product"] + "_" + df["Brand"]

    # What has target already bought
    target_idx     = customer_index[target_customer]
    already_bought = set()
    for p_idx, qty in enumerate(matrix[target_idx]):
        if qty > 0:
            already_bought.add(products[p_idx])

    # Find similar users
    similar_users = find_similar_users(
        target_customer, matrix, customers, customer_index, top_n=10
    )

    # Score products bought by similar users
    product_score = {}
    for similar_customer, similarity in similar_users:
        s_idx = customer_index[similar_customer]
        for p_idx, qty in enumerate(matrix[s_idx]):
            if qty > 0:
                key = products[p_idx]
                if key not in already_bought:
                    if key not in product_score:
                        product_score[key] = 0
                    product_score[key] += similarity * qty

    # Sort and take top N
    ranked    = sorted(product_score.items(), key=lambda x: x[1], reverse=True)
    top_keys  = [key for key, score in ranked[:top_n]]

    # Build result using product_key to look up details
    recommendations = []
    for key in top_keys:
        match = df[df["product_key"] == key]
        if not match.empty:
            row = match.iloc[0]
            recommendations.append({
                "product_key": key,
                "product":     row["Product"],
                "brand":       row["Brand"],
                "price":       row["Price"],
                "score":       round(product_score[key], 4)
            })

    return recommendations
# ════════════════════════════════════════════════════════════════
#  PART 2 — CONTENT-BASED FILTERING
#  "Similar products to this one, based on specs"
# ════════════════════════════════════════════════════════════════

def build_product_features(df):
    """
    Turn each product's specs into a numeric vector.

    We encode:
      - Price        (normalized 0-1)
      - Quantity     (normalized 0-1)
      - Product type (Laptop=1, Mobile=0)
      - RAM          (extracted number: 8GB → 8)
      - ROM          (extracted number: 128GB → 128)

    One row per unique Product Code.
    """

    def extract_gb(value):
        """'8GB' → 8,  '256GB' → 256,  '1TB' → 1024"""
        if pd.isna(value):
            return 0
        value = str(value).upper().strip()
        if "TB" in value:
            return int(value.replace("TB", "").strip()) * 1024
        if "GB" in value:
            return int(value.replace("GB", "").strip())
        return 0

    def normalize_list(values):
        min_v = min(values)
        max_v = max(values)
        diff  = max_v - min_v
        if diff == 0:
            return [0.5] * len(values)
        return [(v - min_v) / diff for v in values]

    # One entry per unique product code
    unique = df.drop_duplicates(subset="Product Code").copy()
    unique = unique.reset_index(drop=True)

    prices  = normalize_list(unique["Price"].tolist())
    qtys    = normalize_list(unique["Quantity Sold"].tolist())
    rams    = normalize_list([extract_gb(r) for r in unique["RAM"].tolist()])
    roms    = normalize_list([extract_gb(r) for r in unique["ROM"].tolist()])
    is_laptop = [1 if p == "Laptop" else 0 for p in unique["Product"].tolist()]

    # Build feature vectors — one per product
    product_vectors = {}
    product_details = {}

    for i in range(len(unique)):
        code = unique.iloc[i]["Product Code"]
        product_vectors[code] = [
            prices[i],
            qtys[i],
            rams[i],
            roms[i],
            is_laptop[i]
        ]
        product_details[code] = {
            "product": unique.iloc[i]["Product"],
            "brand":   unique.iloc[i]["Brand"],
            "price":   unique.iloc[i]["Price"],
            "ram":     unique.iloc[i]["RAM"],
            "rom":     unique.iloc[i]["ROM"],
        }

    return product_vectors, product_details


def content_based_recommend(target_code, product_vectors,
                            product_details, top_n=5):
    """
    Find the top N products most similar to target_code
    based on their feature vectors.
    """
    if target_code not in product_vectors:
        return []

    target_vector = product_vectors[target_code]

    similarities = []
    for code, vector in product_vectors.items():
        if code == target_code:
            continue
        sim = cosine_similarity(target_vector, vector)
        similarities.append((code, sim))

    # Sort by similarity
    similarities.sort(key=lambda x: x[1], reverse=True)
    top = similarities[:top_n]

    recommendations = []
    for code, sim in top:
        details = product_details[code]
        recommendations.append({
            "product_code": code,
            "product":      details["product"],
            "brand":        details["brand"],
            "price":        details["price"],
            "ram":          details["ram"],
            "rom":          details["rom"],
            "similarity":   round(sim, 4)
        })

    return recommendations


# ════════════════════════════════════════════════════════════════
#  TEST — run both algorithms
# ════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    df = load_and_prepare(sample_for_recommender=True)
    
    print("=" * 55)
    print("  PART 1 — Collaborative Filtering")
    print("=" * 55)

    print("\nBuilding user-item matrix...")
    matrix, customers, products, c_idx, p_idx = build_user_item_matrix(df)
    print(f"Matrix size: {len(customers)} customers x {len(products)} products")

    # Pick first customer as test
    test_customer = customers[0]
    print(f"\nFinding recommendations for: {test_customer}")

    recs = collaborative_recommend(
        test_customer, df, matrix, customers, products, c_idx, p_idx
    )

    print(f"\nTop recommendations:")
    for r in recs:
        print(f"  {r['brand']:12} {r['product']:15} "
              f"₹{r['price']:>8,.0f}   score: {r['score']}")

    print("\n" + "=" * 55)
    print("  PART 2 — Content-Based Filtering")
    print("=" * 55)

    print("\nBuilding product feature vectors...")
    p_vectors, p_details = build_product_features(df)
    print(f"Built vectors for {len(p_vectors)} unique products")

    # Pick first product code as test
    test_code = list(p_vectors.keys())[0]
    test_info = p_details[test_code]
    print(f"\nFinding products similar to:")
    print(f"  {test_info['brand']} {test_info['product']} "
          f"| ₹{test_info['price']:,} | RAM: {test_info['ram']}")

    similar = content_based_recommend(test_code, p_vectors, p_details)

    print(f"\nMost similar products:")
    for r in similar:
        print(f"  {r['brand']:12} {r['product']:15} "
              f"₹{r['price']:>8,.0f}  RAM:{r['ram']:6}  "
              f"similarity: {r['similarity']}")