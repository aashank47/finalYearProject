// src/components/ProductRecommender.js
// Enter a product code → get similar products (Content-Based Filtering)

import { useState }                    from "react"
import { recommendSimilarProducts,
         getAllProducts }               from "../services/api"

function ProductRecommender() {
    const [productCode,    setProductCode]    = useState("")
    const [suggestions,    setSuggestions]    = useState([])
    const [results,        setResults]        = useState(null)
    const [loading,        setLoading]        = useState(false)
    const [loadingSuggest, setLoadingSuggest] = useState(false)
    const [error,          setError]          = useState(null)

    // Load product codes for the dropdown
    const loadSuggestions = async () => {
        if (suggestions.length > 0) return
        setLoadingSuggest(true)
        try {
            const data = await getAllProducts()
            setSuggestions(data.products.slice(0, 100))
        } catch {
            setError("Could not load products.")
        } finally {
            setLoadingSuggest(false)
        }
    }

    const handleRecommend = async () => {
        if (!productCode.trim()) {
            setError("Please enter or select a product code")
            return
        }
        setLoading(true)
        setError(null)
        setResults(null)
        try {
            const data = await recommendSimilarProducts(productCode.trim())
            setResults(data)
        } catch (err) {
            setError(
                err.response?.data?.error || "Product not found."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Product Recommender</h2>
            <p style={styles.subtitle}>
                Enter a product code to find similar products.
                Uses Content-Based Filtering with Cosine Similarity.
            </p>

            {/* Input */}
            <div style={styles.inputRow}>
                <input
                    type="text"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    onFocus={loadSuggestions}
                    placeholder="Enter product code e.g. 88EB4558"
                    style={styles.input}
                />
                <button
                    onClick={handleRecommend}
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? "Finding..." : "Find Similar"}
                </button>
            </div>

            {/* Dropdown suggestions */}
            {loadingSuggest && <p style={styles.hint}>Loading products...</p>}
            {suggestions.length > 0 && !productCode && (
                <div style={styles.dropdown}>
                    {suggestions.map(p => (
                        <div
                            key={p.productCode}
                            style={styles.dropdownItem}
                            onClick={() => setProductCode(p.productCode)}
                        >
                            <span style={styles.code}>{p.productCode}</span>
                            <span style={styles.dropLabel}>
                                {p.brand} {p.product} — ₹{p.price?.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            {/* Results */}
            {results && (
                <div>
                    <h3 style={styles.sectionTitle}>
                        Similar to product: {results.product_code}
                    </h3>
                    <p style={styles.algo}>
                        Algorithm: {results.algorithm}
                    </p>
                    <div style={styles.grid}>
                        {results.similar_products.map((p, i) => (
                            <div key={i} style={styles.card}>
                                <div style={styles.cardTop}>
                                    <span style={styles.cardBrand}>{p.brand}</span>
                                    <span style={styles.simBadge}>
                                        {(p.similarity * 100).toFixed(1)}% match
                                    </span>
                                </div>
                                <p style={styles.cardProduct}>{p.product}</p>
                                <p style={styles.cardPrice}>
                                    ₹{p.price?.toLocaleString()}
                                </p>
                                <div style={styles.cardSpecs}>
                                    <span>RAM: {p.ram}</span>
                                    <span>ROM: {p.rom}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    container:    { maxWidth: "900px", margin: "0 auto", padding: "32px 16px" },
    title:        { fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
    subtitle:     { color: "#666", marginBottom: "24px", lineHeight: "1.6" },
    inputRow:     { display: "flex", gap: "8px", marginBottom: "8px" },
    input:        { flex: 1, padding: "12px 16px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" },
    button:       { padding: "12px 24px", backgroundColor: "#e94560", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" },
    hint:         { color: "#888", fontSize: "13px", marginBottom: "8px" },
    dropdown:     { border: "1px solid #ddd", borderRadius: "8px", maxHeight: "200px", overflowY: "auto", marginBottom: "16px" },
    dropdownItem: { padding: "10px 16px", cursor: "pointer", display: "flex", gap: "12px", alignItems: "center", borderBottom: "1px solid #f0f0f0" },
    code:         { fontFamily: "monospace", backgroundColor: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", fontSize: "13px" },
    dropLabel:    { color: "#555", fontSize: "14px" },
    error:        { color: "#e94560", marginBottom: "16px" },
    sectionTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "4px" },
    algo:         { color: "#888", fontSize: "13px", marginBottom: "20px" },
    grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
    card:         { backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    cardBrand:    { fontWeight: "bold", color: "#1a1a2e", fontSize: "16px" },
    simBadge:     { backgroundColor: "#e94560", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "12px" },
    cardProduct:  { color: "#555", fontSize: "14px", marginBottom: "4px" },
    cardPrice:    { fontSize: "20px", fontWeight: "bold", color: "#e94560", marginBottom: "8px" },
    cardSpecs:    { display: "flex", gap: "8px", fontSize: "12px", color: "#888" }
}

export default ProductRecommender