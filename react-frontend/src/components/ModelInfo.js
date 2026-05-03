import { useState, useEffect } from "react"
import { getModelInfo }        from "../services/api"

function ModelInfo() {
    const [info,    setInfo]    = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)

    useEffect(() => {
        getModelInfo()
            .then(data => setInfo(data))
            .catch(() => setError("Could not load model info."))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p style={styles.center}>Loading model info...</p>
    if (error)   return <p style={styles.error}>{error}</p>

    // Generate interpretation for each metric
    const interpretMSE = (mse) => {
        if (mse < 0.05) return "Excellent — very low prediction error"
        if (mse < 0.15) return "Moderate — acceptable for single-feature model"
        return "High — consider adding more features"
    }

    const interpretMAE = (mae) => {
        const realUnits = (mae * (info.qty_range?.max - info.qty_range?.min)).toFixed(2)
        return `On average predictions are off by ~${realUnits} units`
    }

    const interpretR2 = (r2) => {
        if (r2 > 0.7) return "Strong — model explains most variance"
        if (r2 > 0.3) return "Moderate — model explains some variance"
        return "Low — price alone is a weak predictor of quantity"
    }

    const interpretSlope = (m) => {
        if (m < 0) return "Negative — quantity slightly decreases as price increases"
        if (m > 0) return "Positive — quantity slightly increases as price increases"
        return "Flat — price has almost no effect on quantity"
    }

    const metrics = [
        {
            label:  "TRAINED ON",
            value:  `${info.trained_on?.toLocaleString()} rows`,
            desc:   "Number of data rows the model learned from (80% of dataset)"
        },
        {
            label:  "TESTED ON",
            value:  `${info.tested_on?.toLocaleString()} rows`,
            desc:   "Rows used to evaluate accuracy — never seen during training (20%)"
        },
        {
            label:  "TEST MSE",
            value:  info.test_mse,
            desc:   interpretMSE(info.test_mse),
            highlight: true
        },
        {
            label:  "TEST MAE",
            value:  info.test_mae,
            desc:   interpretMAE(info.test_mae),
            highlight: true
        },
        {
            label:  "R² SCORE",
            value:  info.r_squared,
            desc:   interpretR2(info.r_squared),
            highlight: true
        },
        {
            label:  "SLOPE (M)",
            value:  info.slope_m,
            desc:   interpretSlope(info.slope_m)
        },
        {
            label:  "INTERCEPT (B)",
            value:  info.intercept_b,
            desc:   "Starting point of regression line when price = 0 (normalized)"
        },
        {
            label:  "FEATURE",
            value:  info.features?.join(", "),
            desc:   "Input variable used to make predictions"
        },
        {
            label:  "TARGET",
            value:  info.target,
            desc:   "Output variable the model predicts"
        },
        {
            label:  "PRICE RANGE",
            value:  `Rs${info.price_range?.min?.toLocaleString()} – Rs${info.price_range?.max?.toLocaleString()}`,
            desc:   "Min and max price in dataset — used for normalization"
        },
    ]

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Model Information</h2>
            <p style={styles.subtitle}>
                Details about the ML models powering this system.
                All algorithms were implemented from scratch.
            </p>

            {/* Linear Regression Card */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Demand Prediction Model</h3>
                <p style={styles.cardAlgo}>{info.algorithm}</p>

                <div style={styles.grid}>
                    {metrics.map((m, i) => (
                        <div key={i} style={{
                            ...styles.metric,
                            ...(m.highlight ? styles.metricHighlight : {})
                        }}>
                            <span style={styles.metricLabel}>{m.label}</span>
                            <span style={{
                                ...styles.metricValue,
                                ...(m.highlight ? { color: "#e94560" } : {})
                            }}>
                                {m.value}
                            </span>
                            <span style={styles.metricDesc}>{m.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommender Card */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recommendation Engine</h3>
                <div style={styles.algoGrid}>
                    <div style={styles.algoCard}>
                        <h4 style={styles.algoTitle}>Collaborative Filtering</h4>
                        <p style={styles.algoDesc}>
                            Builds a 9,390 × 40 user-item purchase matrix.
                            Finds similar users using cosine similarity on
                            purchase vectors. Recommends what similar users
                            bought that the target user hasn't bought yet.
                            Falls back to popularity ranking if no similar
                            users are found.
                        </p>
                        <div style={styles.tag}>Cosine Similarity</div>
                    </div>
                    <div style={styles.algoCard}>
                        <h4 style={styles.algoTitle}>Content-Based Filtering</h4>
                        <p style={styles.algoDesc}>
                            Encodes each product as a 5-dimensional feature
                            vector: price, quantity, RAM, ROM, and product type.
                            Computes cosine similarity between target product
                            and all others. Returns top 5 most similar products.
                            Similarity scores near 1.0 indicate near-identical specs.
                        </p>
                        <div style={styles.tag}>Feature Vectors</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container:        { maxWidth: "960px", margin: "0 auto", padding: "32px 16px" },
    title:            { fontSize: "28px", fontWeight: "bold", marginBottom: "8px", color: "#1a1a2e" },
    subtitle:         { color: "#666", marginBottom: "32px", lineHeight: "1.6" },
    card:             { backgroundColor: "#f8f9fa", borderRadius: "16px", padding: "28px", marginBottom: "24px", border: "1px solid #eee" },
    cardTitle:        { fontSize: "20px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "4px" },
    cardAlgo:         { color: "#e94560", fontSize: "13px", marginBottom: "24px" },
    grid:             { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
    metric:           { backgroundColor: "white", borderRadius: "10px", padding: "16px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "4px" },
    metricHighlight:  { border: "1px solid #e9456033", backgroundColor: "#fff8f9" },
    metricLabel:      { fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" },
    metricValue:      { fontSize: "20px", fontWeight: "bold", color: "#1a1a2e" },
    metricDesc:       { fontSize: "12px", color: "#888", lineHeight: "1.5", marginTop: "4px" },
    algoGrid:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    algoCard:         { backgroundColor: "white", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    algoTitle:        { fontSize: "16px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "8px" },
    algoDesc:         { color: "#666", fontSize: "13px", lineHeight: "1.7", marginBottom: "12px" },
    tag:              { display: "inline-block", backgroundColor: "#e94560", color: "white", fontSize: "11px", padding: "3px 10px", borderRadius: "12px" },
    center:           { textAlign: "center", padding: "40px", color: "#888" },
    error:            { textAlign: "center", padding: "40px", color: "#e94560" }
}

export default ModelInfo