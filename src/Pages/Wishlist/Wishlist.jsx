import "./Wishlist.css"
import jwt_decode from "jwt-decode"
import axios from "axios"
import { Link } from "react-router-dom"
import {
    WishlistProductCard,
    useWishlist,
    useCart
} from "../../index"
import Lottie from "react-lottie"
import HeartLottie from "../../Assets/Icons/heart.json"
import { useEffect } from "react"


function Wishlist() {

    const {
        userWishlist,
        dispatchUserWishlist
    } = useWishlist()


    const {
        dispatchUserCart
    } = useCart()


    const heartObj = {

        loop: true,

        autoplay: true,

        animationData:
            HeartLottie,

        rendererSettings: {

            preserveAspectRatio:
                "xMidYMid slice"

        }

    }


    useEffect(() => {

        const token =
            localStorage.getItem("token")


        if (!token) {

            dispatchUserWishlist({

                type:
                    "UPDATE_USER_WISHLIST",

                payload:
                    []

            })


            dispatchUserCart({

                type:
                    "UPDATE_USER_CART",

                payload:
                    []

            })

            return

        }


        try {

            const user =
                jwt_decode(token)


            if (!user || !user.userId) {

                localStorage.removeItem("token")

                dispatchUserWishlist({

                    type:
                        "UPDATE_USER_WISHLIST",

                    payload:
                        []

                })

                dispatchUserCart({

                    type:
                        "UPDATE_USER_CART",

                    payload:
                        []

                })

                return

            }


            async function getUpdatedWishlistAndCart() {

                try {

                    const response =
                        await axios.get(

                            "https://bookstore-backend-gz0l.onrender.com/api/user",

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


                        dispatchUserCart({

                            type:
                                "UPDATE_USER_CART",

                            payload:
                                response.data.user.cart ||
                                []

                        })

                    }

                }
                catch (error) {

                    console.log(
                        "Unable to load wishlist:",
                        error
                    )

                }

            }


            getUpdatedWishlistAndCart()

        }
        catch (error) {

            localStorage.removeItem("token")

            dispatchUserWishlist({

                type:
                    "UPDATE_USER_WISHLIST",

                payload:
                    []

            })

            dispatchUserCart({

                type:
                    "UPDATE_USER_CART",

                payload:
                    []

            })

        }

    }, [
        dispatchUserWishlist,
        dispatchUserCart
    ])


    return (

        <div className="wishlist-container">

            <h2>

                {userWishlist.length}{" "}

                {
                    userWishlist.length === 1
                        ? "item"
                        : "items"
                }

                {" "}in Wishlist

            </h2>


            <div className="products-card-grid">

                {

                    userWishlist.length > 0

                        ? (

                            userWishlist.map(
                                productdetails => (

                                    <WishlistProductCard
                                        key={
                                            productdetails._id
                                        }
                                        productdetails={
                                            productdetails
                                        }
                                    />

                                )
                            )

                        )

                        : (

                            <div className="empty-wishlist-message-container">

                                <Lottie
                                    options={heartObj}
                                    height={150}
                                    width={150}
                                    isStopped={false}
                                    isPaused={false}
                                />


                                <h2>
                                    Your wishlist is empty 🙃
                                </h2>


                                <Link to="/shop">

                                    <button className="solid-primary-btn">

                                        Go to shop

                                    </button>

                                </Link>

                            </div>

                        )

                }

            </div>

        </div>

    )

}


export { Wishlist }