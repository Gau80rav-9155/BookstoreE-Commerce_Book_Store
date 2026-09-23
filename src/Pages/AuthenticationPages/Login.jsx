import React, { useState, useEffect } from "react"
import jwt_decode from "jwt-decode"
import "./UserAuth.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
    useToast,
    useUserLogin,
    useWishlist,
    useCart,
    useOrders
} from "../../index"

function Login()
{
    const { setUserLoggedIn } = useUserLogin()
    const { showToast } = useToast()
    const { dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart } = useCart()
    const { dispatchUserOrders } = useOrders()

    const [userEmail, setUserEmail] = useState("")
    const [userPassword, setUserPassword] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            return
        }

        try {
            const user = jwt_decode(token)

            if (!user) {
                localStorage.removeItem("token")
                return
            }

            setUserLoggedIn(true)
        }
        catch (error) {
            localStorage.removeItem("token")
            setUserLoggedIn(false)
        }
    }, [setUserLoggedIn])

    function loginUser(event)
    {
        event.preventDefault()

        axios.post(
            "http://localhost:5000/api/login",
            {
                userEmail,
                userPassword
            }
        )
        .then(res => {

            if (res.data.status === "ok" && res.data.token)
            {
                localStorage.setItem("token", res.data.token)

                setUserLoggedIn(true)

                dispatchUserWishlist({
                    type: "UPDATE_USER_WISHLIST",
                    payload: res.data.user.wishlist || []
                })

                dispatchUserCart({
                    type: "UPDATE_USER_CART",
                    payload: res.data.user.cart || []
                })

                dispatchUserOrders({
                    type: "UPDATE_USER_ORDERS",
                    payload: res.data.user.orders || []
                })

                showToast(
                    "success",
                    "",
                    "Logged in successfully"
                )

                navigate("/shop")
            }
            else
            {
                throw new Error("Login failed")
            }
        })
        .catch(error => {

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Invalid email or password"
            )
        })
    }

    return (
        <div className="user-auth-content-container">
            <form onSubmit={loginUser} className="user-auth-form">

                <h2>Login</h2>

                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-email">
                        <h4>Email address</h4>
                    </label>

                    <input
                        id="user-auth-input-email"
                        className="user-auth-form-input"
                        type="email"
                        placeholder="Email"
                        value={userEmail}
                        onChange={(event) =>
                            setUserEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-password">
                        <h4>Password</h4>
                    </label>

                    <input
                        id="user-auth-input-password"
                        className="user-auth-form-input"
                        type="password"
                        placeholder="Password"
                        value={userPassword}
                        onChange={(event) =>
                            setUserPassword(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="user-options-container">

                    <div className="remember-me-container">
                        <input
                            type="checkbox"
                            id="remember-me"
                        />

                        <label htmlFor="remember-me">
                            Remember Me
                        </label>
                    </div>

                    <div>
                        <Link
                            to="#"
                            className="links-with-blue-underline"
                            id="forgot-password"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                </div>

                <button
                    type="submit"
                    className="solid-success-btn form-user-auth-submit-btn"
                >
                    Login
                </button>

                <div className="new-user-container">

                    <Link
                        to="/signup"
                        className="links-with-blue-underline"
                        id="new-user-link"
                    >
                        Create new account &nbsp;
                    </Link>

                </div>

            </form>
        </div>
    )
}

export { Login }