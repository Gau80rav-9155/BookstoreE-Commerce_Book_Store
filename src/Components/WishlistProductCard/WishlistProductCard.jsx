import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./WishlistProductCard.css"

import {
    useToast,
    useWishlist,
    useCart
} from "../../index"


function WishlistProductCard({ productdetails }) {

    const navigate = useNavigate()

    const {
        dispatchUserWishlist
    } = useWishlist()

    const {
        dispatchUserCart
    } = useCart()

    const { showToast } = useToast()

    const {
        _id,
        bookName,
        author,
        originalPrice,
        discountedPrice,
        discountPercent,
        imgSrc,
        imgAlt,
        badgeText,
        outOfStock
    } = productdetails

    const [removing, setRemoving] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)


    async function removeFromWishlist(event) {

        event.preventDefault()
        event.stopPropagation()

        if (removing) {
            return
        }

        const token = localStorage.getItem("token")

        if (!token) {
            showToast("warning", "", "Kindly Login")
            navigate("/login")
            return
        }

        try {

            setRemoving(true)

            const response = await axios.patch(
                "https://bookstore-backend-gz0l.onrender.com/api/wishlist/remove",
                {
                    productId: String(_id),
                    bookName: bookName
                },
                {
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json"
                    }
                }
            )

            console.log(
                "REMOVE WISHLIST:",
                response.data
            )

            if (response.data.status === "ok") {

                dispatchUserWishlist({
                    type: "UPDATE_USER_WISHLIST",
                    payload: response.data.user?.wishlist || []
                })

                showToast(
                    "success",
                    "",
                    "Item removed from wishlist"
                )

            }
            else {

                showToast(
                    "error",
                    "",
                    response.data.message ||
                    "Unable to remove item"
                )

            }

        }
        catch (error) {

            console.log(
                "REMOVE WISHLIST ERROR:",
                error.response?.status,
                error.response?.data,
                error.message
            )

            if (error.response?.status === 401) {

                localStorage.removeItem("token")

                showToast(
                    "warning",
                    "",
                    "Session expired. Please login again."
                )

                navigate("/login")

            }
            else {

                showToast(
                    "error",
                    "",
                    error.response?.data?.message ||
                    "Unable to remove item from wishlist"
                )

            }

        }
        finally {

            setRemoving(false)

        }
    }


    async function addItemToCart(event) {

        event.preventDefault()
        event.stopPropagation()

        if (addingToCart) {
            return
        }

        const token = localStorage.getItem("token")

        if (!token) {
            showToast("warning", "", "Kindly Login")
            navigate("/login")
            return
        }

        try {

            setAddingToCart(true)

            const response = await axios.patch(
                "https://bookstore-backend-gz0l.onrender.com/api/cart",
                {
                    productdetails
                },
                {
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json"
                    }
                }
            )

            console.log(
                "ADD CART:",
                response.data
            )

            if (response.data.status === "ok") {

                dispatchUserCart({
                    type: "UPDATE_USER_CART",
                    payload: response.data.user?.cart || []
                })

                showToast(
                    "success",
                    "",
                    "Item successfully added to cart"
                )

            }
            else {

                showToast(
                    "error",
                    "",
                    response.data.message ||
                    "Unable to add item to cart"
                )

            }

        }
        catch (error) {

            console.log(
                "ADD CART ERROR:",
                error.response?.data ||
                error.message
            )

            showToast(
                "error",
                "",
                error.response?.data?.message ||
                "Unable to add item to cart"
            )

        }
        finally {

            setAddingToCart(false)

        }
    }


    function openProduct() {

        localStorage.setItem(
            String(_id),
            JSON.stringify(productdetails)
        )

    }


    return (

        <div className="card-basic wishlist-card">

            <Link
                to={`/shop/${_id}`}
                onClick={openProduct}
                target="_blank"
                rel="noopener noreferrer"
            >

                <img
                    src={imgSrc}
                    alt={imgAlt}
                />

                <div className="card-item-details">

                    <div className="item-title">

                        <h4>
                            {bookName}
                        </h4>

                    </div>

                    <h5 className="item-author">

                        - By&nbsp;
                        {author}

                    </h5>

                    <p>

                        <b>
                            Rs. {discountedPrice}
                        </b>

                        &nbsp;&nbsp;

                        <del>
                            Rs. {originalPrice}
                        </del>

                        &nbsp;&nbsp;

                        <span className="discount-on-card">
                            ({discountPercent}% off)
                        </span>

                    </p>

                    <div className="badge-on-card">
                        {badgeText}
                    </div>

                    {
                        outOfStock && (

                            <div className="card-text-overlay-container">

                                <p>
                                    Out of Stock
                                </p>

                            </div>

                        )
                    }

                </div>

            </Link>


            <div className="card-button">

                <button
                    type="button"
                    disabled={removing}
                    onClick={removeFromWishlist}
                    className="card-icon-btn added-to-wishlist-btn outline-card-secondary-btn"
                    title="Remove from Wishlist"
                >

                    <i
                        className="fa fa-heart"
                        aria-hidden="true"
                    />

                </button>

            </div>


            <button
                type="button"
                disabled={addingToCart}
                onClick={addItemToCart}
                className="solid-primary-btn add-wishlist-item-to-cart-btn"
            >

                {
                    addingToCart
                        ? "Adding..."
                        : "Add to Cart"
                }

            </button>

        </div>

    )

}


export { WishlistProductCard }