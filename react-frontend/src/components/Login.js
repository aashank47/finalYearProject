// src/components/Login.js
import { useState }   from "react"
import { useAuth }    from "../context/AuthContext"
import axios          from "axios"

function Login({ onSwitch, onSuccess }) {
    const { login }               = useAuth()
    const [email,    setEmail]    = useState("")
    const [password, setPassword] = useState("")
    const [error,    setError]    = useState(null)
    const [loading,  setLoading]  = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await axios.post(
                "http://localhost:4000/auth/login",
                { email, password }
            )
            login(res.data.user, res.data.token)
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.brand}>DPPRS</h1>
                <p style={styles.sub}>
                    Demand Prediction & Product Recommendation
                </p>
                <h2 style={styles.title}>Sign In</h2>

                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                />

                {error && <p style={styles.error}>{error}</p>}

                <button
                    style={styles.btn}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <p style={styles.switchText}>
                    Don't have an account?{" "}
                    <span style={styles.link} onClick={onSwitch}>
                        Register
                    </span>
                </p>
            </div>
        </div>
    )
}

const styles = {
    page:       { minHeight: "100vh", backgroundColor: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" },
    card:       { backgroundColor: "#1a1a2e", padding: "48px 40px", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
    brand:      { color: "#e94560", fontSize: "28px", fontWeight: "bold", textAlign: "center", marginBottom: "4px" },
    sub:        { color: "#8892A4", fontSize: "11px", textAlign: "center", marginBottom: "32px" },
    title:      { color: "white", fontSize: "22px", fontWeight: "bold", marginBottom: "24px" },
    input:      { width: "100%", padding: "12px 16px", marginBottom: "16px", backgroundColor: "#0D1117", border: "1px solid #2a2a4a", borderRadius: "8px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" },
    error:      { color: "#e94560", fontSize: "13px", marginBottom: "12px" },
    btn:        { width: "100%", padding: "14px", backgroundColor: "#e94560", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" },
    switchText: { color: "#8892A4", fontSize: "14px", textAlign: "center" },
    link:       { color: "#e94560", cursor: "pointer", fontWeight: "bold" }
}

export default Login