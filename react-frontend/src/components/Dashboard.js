// src/components/Dashboard.js
// Landing page — shows system overview and quick stats

import { useState, useEffect } from "react"
import { getModelInfo, getAllProducts, getAllCustomers } from "../services/api"

function Dashboard({ setActivePage }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const [modelData, productData, customerData] = await Promise.all([
                    getModelInfo(),
                    getAllProducts(),
                    getAllCustomers()
                ])
                setStats({
                    mse: modelData.test_mse,
                    trainedOn: modelData.trained_on,
                    products: productData.total,
                    customers: customerData.total,
                    algorithm: modelData.algorithm
                })
            } catch (err) {
                console.log("Stats load error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const cards = [
        {
            id: "demand",
            title: "Demand Predictor",
            desc: "Predict how many units a product will sell based on its price. Built with Linear Regression and Gradient Descent from scratch.",
            icon: "📈",
            color: "#e94560"
        },
        {
            id: "recommend",
            title: "Product Recommender",
            desc: "Find products similar to any item using Content-Based Filtering and Cosine Similarity on product features.",
            icon: "🔍",
            color: "#0f3460"
        },
        {
            id: "user",
            title: "User Recommender",
            desc: "Get personalised recommendations for any customer using Collaborative Filtering based on purchase history.",
            icon: "👤",
            color: "#533483"
        },
        {
            id: "model",
            title: "Model Info",
            desc: "View detailed information about the ML models — accuracy metrics, parameters, and algorithm details.",
            icon: "🤖",
            color: "#05c46b"
        }
    ]

    return (
        <div style={styles.container}>

            {/* Hero */}
            <div style={styles.hero}>

                <h1 style={styles.heroTitle}>
                    Demand Prediction &amp; Product Recommendation System
                </h1>
                <p style={styles.heroSubtitle}>
                    An e-commerce analytics platform that forecasts
                    product demand and delivers personalised product recommendations.
                    Built using Python, Flask, Node.js, React and MongoDB with
                    all machine learning algorithms implemented from scratch.
                </p>

            </div>

            {/* Stats row */}
            {!loading && stats && (
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>
                            {stats.products?.toLocaleString()}
                        </span>
                        <span style={styles.statLabel}>Transactions</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>
                            {stats.customers?.toLocaleString()}
                        </span>
                        <span style={styles.statLabel}>Customers</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>
                            {stats.trainedOn?.toLocaleString()}
                        </span>
                        <span style={styles.statLabel}>Training Rows</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNum}>{stats.mse}</span>
                        <span style={styles.statLabel}>Model MSE</span>
                    </div>
                </div>
            )}

            {/* Feature cards */}
            <div style={styles.grid}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        style={styles.card}
                        onClick={() => setActivePage(card.id)}
                    >
                        <div style={{
                            ...styles.iconBox,
                            backgroundColor: card.color + "15",
                            color: card.color
                        }}>
                            {card.icon}
                        </div>
                        <h3 style={styles.cardTitle}>{card.title}</h3>
                        <p style={styles.cardDesc}>{card.desc}</p>
                        <span style={{
                            ...styles.cardLink,
                            color: card.color
                        }}>
                            Try it →
                        </span>
                    </div>
                ))}
            </div>

            {/* Tech stack */}
            <div style={styles.techSection}>
                <h3 style={styles.techTitle}>Built with</h3>
                <div style={styles.techRow}>
                    {["Python", "Flask", "Linear Regression",
                        "Cosine Similarity", "Node.js", "Express",
                        "MongoDB", "React"].map(tech => (
                            <span key={tech} style={styles.techTag}>
                                {tech}
                            </span>
                        ))}
                </div>
            </div>

        </div>
    )
}

const styles = {
    container: { maxWidth: "1000px", margin: "0 auto", padding: "32px 16px" },
    hero: { textAlign: "center", padding: "48px 16px 32px", marginBottom: "8px" },
    heroTitle: { fontSize: "36px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "16px", lineHeight: "1.3" },
    heroSubtitle: { fontSize: "17px", color: "#666", maxWidth: "600px", margin: "0 auto", lineHeight: "1.7" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" },
    statCard: { backgroundColor: "#1a1a2e", borderRadius: "12px", padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" },
    statNum: { fontSize: "28px", fontWeight: "bold", color: "#e94560" },
    statLabel: { fontSize: "13px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "40px" },
    card: { backgroundColor: "#f8f9fa", borderRadius: "16px", padding: "28px", cursor: "pointer", border: "1px solid #eee", transition: "transform 0.2s" },
    iconBox: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "16px" },
    cardTitle: { fontSize: "18px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "8px" },
    cardDesc: { color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" },
    cardLink: { fontSize: "14px", fontWeight: "bold" },
    techSection: { backgroundColor: "#f8f9fa", borderRadius: "16px", padding: "28px", textAlign: "center" },
    techTitle: { fontSize: "16px", color: "#888", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" },
    techRow: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" },
    techTag: { backgroundColor: "#1a1a2e", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "14px" }
}

export default Dashboard