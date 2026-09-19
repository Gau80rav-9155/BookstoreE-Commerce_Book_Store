import "./ProductOrderCard.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { useToast, useOrders } from "../../index"

function ProductOrderCard({ productDetails }) {

    const { dispatchUserOrders } = useOrders()
    const { showToast } = useToast()

    const {
        _id,
        bookName,
        author,
        imgSrc,
        imgAlt,
        badgeText,
        quantity,
        orderId
    } = productDetails

    const [currentStatus, setCurrentStatus] = useState(
        productDetails.status || "Order Placed"
    )


    useEffect(() => {

        setCurrentStatus(
            productDetails.status || "Order Placed"
        )

    }, [productDetails.status])


    const statusSteps = [
        "Order Placed",
        "Processing",
        "Shipped",
        "Delivered"
    ]

    const currentStatusIndex =
        statusSteps.indexOf(currentStatus)


    function getStepClass(index) {

        if (index <= currentStatusIndex) {
            return "tracking-step completed"
        }

        return "tracking-step"
    }


    function getStepMessage(index) {

        if (index < currentStatusIndex) {
            return "Completed"
        }

        if (index === currentStatusIndex) {

            if (currentStatus === "Order Placed") {
                return "Your order has been placed"
            }

            if (currentStatus === "Processing") {
                return "Your order is being processed"
            }

            if (currentStatus === "Shipped") {
                return "Your order has been shipped"
            }

            if (currentStatus === "Delivered") {
                return "Your order has been delivered"
            }
        }

        if (index === 1) {
            return "Waiting for processing"
        }

        if (index === 2) {
            return "Waiting for shipment"
        }

        return "Waiting for delivery"
    }


    const removeItemFromOrders = async () => {

        const token = localStorage.getItem("token")

        if (!token) {

            showToast(
                "error",
                "",
                "Please login first"
            )

            return
        }

        try {

            const response = await axios.patch(
                `https://bookstore-backend-gz0l.onrender.com/api/orders/${_id}`,
                {
                    orderId
                },
                {
                    headers: {
                        "x-access-token": token
                    }
                }
            )

            if (response.data.status === "ok") {

                dispatchUserOrders({
                    type: "UPDATE_USER_ORDERS",
                    payload: response.data.user.orders || []
                })

                showToast(
                    "success",
                    "",
                    "Order item removed successfully"
                )
            }

        } catch (error) {

            console.log(error)

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Unable to remove order item"
            )
        }
    }


    return (
        <div className="order-card-wrapper">

            <div className="card-basic-horizontal">

                <img
                    className="cart-item-book-img"
                    src={imgSrc}
                    alt={imgAlt}
                />

                <div
                    id="cart-item-detail"
                    className="card-item-details"
                >

                    <h4 id="item-title">
                        {bookName}
                    </h4>

                    <p className="item-author">
                        By &nbsp;{author}
                    </p>

                    <div className="item-cart-quantity">

                        <p className="cart-quantity-para">
                            Quantity : &nbsp;&nbsp;
                        </p>

                        <p>
                            {quantity}
                        </p>

                    </div>

                    <p className="order-id">
                        Order ID: {orderId}
                    </p>


                    <div className="order-status-box">

                        <span className="status-dot"></span>

                        <div>

                            <strong>
                                {currentStatus}
                            </strong>

                            <p>
                                {
                                    currentStatus === "Order Placed"
                                        ? "Your order has been successfully placed."
                                        : currentStatus === "Processing"
                                            ? "Your order is being processed."
                                            : currentStatus === "Shipped"
                                                ? "Your order has been shipped."
                                                : "Your order has been delivered."
                                }
                            </p>

                        </div>

                    </div>


                    <div className="order-tracking">

                        <h3>
                            Order Tracking
                        </h3>


                        {
                            statusSteps.map(
                                (step, index) => {

                                    return (
                                        <div
                                            key={step}
                                        >

                                            <div
                                                className={getStepClass(index)}
                                            >

                                                <div className="tracking-icon">

                                                    {
                                                        index <= currentStatusIndex
                                                            ? "✓"
                                                            : index + 1
                                                    }

                                                </div>


                                                <div className="tracking-content">

                                                    <strong>
                                                        {step}
                                                    </strong>

                                                    <span>
                                                        {getStepMessage(index)}
                                                    </span>

                                                </div>

                                            </div>


                                            {
                                                index <
                                                statusSteps.length - 1 && (
                                                    <div
                                                        className={
                                                            index <
                                                            currentStatusIndex
                                                                ? "tracking-line completed"
                                                                : "tracking-line"
                                                        }
                                                    ></div>
                                                )
                                            }

                                        </div>
                                    )
                                }
                            )
                        }

                    </div>


                    <div className="cart-horizontal-card-btns card-button">

                        <button
                            className="solid-primary-btn"
                            onClick={removeItemFromOrders}
                        >
                            Remove item from Order
                        </button>

                    </div>


                    <div className="badge-on-card">
                        {badgeText}
                    </div>

                </div>

            </div>

        </div>
    )
}

export { ProductOrderCard }