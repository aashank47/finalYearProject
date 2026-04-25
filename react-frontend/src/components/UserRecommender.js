// src/components/UserRecommender.js
// Enter a customer name → get product recommendations (Collaborative Filtering)

import { useState }              from "react"
import { recommendForUser,
         getAllCustomers }        from "../services/api"

function UserRecommender() {
    const [customerName, setCustomerName] = useState("")
    const [customers,    setCustomers]    = useState([])
    const [filtered,     setFiltered]     = useState([])
    const [results,      setResults]      = useState(null)
    const [loading,      setLoading]      = useState(false)
    const [loadingList,  setLoadingList]  = useState(false)
    const [error,        setError]        = useState(null)

    // Load customers for autocomplete
    const loadCustomers = async () => {
        if (customers.length > 0) return
        setLoadingList(true)
        try {
            const data = await getAllCustomers()
            setCustomers(data.customers.map(c => c.customerName))
        } catch {
            setError("Could not load customers.")
        } finally {
            setLoadingList(false)
        }
    }

    const handleInput = (value) => {
        setCustomerName(value)
        if (value.length > 1) {
            setFiltered(
                customers
                    .filter(c => c.toLowerCase().includes(value.toLowerCase()))
                    .slice(0, 8)
            )
        } else {
            setFiltered([])
        }
    }

    const selectCustomer = (name) => {
        setCustomerName(name)
        setFiltered([])
    }

    const handleRecommend = async () => {
        if (!customerName.trim()) {
            setError("Please enter a customer name")
            return
        }
        setLoading(true)
        setError(null)
        setResults(null)
        try {
            const data = await recommendForUser(customerName.trim())
            setResults(data)
        } catch (err) {
            setError(
                err.response?.data?.error || "Customer not found."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>User Recommender</h2>
            <p style={styles.subtitle}>
                Enter a customer name to get personalised product recommendations.
                Uses Collaborative Filtering with Cosine Similarity.
            </p>

            {/* Input with autocomplete */}
            <div style={styles.inputWrapper}>
                <div style={styles.inputRow}>
                    <input
                        type="text"
                        value={customerName}
                        onChange={e => handleInput(e.target.value)}
                        onFocus={loadCustomers}
                        placeholder="Type a customer name..."
                        style={styles.input}
                    />
                    <button
                        onClick={handleRecommend}
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? "Finding..." : "Get Recommendations"}
                    </button>
                </div>

                {/* Autocomplete dropdown */}
                {loadingList && (
                    <p style={styles.hint}>Loading customers...</p>
                )}
                {filtered.length > 0 && (
                    <div style={styles.dropdown}>
                        {filtered.map((name, i) => (
                            <div
                                key={i}
                                style={styles.dropdownItem}
                                onClick={() => selectCustomer(name)}
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {/* Results */}
            {results && (
                <div>
                    <h3 style={styles.sectionTitle}>
                        Recommendations for {results.customer}
                    </h3>
                    <p style={styles.algo}>
                        Algorithm: {results.algorithm}
                    </p>
                    <div style={styles.grid}>
                        {results.recommendations.map((r, i) => (
                            <div key={i} style={styles.card}>
                                <div style={styles.rank}>#{i + 1}</div>
                                <p style={styles.cardBrand}>{r.brand}</p>
                                <p style={styles.cardProduct}>{r.product}</p>
                                <p style={styles.cardPrice}>
                                    ₹{r.price?.toLocaleString()}
                                </p>
                                <div style={styles.scoreBadge}>
                                    Score: {r.score}
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
    inputWrapper: { position: "relative", marginBottom: "16px" },
    inputRow:     { display: "flex", gap: "8px" },
    input:        { flex: 1, padding: "12px 16px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" },
    button:       { padding: "12px 24px", backgroundColor: "#e94560", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", whiteSpace: "nowrap" },
    hint:         { color: "#888", fontSize: "13px", marginTop: "4px" },
    dropdown:     { position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: "4px" },
    dropdownItem: { padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: "15px" },
    error:        { color: "#e94560", marginBottom: "16px" },
    sectionTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "4px" },
    algo:         { color: "#888", fontSize: "13px", marginBottom: "20px" },
    grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
    card:         { backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "20px", border: "1px solid #eee", textAlign: "center" },
    rank:         { fontSize: "24px", fontWeight: "bold", color: "#e94560", marginBottom: "8px" },
    cardBrand:    { fontWeight: "bold", fontSize: "16px", color: "#1a1a2e", marginBottom: "4px" },
    cardProduct:  { color: "#555", fontSize: "14px", marginBottom: "8px" },
    cardPrice:    { fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "8px" },
    scoreBadge:   { backgroundColor: "#1a1a2e", color: "white", fontSize: "12px", padding: "4px 10px", borderRadius: "12px", display: "inline-block" }
}

export default UserRecommender