import React, { useEffect, useState } from "react"
import axios from "axios"
import jwt_decode from "jwt-decode"
import "./Reviews.css"

function Reviews({ productId }) {

    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(5)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!productId) return

        axios.get(
            `https://bookstore-backend-gz0l.onrender.com/api/reviews/${productId}`
        )
        .then(response => {
            if (response.data.status === "ok") {
                setReviews(response.data.reviews)
            }
        })
        .catch(error => {
            console.log("Unable to load reviews", error)
        })
    }, [productId])

    function submitReview() {

        const token = localStorage.getItem("token")

        if (!token) {
            setMessage("Please login to submit a review")
            return
        }

        if (!review.trim()) {
            setMessage("Please write your review")
            return
        }

        try {

            const user = jwt_decode(token)

            const userId =
                user.userId ||
                user.id ||
                user._id ||
                user.email

            const userName =
                user.userName ||
                user.name ||
                user.username ||
                "User"

            setLoading(true)
            setMessage("")

            axios.post(
                "https://bookstore-backend-gz0l.onrender.com/api/reviews",
                {
                    productId,
                    userId,
                    userName,
                    rating,
                    review
                }
            )
            .then(response => {

                if (response.data.status === "ok") {

                    setReviews([
                        response.data.review,
                        ...reviews
                    ])

                    setReview("")
                    setRating(5)

                    setMessage("Review submitted successfully")
                }

            })
            .catch(error => {

                console.log(error)

                setMessage(
                    error.response?.data?.message ||
                    "Unable to submit review"
                )

            })
            .finally(() => {
                setLoading(false)
            })

        }
        catch (error) {
            setMessage("Please login again")
        }
    }

    return (
        <div className="reviews-section">

            <div className="reviews-header">

                <h2>⭐ Book Reviews & Ratings</h2>

                <p>
                    Share your experience with this book
                </p>

            </div>


            <div className="review-form">

                <h3>Write a Review</h3>

                <label>Your Rating</label>

                <div className="star-rating">

                    {[1, 2, 3, 4, 5].map(star => (

                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            className={
                                star <= rating
                                    ? "star active"
                                    : "star"
                            }
                        >
                            ★
                        </span>

                    ))}

                </div>


                <label>Your Review</label>

                <textarea
                    value={review}
                    onChange={(event) =>
                        setReview(event.target.value)
                    }
                    placeholder="Write your review here..."
                />


                <button
                    onClick={submitReview}
                    disabled={loading}
                    className="submit-review-btn"
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Review"
                    }
                </button>


                {message && (
                    <p className="review-message">
                        {message}
                    </p>
                )}

            </div>


            <div className="customer-reviews">

                <h3>
                    Customer Reviews ({reviews.length})
                </h3>


                {reviews.length === 0 ? (

                    <p className="no-reviews">
                        No reviews yet. Be the first to review this book!
                    </p>

                ) : (

                    reviews.map(item => (

                        <div
                            className="review-card"
                            key={item._id}
                        >

                            <div className="review-card-header">

                                <strong>
                                    {item.userName}
                                </strong>

                                <div className="review-stars">

                                    {"★".repeat(item.rating)}
                                    {"☆".repeat(5 - item.rating)}

                                </div>

                            </div>

                            <p>
                                {item.review}
                            </p>

                        </div>

                    ))

                )}

            </div>

        </div>
    )
}

export { Reviews }