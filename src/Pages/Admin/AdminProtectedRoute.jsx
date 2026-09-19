import React, { useEffect, useState } from "react"
import axios from "axios"
import { Navigate, Outlet } from "react-router-dom"

function AdminProtectedRoute() {
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("adminToken")

        if (!token) {
            setLoading(false)
            return
        }

        axios.get(
            "https://bookstore-backend-gz0l.onrender.com/api/admin/verify",
            {
                headers: {
                    "x-access-token": token
                }
            }
        )
        .then(response => {
            if (response.data.status === "ok") {
                setIsAdmin(true)
            }
        })
        .catch(() => {
            localStorage.removeItem("adminToken")
            setIsAdmin(false)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h2>Checking Admin Access...</h2>
            </div>
        )
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />
    }

    return <Outlet />
}

export { AdminProtectedRoute }