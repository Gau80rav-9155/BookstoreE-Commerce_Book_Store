import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./AdminUsers.css"

function AdminUsers() {

    const navigate = useNavigate()

    const [users, setUsers] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    function loadUsers() {

        const token = localStorage.getItem("adminToken")

        if (!token) {
            navigate("/admin/login")
            return
        }

        axios.get(
            "http://localhost:5000/api/admin/users",
            {
                headers: {
                    "x-access-token": token
                }
            }
        )
        .then(response => {

            if (response.data.status === "ok") {
                setUsers(response.data.users || [])
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

        })
        .finally(() => {
            setLoading(false)
        })
    }

    const filteredUsers = users.filter(user => {

        const name = user.userName?.toLowerCase() || ""
        const email = user.userEmail?.toLowerCase() || ""

        return (
            name.includes(search.toLowerCase()) ||
            email.includes(search.toLowerCase())
        )
    })

    return (
        <div className="admin-users-page">

            <div className="admin-users-container">

                <div className="admin-users-header">

                    <div>
                        <h1>Users Management</h1>
                        <p>
                            Manage registered users of your BookStore
                        </p>
                    </div>

                    <button
                        className="admin-back-btn"
                        onClick={() => navigate("/admin")}
                    >
                        ← Dashboard
                    </button>

                </div>

                <div className="admin-users-toolbar">

                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <div className="admin-user-count">
                        {filteredUsers.length} Users
                    </div>

                </div>

                {
                    loading ? (

                        <div className="admin-users-message">
                            Loading users...
                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className="admin-users-message">
                            No users found
                        </div>

                    ) : (

                        <div className="admin-users-grid">

                            {
                                filteredUsers.map(user => (

                                    <div
                                        className="admin-user-card"
                                        key={user._id}
                                    >

                                        <div className="admin-user-avatar">
                                            👤
                                        </div>

                                        <div className="admin-user-info">

                                            <h2>
                                                {user.userName}
                                            </h2>

                                            <p>
                                                📧 {user.userEmail}
                                            </p>

                                        </div>

                                        <div className="admin-user-stats">

                                            <div>
                                                <strong>
                                                    {user.cart?.length || 0}
                                                </strong>

                                                <span>
                                                    Cart Items
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {user.orders?.length || 0}
                                                </strong>

                                                <span>
                                                    Orders
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {user.wishlist?.length || 0}
                                                </strong>

                                                <span>
                                                    Wishlist
                                                </span>
                                            </div>

                                        </div>

                                        <div className="admin-user-role">
                                            {user.role || "user"}
                                        </div>

                                    </div>

                                ))
                            }

                        </div>

                    )
                }

            </div>

        </div>
    )
}

export { AdminUsers }