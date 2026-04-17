# recommender.py
import math
import pandas as pd
from data_prep import load_and_prepare


# ── Core math ────────────────────────────────────────────────────────────────

def dot_product(a, b):
    total = 0
    for i in range(len(a)):
        total += a[i] * b[i]
    return total


def magnitude(vec):
    total = 0
    for v in vec:
        total += v ** 2
    return math.sqrt(total)


def cosine_similarity(a, b):
    mag_a = magnitude(a)
    mag_b = magnitude(b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot_product(a, b) / (mag_a * mag_b)


# ── Collaborative Filtering ──────────────────────────────────────────────────

def build_user_item_matrix(df):
    df = df.copy()
    df["product_key"] = df["Product"] + "_" + df["Brand"]

    customers    = df["Customer Name"].unique().tolist()
    product_keys = df["product_key"].unique().tolist()

    customer_index = {c: i for i, c in enumerate(customers)}
    product_index  = {p: i for i, p in enumerate(product_keys)}

    matrix = [[0] * len(product_keys) for _ in customers]

    for _, row in df.iterrows():
        c = customer_index[row["Customer Name"]]
        p = product_index[row["product_key"]]
        matrix[c][p] += row["Quantity Sold"]

    return matrix, customers, product_keys, customer_index, product_index


def find_similar_users(target, matrix, customers, customer_index, top_n=10):
    if target not in customer_index:
        return []
    t_idx  = customer_index[target]
    t_vec  = matrix[t_idx]
    scores = []
    for i, customer in enumerate(customers):
        if customer == target:
            continue
        sim = cosine_similarity(t_vec, matrix[i])
        scores.append((customer, sim))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_n]


def collaborative_recommend(target, df, matrix, customers,
                            product_keys, customer_index,
                            product_index, top_n=5):
    if target not in customer_index:
        return []

    df = df.copy()
    df["product_key"] = df["Product"] + "_" + df["Brand"]

    t_idx          = customer_index[target]
    already_bought = set()
    for p_idx, qty in enumerate(matrix[t_idx]):
        if qty > 0:
            already_bought.add(product_keys[p_idx])

    similar_users = find_similar_users(
        target, matrix, customers, customer_index
    )

    product_score = {}
    for similar_customer, similarity in similar_users:
        s_idx = customer_index[similar_customer]
        for p_idx, qty in enumerate(matrix[s_idx]):
            if qty > 0:
                key = product_keys[p_idx]
                if key not in already_bought:
                    product_score[key] = (
                        product_score.get(key, 0) + similarity * qty
                    )

    ranked   = sorted(product_score.items(),
                      key=lambda x: x[1], reverse=True)
    top_keys = [k for k, _ in ranked[:top_n]]

    results = []
    for key in top_keys:
        match = df[df["product_key"] == key]
        if not match.empty:
            row = match.iloc[0]
            results.append({
                "product_key": key,
                "product":     row["Product"],
                "brand":       row["Brand"],
                "price":       row["Price"],
                "score":       round(product_score[key], 4)
            })
    return results


# ── Content-Based Filtering ──────────────────────────────────────────────────

def build_product_features(df):

    def extract_gb(value):
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

    unique = df.drop_duplicates(subset="Product Code").copy()
    unique = unique.reset_index(drop=True)

    prices    = normalize_list(unique["Price"].tolist())
    qtys      = normalize_list(unique["Quantity Sold"].tolist())
    rams      = normalize_list([extract_gb(r) for r in unique["RAM"]])
    roms      = normalize_list([extract_gb(r) for r in unique["ROM"]])
    is_laptop = [1 if p == "Laptop" else 0 for p in unique["Product"]]

    product_vectors = {}
    product_details = {}

    for i in range(len(unique)):
        code = unique.iloc[i]["Product Code"]
        product_vectors[code] = [
            prices[i], qtys[i], rams[i], roms[i], is_laptop[i]
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
    if target_code not in product_vectors:
        return []

    target_vec = product_vectors[target_code]
    scores     = []

    for code, vec in product_vectors.items():
        if code == target_code:
            continue
        sim = cosine_similarity(target_vec, vec)
        scores.append((code, sim))

    scores.sort(key=lambda x: x[1], reverse=True)

    results = []
    for code, sim in scores[:top_n]:
        d = product_details[code]
        results.append({
            "product_code": code,
            "product":      d["product"],
            "brand":        d["brand"],
            "price":        d["price"],
            "ram":          d["ram"],
            "rom":          d["rom"],
            "similarity":   round(sim, 4)
        })
    return results


# ── Test ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    df = load_and_prepare()

    print("\n" + "=" * 55)
    print("  PART 1 — Collaborative Filtering")
    print("=" * 55)

    matrix, customers, product_keys, c_idx, p_idx = \
        build_user_item_matrix(df)
    print(f"Matrix: {len(customers)} customers x "
          f"{len(product_keys)} product types")

    test_customer = customers[0]
    print(f"\nRecommendations for: {test_customer}")

    recs = collaborative_recommend(
        test_customer, df, matrix, customers,
        product_keys, c_idx, p_idx
    )

    if recs:
        for r in recs:
            print(f"  {r['brand']:12} {r['product']:15} "
                  f"₹{r['price']:>8,.0f}   score: {r['score']}")
    else:
        print("  No recommendations found for this customer.")
        print(f"  Try another — sample customers: {customers[1:4]}")

    print("\n" + "=" * 55)
    print("  PART 2 — Content-Based Filtering")
    print("=" * 55)

    p_vectors, p_details = build_product_features(df)
    print(f"Vectors built for {len(p_vectors)} unique products")

    test_code = list(p_vectors.keys())[0]
    info      = p_details[test_code]
    print(f"\nSimilar to: {info['brand']} {info['product']} "
          f"| ₹{info['price']:,} | RAM: {info['ram']}")

    similar = content_based_recommend(test_code, p_vectors, p_details)
    for r in similar:
        print(f"  {r['brand']:12} {r['product']:15} "
              f"₹{r['price']:>8,.0f}  RAM: {r['ram']:6}  "
              f"similarity: {r['similarity']}")