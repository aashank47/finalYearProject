// src/components/ModelInfo.js
// Shows the ML model details and accuracy metrics

import { useState, useEffect } from "react"
import { getModelInfo }        from "../services/api"

function ModelInfo() {
    const [info,    setInfo]    = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)

    useEffect(() => {
        getModelInfo()
            .then(data  => setInfo(data))
            .catch(()   => setError("Could not load model info."))
            .finally(()  => setLoading(false))
    }, [])

    if (loading) return <p style={styles.center}>Loading model info...</p>
    if (error)   return <p style={styles.error}>{error}</p>

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Model Information</h2>
            <p style={styles.subtitle}>
                Details about the ML models powering this system.
                All algorithms were implemented from scratch.
            </p>

            {/* Linear Regression Card */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                    Demand Prediction Model
                </h3>
                <p style={styles.cardAlgo}>{info.algorithm}</p>

                <div style={styles.grid}>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Trained on</span>
                        <span style={styles.metricValue}>
                            {info.trained_on?.toLocaleString()} rows
                        </span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Tested on</span>
                        <span style={styles.metricValue}>
                            {info.tested_on?.toLocaleString()} rows
                        </span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Test MSE</span>
                        <span style={styles.metricValue}>{info.test_mse}</span>
                    </div>
                    
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Slope (m)</span>
                        <span style={styles.metricValue}>{info.slope_m}</span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Intercept (b)</span>
                        <span style={styles.metricValue}>{info.intercept_b}</span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Feature</span>
                        <span style={styles.metricValue}>
                            {info.features?.join(", ")}
                        </span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Target</span>
                        <span style={styles.metricValue}>{info.target}</span>
                    </div>
                    <div style={styles.metric}>
                        <span style={styles.metricLabel}>Price Range</span>
                        <span style={styles.metricValue}>
                            ₹{info.price_range?.min?.toLocaleString()} –
                            ₹{info.price_range?.max?.toLocaleString()}
                        </span>
                    </div>
                    <div style={styles.metric}>
    <span style={styles.metricLabel}>Test MAE</span>
    <span style={styles.metricValue}>{info.test_mae}</span>
</div>
<div style={styles.metric}>
    <span style={styles.metricLabel}>R² Score</span>
    <span style={styles.metricValue}>{info.r_squared}</span>
</div>
                </div>
            </div>

            {/* Recommender Card */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recommendation Engine</h3>
                <div style={styles.grid}>
                    <div style={styles.algoCard}>
                        <h4 style={styles.algoTitle}>
                            Collaborative Filtering
                        </h4>
                        <p style={styles.algoDesc}>
                            Builds a user-item purchase matrix.
                            Finds similar users using cosine similarity.
                            Recommends what similar users bought.
                        </p>
                        <div style={styles.tag}>Cosine Similarity</div>
                    </div>
                    <div style={styles.algoCard}>
                        <h4 style={styles.algoTitle}>
                            Content-Based Filtering
                        </h4>
                        <p style={styles.algoDesc}>
                            Encodes product specs into feature vectors.
                            Finds products with most similar features
                            using cosine similarity on RAM, ROM, price.
                        </p>
                        <div style={styles.tag}>Feature Vectors</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container:   { maxWidth: "900px", margin: "0 auto", padding: "32px 16px" },
    title:       { fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
    subtitle:    { color: "#666", marginBottom: "32px", lineHeight: "1.6" },
    card:        { backgroundColor: "#f8f9fa", borderRadius: "16px", padding: "28px", marginBottom: "24px", border: "1px solid #eee" },
    cardTitle:   { fontSize: "20px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "4px" },
    cardAlgo:    { color: "#e94560", fontSize: "14px", marginBottom: "24px" },
    grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" },
    metric:      { backgroundColor: "white", borderRadius: "10px", padding: "16px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "6px" },
    metricLabel: { fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" },
    metricValue: { fontSize: "18px", fontWeight: "bold", color: "#1a1a2e" },
    algoCard:    { backgroundColor: "white", borderRadius: "12px", padding: "20px", border: "1px solid #eee" },
    algoTitle:   { fontSize: "16px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "8px" },
    algoDesc:    { color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" },
    tag:         { display: "inline-block", backgroundColor: "#e94560", color: "white", fontSize: "11px", padding: "3px 10px", borderRadius: "12px" },
    center:      { textAlign: "center", padding: "40px", color: "#888" },
    error:       { textAlign: "center", padding: "40px", color: "#e94560" }
}

export default ModelInfo