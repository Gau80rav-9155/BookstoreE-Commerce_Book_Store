import "./Orders.css"
import { useEffect } from "react"
import jwt_decode from "jwt-decode"
import axios from "axios"
import { Link, useLocation } from "react-router-dom"

import {
    ProductOrderCard,
    useWishlist,
    useCart,
    useOrders
} from "../../index"

import Lottie from "react-lottie"
import GuyWithBookLottie from "../../Assets/Icons/guy_with_book.json"

function Orders() {

    const {
        userWishlist,
        dispatchUserWishlist
    } = useWishlist()

    const {
        userCart,
        dispatchUserCart
    } = useCart()

    const {
        userOrders,
        dispatchUserOrders
    } = useOrders()

    const { pathname } = useLocation()

    const guyWithBookObj = {
        loop: true,
        autoplay: true,
        animationData: GuyWithBookLottie,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    useEffect(() => {

        const token = localStorage.getItem("token")

        if (!token) {
            dispatchUserOrders({
                type: "UPDATE_USER_ORDERS",
                payload: []
            })

            dispatchUserWishlist({
                type: "UPDATE_USER_WISHLIST",
                payload: []
            })

            dispatchUserCart({
                type: "UPDATE_USER_CART",
                payload: []
            })

            return
        }

        try {

            const user = jwt_decode(token)

            if (!user || !user.userId) {
                localStorage.removeItem("token")

                dispatchUserOrders({
                    type: "UPDATE_USER_ORDERS",
                    payload: []
                })

                return
            }

            async function loadUserOrders() {

                try {

                    const ordersResponse = await axios.get(
                        "http://localhost:5000/api/user/orders",
                        {
                            headers: {
                                "x-access-token": token
                            }
                        }
                    )

                    if (
                        ordersResponse.data.status === "ok"
                    ) {

                        dispatchUserOrders({
                            type: "UPDATE_USER_ORDERS",
                            payload:
                                ordersResponse.data.orders || []
                        })

                    }

                }
                catch (error) {

                    console.log(
                        "Unable to fetch orders:",
                        error
                    )

                }

                try {

                    const userResponse = await axios.get(
                        "http://localhost:5000/api/user",
                        {
                            headers: {
                                "x-access-token": token
                            }
                        }
                    )

                    if (
                        userResponse.data.status === "ok"
                    ) {

                        const userData =
                            userResponse.data.user

                        dispatchUserWishlist({
                            type: "UPDATE_USER_WISHLIST",
                            payload:
                                userData.wishlist || []
                        })

                        dispatchUserCart({
                            type: "UPDATE_USER_CART",
                            payload:
                                userData.cart || []
                        })

                    }

                }
                catch (error) {

                    console.log(
                        "Unable to fetch user data:",
                        error
                    )

                }

            }

            loadUserOrders()

        }
        catch (error) {

            console.log(
                "Invalid token:",
                error
            )

            localStorage.removeItem("token")

            dispatchUserOrders({
                type: "UPDATE_USER_ORDERS",
                payload: []
            })

        }

    }, [
        dispatchUserOrders,
        dispatchUserWishlist,
        dispatchUserCart
    ])

    return (

        <div className="orders-content-container">

            <h2>
                {userOrders.length}{" "}
                {userOrders.length === 1
                    ? "item"
                    : "items"}{" "}
                in your Orders
            </h2>

            {userOrders.length === 0 ? (

                <div className="no-orders-message-container">

                    <Lottie
                        options={guyWithBookObj}
                        height={350}
                        width={350}
                        isStopped={false}
                        isPaused={false}
                    />

                    <h2>
                        You have not placed any orders
                    </h2>

                    <Link to="/cart">

                        <button className="solid-primary-btn">
                            Go to cart
                        </button>

                    </Link>

                </div>

            ) : (

                <div className="orders-container">

                    {userOrders.map(
                        (productDetails, index) => (

                            <ProductOrderCard
                                key={
                                    productDetails._id ||
                                    productDetails.orderId ||
                                    index
                                }
                                productDetails={
                                    productDetails
                                }
                            />

                        )
                    )}

                </div>

            )}

        </div>

    )
}

export { Orders }
