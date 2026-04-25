import { useAuth } from "../context/AuthContext"

function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
    const { user, logout } = useAuth()

    const links = [
        { id: "home",      icon: "🏠", label: "Home"               },
        { id: "demand",    icon: "📈", label: "Demand Predictor"    },
        { id: "recommend", icon: "🔍", label: "Product Recommender" },
        { id: "user",      icon: "👤", label: "User Recommender"    },
        { id: "model",     icon: "🤖", label: "Model Info"          },
    ]

    const handleNav = (id) => {
        setActivePage(id)
        onClose()   // close sidebar after clicking a link
    }

    const handleLogout = () => {
        logout()
        onClose()
    }

    return (
        <>
            {/* Dark overlay behind sidebar */}
            {isOpen && (
                <div
                    style={styles.overlay}
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <div style={{
                ...styles.sidebar,
                transform: isOpen ? "translateX(0)" : "translateX(-100%)"
            }}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.brand}>DPPRS</div>
                        <div style={styles.brandSub}>AI Dashboard</div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* User info */}
                <div style={styles.userBox}>
                    <div style={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>{user?.name}</span>
                        <span style={styles.userEmail}>{user?.email}</span>
                    </div>
                </div>

                <div style={styles.divider} />

                {/* Nav links */}
                <nav style={styles.nav}>
                    {links.map(link => (
                        <button
                            key={link.id}
                            onClick={() => handleNav(link.id)}
                            style={{
                                ...styles.navBtn,
                                ...(activePage === link.id
                                    ? styles.navBtnActive
                                    : {})
                            }}
                        >
                            <span style={styles.navIcon}>{link.icon}</span>
                            <span>{link.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div style={styles.bottom}>
                    <div style={styles.divider} />
                    <button
                        style={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    )
}

const styles = {
    overlay: {
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        bottom:          0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex:          200
    },
    sidebar: {
        position:        "fixed",
        top:             0,
        left:            0,
        width:           "260px",
        height:          "100vh",
        backgroundColor: "#0D1117",
        borderRight:     "1px solid #1a1a2e",
        display:         "flex",
        flexDirection:   "column",
        zIndex:          300,
        transition:      "transform 0.3s ease",
        overflowY:       "auto"
    },
    header: {
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
        padding:        "24px 20px 16px"
    },
    brand:    { fontSize: "22px", fontWeight: "bold", color: "#e94560" },
    brandSub: { fontSize: "11px", color: "#8892A4", marginTop: "2px" },
    closeBtn: {
        background:   "transparent",
        border:       "1px solid #333",
        color:        "#8892A4",
        fontSize:     "16px",
        width:        "32px",
        height:       "32px",
        borderRadius: "6px",
        cursor:       "pointer"
    },
    userBox:   { display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px" },
    avatar:    { width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e94560", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "17px", flexShrink: 0 },
    userInfo:  { display: "flex", flexDirection: "column", overflow: "hidden" },
    userName:  { color: "white", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    userEmail: { color: "#8892A4", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    divider:   { height: "1px", backgroundColor: "#1a1a2e", margin: "8px 20px" },
    nav:       { display: "flex", flexDirection: "column", padding: "8px 12px", gap: "4px", flex: 1 },
    navBtn:    { display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", backgroundColor: "transparent", border: "none", color: "#8892A4", borderRadius: "8px", cursor: "pointer", fontSize: "14px", textAlign: "left", width: "100%" },
    navBtnActive: { backgroundColor: "#1a1a2e", color: "#e94560", fontWeight: "bold" },
    navIcon:   { fontSize: "18px", width: "22px", textAlign: "center" },
    bottom:    { padding: "0 12px 24px" },
    logoutBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", backgroundColor: "transparent", border: "none", color: "#8892A4", borderRadius: "8px", cursor: "pointer", fontSize: "14px", width: "100%" }
}

export default Sidebar