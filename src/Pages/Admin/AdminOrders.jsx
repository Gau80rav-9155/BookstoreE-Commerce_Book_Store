import React, { useEffect, useState } from "react"
import axios from "axios"
import "./AdminOrders.css"

function AdminOrders() {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingOrder, setUpdatingOrder] = useState("")
    const [message, setMessage] = useState("")

    const statuses = [
        "Order Placed",
        "Processing",
        "Shipped",
        "Delivered"
    ]

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {

        const token = localStorage.getItem("adminToken")

        if (!token) {
            setMessage("Admin login required")
            setLoading(false)
            return
        }

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/orders",
                {
                    headers: {
                        "x-access-token": token
                    }
                }
            )

            if (response.data.status === "ok") {

                setOrders(
                    response.data.orders || []
                )

            } else {

                setMessage(
                    response.data.message ||
                    "Unable to load orders"
                )

            }

        } catch (error) {

            console.log(
                "Fetch orders error:",
                error
            )

            setMessage(
                error.response?.data?.message ||
                "Unable to load orders"
            )

        } finally {

            setLoading(false)

        }
    }


    async function updateStatus(
        orderId,
        newStatus
    ) {

        const token =
            localStorage.getItem("adminToken")

        if (!token) {

            setMessage(
                "Admin login required"
            )

            return
        }

        setUpdatingOrder(orderId)
        setMessage("")

        try {

            const response = await axios.patch(
                `http://localhost:5000/api/admin/orders/${orderId}/status`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        "x-access-token": token
                    }
                }
            )

            if (
                response.data.status === "ok"
            ) {

                const updatedOrder =
                    response.data.order

                setOrders(
                    previousOrders =>
                        previousOrders.map(
                            order =>
                                order._id === orderId
                                    ? updatedOrder
                                    : order
                        )
                )

                setMessage(
                    `Order status changed to ${newStatus}`
                )

            } else {

                setMessage(
                    response.data.message ||
                    "Unable to update order status"
                )

            }

        } catch (error) {

            console.log(
                "Update status error:",
                error
            )

            setMessage(
                error.response?.data?.message ||
                "Unable to update order status"
            )

        } finally {

            setUpdatingOrder("")

        }
    }


    function getStatusNumber(status) {

        const index =
            statuses.indexOf(status)

        return index >= 0
            ? index + 1
            : 1
    }


    function getStatusDescription(
        status,
        completed
    ) {

        if (!completed) {

            return `Waiting for ${status.toLowerCase()}`
        }

        if (status === "Order Placed") {
            return "Order has been placed"
        }

        if (status === "Processing") {
            return "Order is being processed"
        }

        if (status === "Shipped") {
            return "Order has been shipped"
        }

        return "Order has been delivered"
    }


    if (loading) {

        return (
            <div className="admin-orders-page">

                <div className="admin-orders-container">

                    <h2>
                        Loading Orders...
                    </h2>

                </div>

            </div>
        )
    }


    return (

        <div className="admin-orders-page">

            <div className="admin-orders-container">

                <div className="admin-orders-header">

                    <div>

                        <h1>
                            Order Management
                        </h1>

                        <p>
                            Manage customer orders and update order status
                        </p>

                    </div>

                    <div className="admin-orders-count">

                        {orders.length} Orders

                    </div>

                </div>


                <div className="admin-info-box">

                    <strong>
                        Admin Order Management
                    </strong>

                    <span>
                        Orders are loaded from MongoDB.
                    </span>

                </div>


                {message && (

                    <div className="admin-info-box">

                        {message}

                    </div>

                )}


                {orders.length === 0 ? (

                    <div className="admin-no-orders">

                        <div className="admin-no-orders-icon">
                            📦
                        </div>

                        <h2>
                            No Orders Found
                        </h2>

                        <p>
                            There are currently no customer orders.
                        </p>

                    </div>

                ) : (

                    <div className="admin-orders-list">

                        {orders.map(order => {

                            const currentStatus =
                                getStatusNumber(
                                    order.status
                                )

                            return (

                                <div
                                    className="admin-order-card"
                                    key={order._id}
                                >

                                    <div className="admin-order-top">

                                        <div>

                                            <h2>
                                                {order.bookName}
                                            </h2>

                                            <p className="admin-order-id">
                                                Order ID:{" "}
                                                {order.orderId}
                                            </p>

                                        </div>


                                        <div className="admin-order-status">

                                            {order.status}

                                        </div>

                                    </div>


                                    <div className="admin-order-details">

                                        <div>

                                            <span>
                                                User ID
                                            </span>

                                            <strong>
                                                {order.userId}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Author
                                            </span>

                                            <strong>
                                                {order.author ||
                                                    "N/A"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Quantity
                                            </span>

                                            <strong>
                                                {order.quantity}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Total Amount
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    Number(
                                                        order.price
                                                    ) *
                                                    Number(
                                                        order.quantity
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="admin-tracking">

                                        <h3>
                                            Order Tracking
                                        </h3>


                                        <div className="admin-timeline">

                                            {statuses.map(
                                                (
                                                    status,
                                                    index
                                                ) => {

                                                    const stepNumber =
                                                        index + 1

                                                    const completed =
                                                        stepNumber <=
                                                        currentStatus

                                                    return (

                                                        <div
                                                            className={
                                                                completed
                                                                    ? "admin-timeline-step active"
                                                                    : "admin-timeline-step"
                                                            }
                                                            key={
                                                                status
                                                            }
                                                        >

                                                            <div className="admin-timeline-circle">

                                                                {completed
                                                                    ? "✓"
                                                                    : stepNumber}

                                                            </div>


                                                            <div className="admin-timeline-content">

                                                                <strong>
                                                                    {
                                                                        status
                                                                    }
                                                                </strong>

                                                                <span>

                                                                    {getStatusDescription(
                                                                        status,
                                                                        completed
                                                                    )}

                                                                </span>

                                                            </div>

                                                        </div>

                                                    )
                                                }
                                            )}

                                        </div>

                                    </div>


                                    <div className="admin-update-section">

                                        <h3>
                                            Update Order Status
                                        </h3>


                                        <div className="admin-status-buttons">

                                            {statuses.map(
                                                status => (

                                                    <button
                                                        key={
                                                            status
                                                        }
                                                        className={
                                                            order.status ===
                                                            status
                                                                ? "admin-status-btn selected"
                                                                : "admin-status-btn"
                                                        }
                                                        disabled={
                                                            updatingOrder ===
                                                            order._id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                order._id,
                                                                status
                                                            )
                                                        }
                                                    >

                                                        {
                                                            updatingOrder ===
                                                            order._id
                                                                ? "Updating..."
                                                                : status
                                                        }

                                                    </button>

                                                )
                                            )}

                                        </div>

                                    </div>

                                </div>

                            )
                        })}

                    </div>

                )}

            </div>

        </div>
    )
}

export { AdminOrders }