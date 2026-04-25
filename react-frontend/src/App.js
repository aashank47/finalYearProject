import { useState }       from "react"
import { useAuth }        from "./context/AuthContext"
import Navbar             from "./components/Navbar"
import Sidebar            from "./components/Sidebar"
import Dashboard          from "./components/Dashboard"
import DemandPredictor    from "./components/DemandPredictor"
import ProductRecommender from "./components/ProductRecommender"
import UserRecommender    from "./components/UserRecommender"
import ModelInfo          from "./components/ModelInfo"
import Login              from "./components/Login"
import Register           from "./components/Register"
import "./index.css"

function App() {
    const { user }                          = useAuth()
    const [activePage,   setActivePage]     = useState("home")
    const [authPage,     setAuthPage]       = useState("login")
    const [sidebarOpen,  setSidebarOpen]    = useState(false)

    if (!user) {
        return authPage === "login"
            ? <Login
                onSwitch={()  => setAuthPage("register")}
                onSuccess={() => setActivePage("home")}
              />
            : <Register
                onSwitch={()  => setAuthPage("login")}
                onSuccess={() => setActivePage("home")}
              />
    }

    const renderPage = () => {
        switch (activePage) {
            case "home":      return <Dashboard setActivePage={setActivePage} />
            case "demand":    return <DemandPredictor />
            case "recommend": return <ProductRecommender />
            case "user":      return <UserRecommender />
            case "model":     return <ModelInfo />
            default:          return <Dashboard setActivePage={setActivePage} />
        }
    }

    return (
        <div>
            {/* Navbar stays at top always */}
            <Navbar
                activePage={activePage}
                setActivePage={setActivePage}
                onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            />

            {/* Sidebar slides over content */}
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content — no margin shift */}
            <main style={{ padding: "32px" }}>
                {renderPage()}
            </main>
        </div>
    )
}

export default App