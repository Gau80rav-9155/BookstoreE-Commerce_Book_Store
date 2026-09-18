import "./ShoppingBill.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart, useToast, useOrders } from "../../index"
import axios from "axios"

function ShoppingBill() {

    const navigate = useNavigate()

    const { userCart, dispatchUserCart } = useCart()
    const { showToast } = useToast()
    const { dispatchUserOrders } = useOrders()

    const [couponName, setCouponName] = useState("")
    const [placingOrder, setPlacingOrder] = useState(false)

    let totalDiscount = 0
    let totalBill = 0

    userCart.forEach(product => {

        const originalPrice =
            Number(product.originalPrice) || 0

        const discountedPrice =
            Number(product.discountedPrice) || 0

        const quantity =
            Number(product.quantity) || 1

        totalDiscount =
            totalDiscount +
            (originalPrice - discountedPrice) * quantity

        totalBill =
            totalBill +
            discountedPrice * quantity
    })

    let couponDiscount = 0

    if (couponName.trim().toUpperCase() === "BOOKS200") {
        couponDiscount = Math.min(200, totalBill)
    }

    const discountedBill =
        Math.max(0, totalBill - couponDiscount)

    const deliveryCharges =
        userCart.length > 0 ? 50 : 0

    const finalBill =
        discountedBill + deliveryCharges


    async function placeOrder() {

        if (userCart.length === 0) {

            showToast(
                "error",
                "",
                "Your cart is empty"
            )

            return
        }

        const token =
            localStorage.getItem("token")

        if (!token) {

            showToast(
                "error",
                "",
                "Please login first"
            )

            navigate("/login")

            return
        }

        setPlacingOrder(true)

        try {

            const createdOrders = []

            for (
                let index = 0;
                index < userCart.length;
                index++
            ) {

                const product =
                    userCart[index]

                const orderId =
                    `BOOKSTORE-${Date.now()}-${index + 1}`


                const response =
                    await axios.post(

                        "http://localhost:5000/api/orders",

                        {

                            orderId,

                            bookName:
                                product.bookName,

                            author:
                                product.author || "",

                            quantity:
                                Number(product.quantity) || 1,

                            price:
                                Number(product.discountedPrice) || 0,

                            /* BOOK IMAGE */

                            imgSrc:
                                product.imgSrc || "",

                            imgAlt:
                                product.imgAlt ||
                                product.bookName ||
                                "Book",

                            badgeText:
                                product.badgeText || ""

                        },

                        {

                            headers: {

                                "x-access-token":
                                    token

                            }

                        }
                    )


                if (
                    response.data.status ===
                    "ok"
                ) {

                    createdOrders.push(
                        response.data.order
                    )

                }

            }


            if (createdOrders.length === 0) {

                throw new Error(
                    "Order could not be created"
                )

            }


            dispatchUserOrders({

                type:
                    "UPDATE_USER_ORDERS",

                payload:
                    createdOrders

            })


            try {

                await axios.patch(

                    "http://localhost:5000/api/cart/empty/all",

                    {},

                    {

                        headers: {

                            "x-access-token":
                                token

                        }

                    }

                )

            }

            catch (error) {

                console.log(
                    "Cart backend empty error:",
                    error
                )

            }


            dispatchUserCart({

                type:
                    "UPDATE_USER_CART",

                payload: []

            })


            showToast(

                "success",

                "",

                "Order placed successfully!"

            )


            navigate("/orders")

        }

        catch (error) {

            console.log(
                "Place order error:",
                error
            )


            if (

                error.response?.status ===
                    401 ||

                error.response?.status ===
                    403

            ) {

                localStorage.removeItem(
                    "token"
                )

                showToast(

                    "error",

                    "",

                    "Session expired. Please login again"

                )

                navigate("/login")

                return
            }


            showToast(

                "error",

                "",

                error.response?.data?.message ||
                "Unable to place order"

            )

        }

        finally {

            setPlacingOrder(false)

        }

    }


    return (

        <div className="cart-bill">

            <h2 className="bill-heading">
                Bill Details
            </h2>

            <hr />


            {

                userCart.map(product => {

                    return (

                        <div
                            key={product._id}
                            className="cart-price-container"
                        >

                            <div className="cart-item-bookname">

                                <p>
                                    {product.bookName}
                                </p>

                            </div>


                            <div className="cart-item-quantity">

                                <p>
                                    X {product.quantity}
                                </p>

                            </div>


                            <div
                                className="cart-item-total-price"
                                id="price-sum"
                            >

                                <p>

                                    &#8377;

                                    {
                                        Number(
                                            product.discountedPrice ||
                                            0
                                        ) *
                                        Number(
                                            product.quantity ||
                                            1
                                        )
                                    }

                                </p>

                            </div>

                        </div>

                    )

                })

            }


            <hr />


            <div className="cart-discount-container">

                <div className="cart-item-total-discount">

                    <p>
                        Discount
                    </p>

                </div>


                <div
                    className="cart-item-total-discount-amount"
                    id="price-sum"
                >

                    <p>
                        &#8377; {totalDiscount}
                    </p>

                </div>

            </div>


            {

                couponDiscount > 0 && (

                    <div className="cart-discount-container">

                        <div className="cart-item-total-discount">

                            <p>
                                Coupon Discount
                            </p>

                        </div>


                        <div
                            className="cart-item-total-discount-amount"
                            id="price-sum"
                        >

                            <p>
                                - &#8377; {couponDiscount}
                            </p>

                        </div>

                    </div>

                )

            }


            <div className="cart-delivery-charges-container">

                <div className="cart-item-total-delivery-charges">

                    <p>
                        Delivery Charges
                    </p>

                </div>


                <div
                    className="cart-item-total-delivery-charges-amount"
                    id="price-sum"
                >

                    <p id="delivery-charges">

                        &#8377; {deliveryCharges}

                    </p>

                </div>

            </div>


            <hr />


            <div className="cart-total-charges-container">

                <div className="cart-item-total-delivery-charges">

                    <p>

                        <b>
                            Total Charges
                        </b>

                    </p>

                </div>


                <div
                    className="cart-item-total-delivery-charges-amount"
                    id="price-sum"
                >

                    <p id="total-charges">

                        <b>
                            &#8377; {finalBill}
                        </b>

                    </p>

                </div>

            </div>


            <hr />


            <div className="apply-coupon-container">

                <p>
                    Apply Coupon
                </p>


                <input

                    value={couponName}

                    onChange={
                        event =>
                            setCouponName(
                                event.target.value
                            )
                    }

                    placeholder="Try BOOKS200"

                />

            </div>


            <button

                className="place-order-btn solid-secondary-btn"

                onClick={placeOrder}

                disabled={placingOrder}

            >

                {

                    placingOrder

                        ? "Placing Order..."

                        : "Place Order"

                }

            </button>

        </div>

    )

}

export { ShoppingBill }