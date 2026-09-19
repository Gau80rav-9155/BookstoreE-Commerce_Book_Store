import React, { useEffect, useState } from "react"
import axios from "axios"
import "./Admin.css"
import { useNavigate } from "react-router-dom"

function Admin() {
    const navigate = useNavigate()

    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        loadStats()
    }, [])

    function loadStats() {
        const token = localStorage.getItem("adminToken")

        if (!token) {
            navigate("/admin/login")
            return
        }

        axios.get(
            "https://bookstore-backend-gz0l.onrender.com/api/admin/stats",
            {
                headers: {
                    "x-access-token": token
                }
            }
        )
        .then(response => {
            if (response.data.status === "ok") {
                setStats({
                    totalBooks: response.data.totalBooks || 0,
                    totalUsers: response.data.totalUsers || 0,
                    totalOrders: response.data.totalOrders || 0,
                    totalRevenue: response.data.totalRevenue || 0
                })
            }
        })
        .catch(error => {
            console.log(error)

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("adminToken")
                navigate("/admin/login")
            }
            else {
                setError("Unable to load dashboard statistics")
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }

    function logoutAdmin() {
        localStorage.removeItem("adminToken")
        navigate("/admin/login")
    }

    return (
        <div className="admin-page">
            <div className="admin-container">

                <div className="admin-header">

                    <div>
                        <h1>Admin Dashboard</h1>

                        <p>
                            Manage your BookStore store
                        </p>
                    </div>

                    <div className="admin-header-right">

                        <div className="admin-badge">
                            Admin Panel
                        </div>

                        <button
                            className="admin-logout-btn"
                            onClick={logoutAdmin}
                        >
                            Logout
                        </button>

                    </div>

                </div>

                {error && (
                    <div className="admin-info-box">
                        {error}
                    </div>
                )}

                <div className="admin-stats">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            📚
                        </div>

                        <h2>
                            {loading ? "..." : stats.totalBooks}
                        </h2>

                        <p>
                            Total Books
                        </p>

                    </div>

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👥
                        </div>

                        <h2>
                            {loading ? "..." : stats.totalUsers}
                        </h2>

                        <p>
                            Total Users
                        </p>

                    </div>

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            📦
                        </div>

                        <h2>
                            {loading ? "..." : stats.totalOrders}
                        </h2>

                        <p>
                            Total Orders
                        </p>

                    </div>

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            💰
                        </div>

                        <h2>
                            {loading
                                ? "..."
                                : `₹${stats.totalRevenue}`}
                        </h2>

                        <p>
                            Total Revenue
                        </p>

                    </div>

                </div>

                <div className="admin-sections">

                    <div className="admin-section-card">

                        <h2>
                            📦 Order Management
                        </h2>

                        <p>
                            View customer orders and update order status.
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={() =>
                                navigate("/admin/orders")
                            }
                        >
                            Manage Orders
                        </button>

                    </div>

                    <div className="admin-section-card">

                        <h2>
                            📚 Book Management
                        </h2>

                        <p>
                            Add, edit and manage books in the store.
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={() =>
                                navigate("/admin/books")
                            }
                        >
                            Manage Books
                        </button>

                    </div>

                    <div className="admin-section-card">

                        <h2>
                            👥 Users Management
                        </h2>

                        <p>
                            View and manage registered BookStore users.
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={() =>
                                navigate("/admin/users")
                            }
                        >
                            Manage Users
                        </button>

                    </div>

                    <div className="admin-section-card">

                        <h2>
                            📊 Sales Analytics
                        </h2>

                        <p>
                            Track sales, revenue and order performance.
                        </p>

                        <button
                            className="admin-primary-btn"
                            onClick={() =>
                                navigate("/admin/analytics")
                            }
                        >
                            View Analytics
                        </button>

                    </div>

                </div>

            </div>
        </div>
    )
}

export { Admin }