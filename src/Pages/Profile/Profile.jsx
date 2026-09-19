import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode"
import "./Profile.css"

import {
    useWishlist,
    useCart,
    useOrders,
    useUserLogin,
    useToast
} from "../../index"

function Profile() {

    const { userWishlist } = useWishlist()
    const { userCart } = useCart()
    const { userOrders } = useOrders()
    const { setUserLoggedIn } = useUserLogin()
    const { showToast } = useToast()

    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const token = localStorage.getItem("token")

        if (!token) {
            setUserLoggedIn(false)
            navigate("/login")
            return
        }

        try {

            const decodedUser = jwt_decode(token)

            if (!decodedUser) {
                localStorage.removeItem("token")
                setUserLoggedIn(false)
                navigate("/login")
                return
            }

            setUserLoggedIn(true)

            axios.get(
                "https://bookstore-backend-gz0l.onrender.com/api/user",
                {
                    headers: {
                        "x-access-token": token
                    }
                }
            )
            .then(response => {

                if (response.data.status === "ok") {

                    setUser(response.data.user)

                } else {

                    localStorage.removeItem("token")
                    setUserLoggedIn(false)

                    showToast(
                        "error",
                        "",
                        response.data.message || "Unable to load profile"
                    )

                    navigate("/login")
                }

                setLoading(false)
            })
            .catch(error => {

                console.log("Profile Error:", error)

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {

                    localStorage.removeItem("token")
                    setUserLoggedIn(false)

                    showToast(
                        "error",
                        "",
                        "Session expired. Please login again."
                    )

                    navigate("/login")

                } else {

                    showToast(
                        "error",
                        "",
                        "Unable to load profile"
                    )

                    setLoading(false)
                }

            })

        }
        catch (error) {

            console.log("Token Error:", error)

            localStorage.removeItem("token")
            setUserLoggedIn(false)
            navigate("/login")

        }

    }, [navigate, setUserLoggedIn])

    function logoutUser() {

        localStorage.removeItem("token")

        setUserLoggedIn(false)

        showToast(
            "success",
            "",
            "Logged out successfully"
        )

        navigate("/login")
    }

    if (loading) {
        return (
            <div className="profile-loading">
                <h2>Loading Profile...</h2>
            </div>
        )
    }

    return (
        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-header">

                    <div className="profile-avatar">

                        <i
                            className="fa fa-user"
                            aria-hidden="true"
                        ></i>

                    </div>

                    <div>

                        <h1>My Profile</h1>

                        <p>
                            Welcome back,{" "}
                            <strong>
                                {user?.userName ||
                                    user?.name ||
                                    "User"}
                            </strong>
                        </p>

                    </div>

                </div>

                <div className="profile-info-card">

                    <h2>Personal Information</h2>

                    <div className="profile-info-row">

                        <span className="profile-label">
                            Name
                        </span>

                        <span className="profile-value">
                            {user?.userName ||
                                user?.name ||
                                "Not available"}
                        </span>

                    </div>

                    <div className="profile-info-row">

                        <span className="profile-label">
                            Email
                        </span>

                        <span className="profile-value">
                            {user?.userEmail ||
                                user?.email ||
                                "Not available"}
                        </span>

                    </div>

                </div>

                <div className="profile-stats">

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">

                            <i
                                className="fa fa-heart-o"
                                aria-hidden="true"
                            ></i>

                        </div>

                        <h2>
                            {userWishlist.length}
                        </h2>

                        <p>
                            Wishlist Items
                        </p>

                        <Link to="/wishlist">
                            View Wishlist
                        </Link>

                    </div>

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">

                            <i
                                className="fa fa-shopping-cart"
                                aria-hidden="true"
                            ></i>

                        </div>

                        <h2>
                            {userCart.length}
                        </h2>

                        <p>
                            Cart Items
                        </p>

                        <Link to="/cart">
                            View Cart
                        </Link>

                    </div>

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">

                            <i
                                className="fa fa-shopping-bag"
                                aria-hidden="true"
                            ></i>

                        </div>

                        <h2>
                            {userOrders.length}
                        </h2>

                        <p>
                            Orders
                        </p>

                        <Link to="/orders">
                            View Orders
                        </Link>

                    </div>

                </div>

                <div className="profile-actions">

                    <Link
                        to="/shop"
                        className="profile-shop-btn"
                    >
                        Continue Shopping
                    </Link>

                    <button
                        onClick={logoutUser}
                        className="profile-logout-btn"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>
    )
}

export { Profile }