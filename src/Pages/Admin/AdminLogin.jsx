import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./AdminLogin.css"

function AdminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    function handleLogin(event) {
        event.preventDefault()

        setLoading(true)
        setMessage("")

        axios.post(
            "https://bookstore-backend-gz0l.onrender.com/api/admin/login",
            {
                email,
                password
            }
        )
        .then(response => {
            if (response.data.status === "ok") {
                localStorage.setItem(
                    "adminToken",
                    response.data.token
                )

                navigate("/admin")
            }
        })
        .catch(error => {
            setMessage(
                error.response?.data?.message ||
                "Admin login failed"
            )
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">

                <div className="admin-login-icon">
                    👨‍💼
                </div>

                <h1>Admin Login</h1>

                <p>
                    Login to access the Bookztron Admin Dashboard
                </p>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="Enter admin email"
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Enter admin password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login as Admin"}
                    </button>

                    {message && (
                        <p className="admin-login-error">
                            {message}
                        </p>
                    )}

                </form>

            </div>
        </div>
    )
}

export { AdminLogin }