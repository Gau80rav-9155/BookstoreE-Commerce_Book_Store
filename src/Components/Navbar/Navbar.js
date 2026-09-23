import React, { useEffect, useState } from 'react'
import './Navbar.css'
import { Link, useLocation, useNavigate } from "react-router-dom"
import jwt_decode from "jwt-decode"
import {
    useUserLogin,
    useToast,
    useWishlist,
    useCart,
    useOrders,
    useSearchBar
} from "../../index"
import { useProductAvailable } from "../../Context/product-context"
import { BsShopWindow, BsFillBagFill } from "react-icons/bs"

function Navbar() {

    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { userCart, dispatchUserCart } = useCart()
    const { userOrders, dispatchUserOrders } = useOrders()
    const { setUserLoggedIn } = useUserLogin(false)
    const { showToast } = useToast()
    const { searchBarTerm, setSearchBarTerm } = useSearchBar()
    const { productsAvailableList } = useProductAvailable()

    const location = useLocation()
    const navigate = useNavigate()

    const [showSuggestions, setShowSuggestions] = useState(false)

    useEffect(() => {

        const token = localStorage.getItem('token')

        if (token) {

            const user = jwt_decode(token)

            if (!user) {
                localStorage.removeItem('token')
                setUserLoggedIn(false)
            }
            else {
                setUserLoggedIn(true)
            }
        }

    }, [setUserLoggedIn])

    useEffect(() => {

        function handleInvalidToken() {

            if (localStorage.getItem('token') !== null) {

                setUserLoggedIn(true)

            }
            else {

                setUserLoggedIn(false)

                dispatchUserWishlist({
                    type: "UPDATE_USER_WISHLIST",
                    payload: []
                })

                dispatchUserCart({
                    type: "UPDATE_USER_CART",
                    payload: []
                })

                dispatchUserOrders({
                    type: "UPDATE_USER_ORDERS",
                    payload: []
                })
            }
        }

        window.addEventListener("storage", handleInvalidToken)

        return function cleanup() {
            window.removeEventListener('storage', handleInvalidToken)
        }

    }, [
        userWishlist,
        userCart,
        dispatchUserWishlist,
        dispatchUserCart,
        dispatchUserOrders,
        setUserLoggedIn
    ])

    function logoutUser() {

        localStorage.removeItem('token')

        dispatchUserWishlist({
            type: "UPDATE_USER_WISHLIST",
            payload: []
        })

        dispatchUserCart({
            type: "UPDATE_USER_CART",
            payload: []
        })

        dispatchUserOrders({
            type: "UPDATE_USER_ORDERS",
            payload: []
        })

        setUserLoggedIn(false)

        localStorage.clear()

        showToast(
            "success",
            "",
            "Logged out successfully"
        )
    }

    function handleSearchChange(event) {

        const value = event.target.value

        setSearchBarTerm(value)

        if (value.trim() !== "") {
            setShowSuggestions(true)
        }
        else {
            setShowSuggestions(false)
        }
    }

    function handleSearchSubmit(event) {

        event.preventDefault()

        if (searchBarTerm.trim() !== "") {

            setShowSuggestions(false)

            navigate("/shop")
        }
    }

    function handleSuggestionClick(value) {

        setSearchBarTerm(value)

        setShowSuggestions(false)

        navigate("/shop")
    }

    function clearSearch() {

        setSearchBarTerm("")

        setShowSuggestions(false)
    }

    const searchTerm = searchBarTerm.trim().toLowerCase()

    const searchSuggestions = searchTerm === ""
        ? []
        : productsAvailableList
            .filter(product => {

                return (
                    product.bookName?.toLowerCase().includes(searchTerm) ||
                    product.author?.toLowerCase().includes(searchTerm) ||
                    product.genre?.toLowerCase().includes(searchTerm)
                )

            })
            .slice(0, 6)

    return (
        <div className="top-bar">

            <div className="left-topbar-container">

                <Link to="/">
                    <h2 className="top-bar-brand-name">
                        BookStore
                    </h2>
                </Link>

                {
                    location.pathname === "/shop" && (

                        <div className="smart-search-container">

                            <form
                                className="search-bar"
                                onSubmit={handleSearchSubmit}
                            >

                                <span className="search-icon">
                                    <i
                                        className="fa fa-search"
                                        aria-hidden="true"
                                    ></i>
                                </span>

                                <input
                                    className="search-bar-input"
                                    placeholder="Search books, authors, genres..."
                                    value={searchBarTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => {
                                        if (searchTerm !== "") {
                                            setShowSuggestions(true)
                                        }
                                    }}
                                    autoComplete="off"
                                />

                                {
                                    searchBarTerm && (

                                        <button
                                            type="button"
                                            className="search-clear-btn"
                                            onClick={clearSearch}
                                            aria-label="Clear search"
                                        >
                                            ×
                                        </button>

                                    )
                                }

                                <button
                                    type="submit"
                                    className="search-submit-btn"
                                >
                                    Search
                                </button>

                            </form>

                            {
                                showSuggestions &&
                                searchSuggestions.length > 0 && (

                                    <div className="search-suggestions">

                                        {
                                            searchSuggestions.map(product => (

                                                <button
                                                    key={product._id}
                                                    className="search-suggestion-item"
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            product.bookName
                                                        )
                                                    }
                                                >

                                                    <div className="suggestion-book-info">

                                                        <strong>
                                                            {product.bookName}
                                                        </strong>

                                                        <span>
                                                            {product.author}
                                                        </span>

                                                    </div>

                                                    <span className="suggestion-genre">
                                                        {product.genre}
                                                    </span>

                                                </button>

                                            ))
                                        }

                                    </div>

                                )
                            }

                            {
                                showSuggestions &&
                                searchTerm !== "" &&
                                searchSuggestions.length === 0 && (

                                    <div className="search-no-results">
                                        No books found
                                    </div>

                                )
                            }

                        </div>

                    )
                }

            </div>

            <div className="right-topbar-container">

                {
                    localStorage.getItem('token') !== null
                        ? (

                            <button
                                onClick={logoutUser}
                                className="navbar-login-btn solid-primary-btn"
                            >
                                Logout
                            </button>

                        )
                        : (

                            <Link to="/login">

                                <button className="navbar-login-btn solid-primary-btn">
                                    Login
                                </button>

                            </Link>

                        )
                }

                {/* Profile */}

                <Link to="/profile">

                    <button
                        className="icon-btn"
                        title="My Profile"
                    >

                        <div>

                            <i
                                className="fa fa-user"
                                aria-hidden="true"
                            ></i>

                        </div>

                    </button>

                </Link>

                {/* Shop */}

                <Link to="/shop">

                    <button className="icon-btn">

                        <div>

                            <BsShopWindow />

                        </div>

                    </button>

                </Link>

                {/* Wishlist */}

                <Link to="/wishlist">

                    <button className="icon-btn">

                        <div className="icon-count-badge">

                            <i
                                className="fa fa-heart-o fa-x"
                                aria-hidden="true"
                            ></i>

                            {
                                userWishlist.length !== 0 && (

                                    <span className="count-badge-x">
                                        {userWishlist.length}
                                    </span>

                                )
                            }

                        </div>

                    </button>

                </Link>

                {/* Cart */}

                <Link to="/cart">

                    <button className="icon-btn">

                        <div className="icon-count-badge">

                            <i
                                className="fa fa-shopping-cart fa-x"
                                aria-hidden="true"
                            ></i>

                            {
                                userCart.length !== 0 && (

                                    <span className="count-badge-x">
                                        {userCart.length}
                                    </span>

                                )
                            }

                        </div>

                    </button>

                </Link>

                {/* Orders */}

                <Link to="/orders">

                    <button className="icon-btn">

                        <div className="icon-count-badge">

                            <BsFillBagFill
                                style={{
                                    marginBottom: "4px"
                                }}
                            />

                            {
                                userOrders.length !== 0 && (

                                    <span className="count-badge-x">
                                        {userOrders.length}
                                    </span>

                                )
                            }

                        </div>

                    </button>

                </Link>

            </div>

        </div>
    )
}

export { Navbar }