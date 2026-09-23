import React, { useMemo } from "react"
import { ProductCard } from "../Card/ProductCard"
import { useProductAvailable } from "../../Context/product-context"
import { useWishlist } from "../../Context/wishlist-context"
import "./AIRecommendations.css"

function AIRecommendations() {
    const { productsAvailableList } = useProductAvailable()
    const { userWishlist } = useWishlist()

    const recommendations = useMemo(() => {
        if (!productsAvailableList || productsAvailableList.length === 0) {
            return []
        }

        const wishlist = userWishlist || []
        const genrePreference = {}

        wishlist.forEach(product => {
            if (product && product.genre) {
                genrePreference[product.genre] =
                    (genrePreference[product.genre] || 0) + 1
            }
        })

        const wishlistIds = new Set(
            wishlist
                .filter(product => product && product._id)
                .map(product => product._id)
        )

        const scoredProducts = productsAvailableList
            .filter(product => product && !wishlistIds.has(product._id))
            .map(product => {
                let score = 0

                score += (genrePreference[product.genre] || 0) * 10
                score += Number(product.rating || 0) * 2

                if (product.fastDeliveryAvailable === true) {
                    score += 1
                }

                if (product.outOfStock === true) {
                    score -= 5
                }

                return {
                    ...product,
                    recommendationScore: score
                }
            })

        scoredProducts.sort(
            (a, b) => b.recommendationScore - a.recommendationScore
        )

        return scoredProducts.slice(0, 6)
    }, [productsAvailableList, userWishlist])

    if (recommendations.length === 0) {
        return null
    }

    const isPersonalized = userWishlist && userWishlist.length > 0

    return (
        <section className="ai-recommendations-section">
            <div className="ai-recommendations-header">
                <div>
                    <h1 className="homepage-headings">
                        🤖 Recommended For You
                    </h1>

                    <p className="ai-recommendations-subtitle">
                        {isPersonalized
                            ? "Based on your interests and reading preferences"
                            : "Popular books you may like"}
                    </p>
                </div>
            </div>

            <div className="ai-recommendations-container">
                {recommendations.map(product => (
                    <ProductCard
                        key={product._id}
                        productdetails={product}
                    />
                ))}
            </div>

            <div className="ai-recommendation-info">
                <span>✨</span>
                <span>
                    Smart recommendations based on your book preferences
                </span>
            </div>
        </section>
    )
}

export { AIRecommendations }
export default AIRecommendations