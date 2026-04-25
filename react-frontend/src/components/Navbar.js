function Navbar({ activePage, setActivePage, onToggleSidebar }) {
    const links = [
        { id: "home",      label: "Home" },
        { id: "demand",    label: "Demand Predictor" },
        { id: "recommend", label: "Product Recommender" },
        { id: "user",      label: "User Recommender" },
        { id: "model",     label: "Model Info" },
    ]

    return (
        <nav style={styles.nav}>
            {/* Sidebar toggle button */}
            <button onClick={onToggleSidebar} style={styles.toggleBtn}>
                ☰
            </button>

            <div
                style={styles.brand}
                onClick={() => setActivePage("home")}
            >
                DemandPredictionAndProductRecommendation
            </div>

            <div style={styles.links}>
                {links.map(link => (
                    <button
                        key={link.id}
                        onClick={() => setActivePage(link.id)}
                        style={{
                            ...styles.link,
                            ...(activePage === link.id ? styles.active : {})
                        }}
                    >
                        {link.label}
                    </button>
                ))}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        display:         "flex",
        alignItems:      "center",
        gap:             "16px",
        backgroundColor: "#1a1a2e",
        padding:         "16px 32px",
        color:           "white",
        boxShadow:       "0 2px 8px rgba(0,0,0,0.3)",
        position:        "sticky",
        top:             0,
        zIndex:          100
    },
    toggleBtn: {
        background:   "transparent",
        border:       "1px solid #444",
        color:        "white",
        fontSize:     "20px",
        width:        "40px",
        height:       "40px",
        borderRadius: "6px",
        cursor:       "pointer",
        flexShrink:   0
    },
    brand: {
        fontSize:   "16px",
        fontWeight: "bold",
        color:      "#e94560",
        cursor:     "pointer",
        flex:       1
    },
    links: {
        display: "flex",
        gap:     "8px"
    },
    link: {
        background:   "transparent",
        border:       "1px solid #444",
        color:        "#ccc",
        padding:      "8px 16px",
        borderRadius: "6px",
        cursor:       "pointer",
        fontSize:     "14px"
    },
    active: {
        backgroundColor: "#e94560",
        borderColor:     "#e94560",
        color:           "white"
    }
}

export default Navbar