import { useState, useEffect } from "react"
import axios                   from "axios"

const NODE_API = "http://localhost:4000"

function ProductRecommender() {
    const [searchText,  setSearchText]  = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [results,     setResults]     = useState(null)
    const [matched,     setMatched]     = useState(null)
    const [loading,     setLoading]     = useState(false)
    const [loadingList, setLoadingList] = useState(false)
    const [error,       setError]       = useState(null)
    const [showDrop,    setShowDrop]    = useState(false)

    // Load all products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingList(true)
            try {
                const res = await axios.get(`${NODE_API}/products`)
                setAllProducts(res.data.products || [])
            } catch {
                console.log("Could not load products")
            } finally {
                setLoadingList(false)
            }
        }
        fetchProducts()
    }, [])

    // Filter suggestions as user types
    const handleInput = (value) => {
        setSearchText(value)
        setResults(null)
        setError(null)
        setMatched(null)

        if (value.length < 1) {
            setSuggestions([])
            setShowDrop(false)
            return
        }

        const lower    = value.toLowerCase()
        const filtered = allProducts.filter(p => {
            const fullName = `${p.brand} ${p.product}`.toLowerCase()
            const code     = (p.productCode || "").toLowerCase()
            return fullName.includes(lower) || code.includes(lower)
        })

        // Deduplicate by brand+product
        const seen   = new Set()
        const unique = []
        for (const p of filtered) {
            const key = `${p.brand}_${p.product}`
            if (!seen.has(key)) {
                seen.add(key)
                unique.push(p)
            }
            if (unique.length >= 8) break
        }

        setSuggestions(unique)
        setShowDrop(true)
    }

    const selectSuggestion = (product) => {
        setSearchText(`${product.brand} ${product.product} — ${product.productCode}`)
        setSuggestions([])
        setShowDrop(false)
    }

    const handleRecommend = async () => {
        if (!searchText.trim()) {
            setError("Please enter a product name or code")
            return
        }
        setLoading(true)
        setError(null)
        setResults(null)
        setMatched(null)
        setShowDrop(false)

        try {
            const codeMatch = searchText.match(/—\s*([A-Z0-9]+)$/i) ||
                              searchText.match(/^([A-F0-9]{8})$/i)

            let response

            if (codeMatch) {
                const code = codeMatch[1].trim()
                response   = await axios.post(
                    `${NODE_API}/ml/recommend/product`,
                    { product_code: code }
                )
                setMatched({ productCode: code })
            } else {
                response = await axios.post(
                    `${NODE_API}/ml/recommend/by-name`,
                    { product_name: searchText.trim() }
                )
                setMatched(response.data.matched_product)
            }

            setResults(response.data.similar_products)

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Product not found. Try 'Apple Laptop' or a product code."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Product Recommender</h2>
            <p style={styles.subtitle}>
                Search by product name or product code to find similar products.
                Uses Content-Based Filtering with Cosine Similarity.
            </p>

            {/* Search input */}
            <div style={styles.inputWrapper}>
                <div style={styles.inputRow}>
                    <div style={styles.inputBox}>
                        <input
                            type="text"
                            value={searchText}
                            onChange={e => handleInput(e.target.value)}
                            onFocus={() => searchText && setShowDrop(true)}
                            onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                            placeholder='Search e.g. "Apple Laptop" or paste code "88EB4558"'
                            style={styles.input}
                            onKeyDown={e => {
                                if (e.key === "Enter")  handleRecommend()
                                if (e.key === "Escape") setShowDrop(false)
                            }}
                        />
                        {/* Loading spinner inside input */}
                        {loadingList && (
                            <div style={styles.spinner}>⟳</div>
                        )}
                    </div>
                    <button
                        onClick={handleRecommend}
                        disabled={loading || loadingList}
                        style={styles.button}
                    >
                        {loading ? "Finding..." : "Find Similar"}
                    </button>
                </div>

                {/* Loading state for dropdown */}
                {loadingList && (
                    <div style={styles.loadingDrop}>
                        Loading products...
                    </div>
                )}

                {/* Dropdown */}
                {showDrop && !loadingList && suggestions.length > 0 && (
                    <div style={styles.dropdown}>
                        {suggestions.map((p, i) => (
                            <div
                                key={i}
                                style={styles.dropdownItem}
                                onMouseDown={() => selectSuggestion(p)}
                            >
                                <div style={styles.dropLeft}>
                                    <span style={styles.dropName}>
                                        {p.brand} {p.product}
                                    </span>
                                    <span style={styles.dropCode}>
                                        {p.productCode}
                                    </span>
                                </div>
                                <div style={styles.dropRight}>
                                    <span style={styles.dropPrice}>
                                        Rs{p.price?.toLocaleString()}
                                    </span>
                                    {p.ram && (
                                        <span style={styles.dropRam}>
                                            {p.ram}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No results in dropdown */}
                {showDrop && !loadingList &&
                 searchText.length > 1 && suggestions.length === 0 && (
                    <div style={styles.noResults}>
                        No products found matching "{searchText}"
                    </div>
                )}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {/* Matched product banner */}
            {matched && (
                <div style={styles.matchedBox}>
                    <span style={styles.matchedLabel}>
                        Showing results similar to:
                    </span>
                    {matched.brand && (
                        <span style={styles.matchedName}>
                            {matched.brand} {matched.product}
                        </span>
                    )}
                    {matched.price && (
                        <span style={styles.matchedPrice}>
                            Rs{matched.price?.toLocaleString()}
                        </span>
                    )}
                    {matched.ram && (
                        <span style={styles.matchedRam}>
                            RAM: {matched.ram}
                        </span>
                    )}
                    {matched.productCode && (
                        <span style={styles.matchedCode}>
                            Code: {matched.productCode}
                        </span>
                    )}
                </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
                <div>
                    <h3 style={styles.sectionTitle}>Similar Products</h3>
                    <p style={styles.algo}>
                        Algorithm: Content-Based Filtering (Cosine Similarity)
                    </p>
                    <div style={styles.grid}>
                        {results.map((p, i) => (
                            <div key={i} style={styles.card}>
                                <div style={styles.cardTop}>
                                    <span style={styles.cardBrand}>
                                        {p.brand}
                                    </span>
                                    <span style={styles.simBadge}>
                                        {(p.similarity * 100).toFixed(1)}% match
                                    </span>
                                </div>
                                <p style={styles.cardProduct}>{p.product}</p>
                                <p style={styles.cardPrice}>
                                    Rs{p.price?.toLocaleString()}
                                </p>
                                <div style={styles.cardSpecs}>
                                    {p.ram && <span>RAM: {p.ram}</span>}
                                    {p.rom && <span>ROM: {p.rom}</span>}
                                </div>
                                <p style={styles.cardCode}>
                                    Code: {p.product_code}
                                </p>
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
    title:        { fontSize: "28px", fontWeight: "bold", marginBottom: "8px", color: "#1a1a2e" },
    subtitle:     { color: "#666", marginBottom: "24px", lineHeight: "1.6" },
    inputWrapper: { position: "relative", marginBottom: "16px" },
    inputRow:     { display: "flex", gap: "8px" },
    inputBox:     { flex: 1, position: "relative" },
    input:        { width: "100%", padding: "12px 40px 12px 16px", fontSize: "15px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", boxSizing: "border-box" },
    spinner:      { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#e94560", fontSize: "18px", animation: "spin 1s linear infinite" },
    button:       { padding: "12px 24px", backgroundColor: "#e94560", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold", whiteSpace: "nowrap" },
    loadingDrop:  { position: "absolute", top: "100%", left: 0, right: "140px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "12px 16px", color: "#888", fontSize: "13px", zIndex: 10, marginTop: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
    dropdown:     { position: "absolute", top: "100%", left: 0, right: "140px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", marginTop: "4px", maxHeight: "300px", overflowY: "auto" },
    dropdownItem: { padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" },
    dropLeft:     { display: "flex", flexDirection: "column", gap: "2px" },
    dropName:     { fontWeight: "bold", color: "#1a1a2e", fontSize: "14px" },
    dropCode:     { fontFamily: "monospace", fontSize: "11px", color: "#aaa" },
    dropRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" },
    dropPrice:    { color: "#e94560", fontSize: "13px", fontWeight: "bold" },
    dropRam:      { backgroundColor: "#f0f0f0", padding: "1px 6px", borderRadius: "4px", fontSize: "11px", color: "#555" },
    noResults:    { position: "absolute", top: "100%", left: 0, right: "140px", backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "12px 16px", color: "#aaa", fontSize: "13px", zIndex: 10, marginTop: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
    error:        { color: "#e94560", marginBottom: "16px", fontSize: "14px" },
    matchedBox:   { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f8f9fa", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", flexWrap: "wrap", borderLeft: "4px solid #e94560" },
    matchedLabel: { color: "#888", fontSize: "13px" },
    matchedName:  { fontWeight: "bold", color: "#1a1a2e", fontSize: "15px" },
    matchedPrice: { color: "#e94560", fontSize: "13px" },
    matchedRam:   { backgroundColor: "#e94560", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" },
    matchedCode:  { fontFamily: "monospace", fontSize: "12px", color: "#aaa" },
    sectionTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "4px", color: "#1a1a2e" },
    algo:         { color: "#888", fontSize: "13px", marginBottom: "20px" },
    grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
    card:         { backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
    cardBrand:    { fontWeight: "bold", color: "#1a1a2e", fontSize: "16px" },
    simBadge:     { backgroundColor: "#e94560", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "12px" },
    cardProduct:  { color: "#555", fontSize: "14px", marginBottom: "4px" },
    cardPrice:    { fontSize: "20px", fontWeight: "bold", color: "#e94560", marginBottom: "8px" },
    cardSpecs:    { display: "flex", gap: "8px", fontSize: "12px", color: "#888", flexWrap: "wrap", marginBottom: "6px" },
    cardCode:     { fontFamily: "monospace", fontSize: "11px", color: "#ccc" }
}

export default ProductRecommender