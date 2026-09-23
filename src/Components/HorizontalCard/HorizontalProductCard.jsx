import "./HorizontalProductCard.css"
import { useState } from "react"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useNavigate } from "react-router-dom"
import { useToast, useCart, useWishlist } from "../../index"

function HorizontalProductCard({ productDetails }) {

    const navigate = useNavigate()

    const { showToast } = useToast()

    const { dispatchUserWishlist } =
        useWishlist()

    const { dispatchUserCart } =
        useCart()


    const {
        _id,
        bookName,
        author,
        originalPrice,
        discountedPrice,
        discountPercent,
        imgSrc,
        imgAlt,
        badgeText
    } = productDetails


    const [productQuantity, setProductQuantity] =
        useState(
            Number(productDetails.quantity) || 1
        )


    function getToken() {

        const token =
            localStorage.getItem("token")

        if (!token) {

            showToast(
                "warning",
                "",
                "Kindly Login"
            )

            navigate("/login")

            return null
        }


        try {

            const user =
                jwt_decode(token)

            if (!user || !user.userId) {

                localStorage.removeItem("token")

                showToast(
                    "warning",
                    "",
                    "Kindly Login"
                )

                navigate("/login")

                return null
            }

            return token

        }
        catch (error) {

            localStorage.removeItem("token")

            showToast(
                "warning",
                "",
                "Kindly Login"
            )

            navigate("/login")

            return null
        }

    }


    async function updateQuantity(
        newQuantity
    ) {

        if (newQuantity < 1) {

            return

        }


        if (newQuantity > 99) {

            return

        }


        const token =
            getToken()

        if (!token) {

            return

        }


        try {

            const response =
                await axios.patch(

                    "http://localhost:5000/api/cart/quantity",

                    {
                        productId:
                            _id,

                        quantity:
                            newQuantity
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

                setProductQuantity(
                    newQuantity
                )


                dispatchUserCart({

                    type:
                        "UPDATE_USER_CART",

                    payload:
                        response.data.user.cart ||
                        []

                })

            }
            else {

                showToast(
                    "error",
                    "",
                    "Something went wrong!"
                )

            }

        }
        catch (error) {

            console.log(
                "Quantity Error:",
                error
            )

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Unable to update quantity"
            )

        }

    }


    async function removeItemFromCart() {

        const token =
            getToken()

        if (!token) {

            return

        }


        try {

            const response =
                await axios.patch(

                    "http://localhost:5000/api/cart/remove",

                    {
                        productId:
                            _id
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

                dispatchUserCart({

                    type:
                        "UPDATE_USER_CART",

                    payload:
                        response.data.user.cart ||
                        []

                })


                showToast(
                    "success",
                    "",
                    "Item successfully deleted from cart"
                )

            }
            else {

                showToast(
                    "error",
                    "",
                    "Unable to remove item"
                )

            }

        }
        catch (error) {

            console.log(
                "Remove Cart Error:",
                error
            )

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Unable to remove item from cart"
            )

        }

    }


    async function addItemToWishlist() {

        const token =
            getToken()

        if (!token) {

            return

        }


        try {

            const response =
                await axios.patch(

                    "http://localhost:5000/api/wishlist",

                    {
                        productdetails:
                            productDetails
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

                dispatchUserWishlist({

                    type:
                        "UPDATE_USER_WISHLIST",

                    payload:
                        response.data.user.wishlist ||
                        []

                })


                showToast(
                    "success",
                    "",
                    "Item successfully added to wishlist"
                )

            }
            else {

                showToast(
                    "error",
                    "",
                    "Unable to add item to wishlist"
                )

            }

        }
        catch (error) {

            console.log(
                "Wishlist Error:",
                error
            )

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Unable to add item to wishlist"
            )

        }

    }


    return (

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
                    - By &nbsp;{author}
                </p>


                <p className="price-details">

                    &#8377; {discountedPrice}

                    &nbsp;&nbsp;

                    <del>
                        &#8377; {originalPrice}
                    </del>

                    &nbsp;&nbsp;

                    <span className="discount-on-card">
                        {discountPercent}% off
                    </span>

                </p>


                <div className="item-cart-quantity">

                    <p className="cart-quantity-para">
                        Quantity : &nbsp;&nbsp;
                    </p>


                    <div className="quantity-manage-container">

                        <div
                            className="quantity-change"
                            onClick={() =>
                                updateQuantity(
                                    productQuantity - 1
                                )
                            }
                        >
                            -
                        </div>


                        <input
                            className="cart-item-quantity-input"
                            value={productQuantity}
                            onChange={(event) => {

                                const value =
                                    event.target.value

                                if (
                                    value === ""
                                ) {

                                    return

                                }

                                const newQuantity =
                                    Number(value)

                                if (
                                    Number.isInteger(
                                        newQuantity
                                    )
                                ) {

                                    updateQuantity(
                                        newQuantity
                                    )

                                }

                            }}
                            type="number"
                            min="1"
                            max="99"
                            autoComplete="off"
                        />


                        <div
                            className="quantity-change"
                            onClick={() =>
                                updateQuantity(
                                    productQuantity + 1
                                )
                            }
                        >
                            +
                        </div>

                    </div>

                </div>


                <div className="cart-horizontal-card-btns card-button">

                    <button
                        className="solid-primary-btn"
                        onClick={
                            removeItemFromCart
                        }
                    >
                        Remove from Cart
                    </button>


                    <button
                        className="outline-primary-btn"
                        onClick={
                            addItemToWishlist
                        }
                    >
                        Add to Wishlist
                    </button>

                </div>


                <div className="badge-on-card">
                    {badgeText}
                </div>

            </div>

        </div>

    )

}


export { HorizontalProductCard }