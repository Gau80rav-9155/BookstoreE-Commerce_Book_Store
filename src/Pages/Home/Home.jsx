import React, { useEffect } from 'react'
import { Link } from "react-router-dom"
import axios from "axios"
import { useLocation } from "react-router-dom"
import LibraryIllustration from "../..//Assets/Images/Library_Illustration_1.jpg"
import './Home.css'
import jwt_decode from "jwt-decode"
import {
  GenreCard,
  NewArrivals,
  Footer,
  useWishlist,
  useCart
} from "../../index.js"
import { useProductAvailable } from "../../Context/product-context"
import { useGenre } from "../../Context/genre-context"
import { AIRecommendations } from "../../Components/AIRecommendations/AIRecommendations"

function Home() {
  const { dispatchProductFilterOptions } = useProductAvailable()
  const { dispatchUserWishlist } = useWishlist()
  const { dispatchUserCart } = useCart()

  const {
    setFictionCategoryCheckbox,
    setThrillerCategoryCheckbox,
    setTechCategoryCheckbox,
    setPhilosophyCategoryCheckbox,
    setRomanceCategoryCheckbox,
    setMangaCategoryCheckbox,
  } = useGenre()

  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      const user = jwt_decode(token)

      if (!user) {
        localStorage.removeItem('token')
      } else {
        ;(async function getUpdatedWishlistAndCart() {
          let updatedUserInfo = await axios.get(
            "https://bookztron-server.vercel.app/api/user",
            {
              headers: {
                'x-access-token': localStorage.getItem('token'),
              }
            }
          )

          if (updatedUserInfo.data.status === "ok") {
            dispatchUserWishlist({
              type: "UPDATE_USER_WISHLIST",
              payload: updatedUserInfo.data.user.wishlist
            })

            dispatchUserCart({
              type: "UPDATE_USER_CART",
              payload: updatedUserInfo.data.user.cart
            })
          }
        })()
      }
    }
  }, [dispatchUserWishlist, dispatchUserCart])

  return (
    <div className='home-component-container'>

      <div
        className='home-page-img-container'
        style={{
          position: "relative"
        }}
      >

        <img
          className="home-page-background-img"
          src={LibraryIllustration}
          alt="BookStore Library"
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "100%",
            pointerEvents: "none"
          }}
        >
          <h1
            style={{
              fontSize: "58px",
              fontWeight: "700",
              color: "white",
              textShadow: "0 3px 10px rgba(0,0,0,0.7)",
              margin: 0
            }}
          >
            BookStore
          </h1>

          <p
            style={{
              fontSize: "22px",
              color: "white",
              textShadow: "0 2px 6px rgba(0,0,0,0.7)",
              marginTop: "10px"
            }}
          >
            Your Favorite Books, All in One Place
          </p>
        </div>

      </div>

      <h1 className='homepage-headings'>Genres</h1>

      <div className='genre-cards-container'>

        <Link to={"/shop"}>
          <GenreCard genretype="Fiction" />
        </Link>

        <Link to={"/shop"}>
          <GenreCard genretype="Thriller" />
        </Link>

        <Link to={"/shop"}>
          <GenreCard genretype="Tech" />
        </Link>

        <Link to={"/shop"}>
          <GenreCard genretype="Philosophy" />
        </Link>

        <Link to={"/shop"}>
          <GenreCard genretype="Romance" />
        </Link>

        <Link to={"/shop"} state={{ navigate: true }}>
          <GenreCard genretype="Manga" />
        </Link>

      </div>

      <Link to={"/shop"}>
        <button
          onClick={() => {
            setFictionCategoryCheckbox(true)
            setThrillerCategoryCheckbox(true)
            setTechCategoryCheckbox(true)
            setPhilosophyCategoryCheckbox(true)
            setRomanceCategoryCheckbox(true)
            setMangaCategoryCheckbox(true)

            dispatchProductFilterOptions({
              type: "RESET_DEFAULT_FILTERS"
            })
          }}
          className="solid-secondary-btn homepage-explore-all-btn"
        >
          Explore All
        </button>
      </Link>

      <AIRecommendations />

      <h1 className='homepage-headings'>New Arrivals</h1>

      <NewArrivals />

      <Footer />

    </div>
  )
}

export { Home }