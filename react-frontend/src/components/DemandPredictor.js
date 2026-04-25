// src/components/DemandPredictor.js
// Lets user enter a price and see predicted demand.
// Also shows a chart of demand across price range.

import { useState }          from "react"
import { LineChart, Line,
         XAxis, YAxis,
         CartesianGrid,
         Tooltip, Legend,
         ResponsiveContainer } from "recharts"
import { predictDemand,
         predictBatch }       from "../services/api"

function DemandPredictor() {
    const [price,      setPrice]      = useState("")
    const [result,     setResult]     = useState(null)
    const [chartData,  setChartData]  = useState([])
    const [loading,    setLoading]    = useState(false)
    const [chartLoad,  setChartLoad]  = useState(false)
    const [error,      setError]      = useState(null)

    // Predict for single price
    const handlePredict = async () => {
        if (!price || isNaN(price)) {
            setError("Please enter a valid price")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const data = await predictDemand(Number(price))
            setResult(data)
        } catch (err) {
            setError("Prediction failed. Is the server running?")
        } finally {
            setLoading(false)
        }
    }

    // Load chart with batch predictions across price range
    const loadChart = async () => {
        setChartLoad(true)
        try {
            const prices = []
            for (let p = 10000; p <= 200000; p += 10000) {
                prices.push(p)
            }
            const data = await predictBatch(prices)
            const formatted = data.predictions.map(p => ({
                price:    `₹${(p.price / 1000).toFixed(0)}k`,
                quantity: p.predicted_quantity
            }))
            setChartData(formatted)
        } catch (err) {
            setError("Chart failed to load.")
        } finally {
            setChartLoad(false)
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Demand Predictor</h2>
            <p style={styles.subtitle}>
                Enter a product price to predict how many units will sell.
                Built with Linear Regression + Gradient Descent from scratch.
            </p>

            {/* Input */}
            <div style={styles.inputRow}>
                <span style={styles.rupee}>₹</span>
                <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Enter price e.g. 75000"
                    style={styles.input}
                />
                <button
                    onClick={handlePredict}
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? "Predicting..." : "Predict"}
                </button>
            </div>

            {/* Error */}
            {error && <p style={styles.error}>{error}</p>}

            {/* Result */}
            {result && (
                <div style={styles.resultBox}>
                    <div style={styles.resultItem}>
                        <span style={styles.label}>Price</span>
                        <span style={styles.value}>
                            ₹{result.price.toLocaleString()}
                        </span>
                    </div>
                    <div style={styles.divider} />
                    <div style={styles.resultItem}>
                        <span style={styles.label}>Predicted Quantity</span>
                        <span style={{...styles.value, color: "#e94560", fontSize: "32px"}}>
                            {result.predicted_quantity} units
                        </span>
                    </div>
                    <div style={styles.divider} />
                    <div style={styles.resultItem}>
                        <span style={styles.label}>Model MSE</span>
                        <span style={styles.value}>{result.model_mse}</span>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div style={styles.chartSection}>
                <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>
                        Demand vs Price — full range
                    </h3>
                    <button
                        onClick={loadChart}
                        disabled={chartLoad}
                        style={styles.outlineButton}
                    >
                        {chartLoad ? "Loading..." : "Load Chart"}
                    </button>
                </div>

                {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="price" stroke="#aaa" />
                            <YAxis stroke="#aaa" domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1a1a2e",
                                    border: "1px solid #444"
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="quantity"
                                stroke="#e94560"
                                strokeWidth={2}
                                dot={{ fill: "#e94560" }}
                                name="Predicted Quantity"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

const styles = {
    container:     { maxWidth: "800px", margin: "0 auto", padding: "32px 16px" },
    title:         { fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
    subtitle:      { color: "#666", marginBottom: "24px", lineHeight: "1.6" },
    inputRow:      { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
    rupee:         { fontSize: "20px", fontWeight: "bold", color: "#e94560" },
    input:         { flex: 1, padding: "12px 16px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" },
    button:        { padding: "12px 24px", backgroundColor: "#e94560", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" },
    error:         { color: "#e94560", marginBottom: "16px" },
    resultBox:     { backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "24px", marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" },
    resultItem:    { display: "flex", flexDirection: "column", gap: "4px", flex: 1, textAlign: "center" },
    label:         { fontSize: "13px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" },
    value:         { fontSize: "22px", fontWeight: "bold", color: "#1a1a2e" },
    divider:       { width: "1px", height: "60px", backgroundColor: "#ddd" },
    chartSection:  { backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "24px" },
    chartHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
    chartTitle:    { fontSize: "18px", fontWeight: "bold", margin: 0 },
    outlineButton: { padding: "8px 16px", backgroundColor: "transparent", border: "1px solid #e94560", color: "#e94560", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }
}

export default DemandPredictor