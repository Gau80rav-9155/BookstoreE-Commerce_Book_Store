import "./SalesAnalytics.css"
import { useEffect, useState } from "react"
import axios from "axios"

function SalesAnalytics() {

    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        booksSold: 0,
        averageOrderValue: 0,
        topBooks: [],
        monthlySales: []
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {

        const token = localStorage.getItem("adminToken")

        if (!token) {
            setError("Admin login required")
            setLoading(false)
            return
        }

        axios.get(
            "https://bookstore-backend-gz0l.onrender.com/api/admin/analytics",
            {
                headers: {
                    "x-access-token": token
                }
            }
        )
        .then(response => {

            const data = response.data || {}

            setAnalytics({
                totalRevenue: Number(data.totalRevenue) || 0,
                totalOrders: Number(data.totalOrders) || 0,
                booksSold: Number(data.booksSold) || 0,
                averageOrderValue:
                    Number(data.averageOrderValue) || 0,
                topBooks: Array.isArray(data.topBooks)
                    ? data.topBooks
                    : [],
                monthlySales: Array.isArray(data.monthlySales)
                    ? data.monthlySales
                    : []
            })

            setLoading(false)

        })
        .catch(error => {

            console.log(
                "Analytics error:",
                error
            )

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setError(
                    "Admin session expired. Please login again."
                )
            }
            else {
                setError(
                    "Unable to load analytics data"
                )
            }

            setLoading(false)

        })

    }, [])


    if (loading) {

        return (
            <div className="sales-analytics-page">

                <div className="sales-analytics-container">

                    <h2>
                        Loading Analytics...
                    </h2>

                </div>

            </div>
        )
    }


    return (
        <div className="sales-analytics-page">

            <div className="sales-analytics-container">

                <div className="sales-analytics-header">

                    <div>
                        <h1>
                            Sales Analytics
                        </h1>

                        <p>
                            Track your BookStore sales and revenue performance
                        </p>
                    </div>

                    <div className="analytics-badge">
                        📊 Analytics
                    </div>

                </div>


                {error && (
                    <div className="no-analytics-data">
                        {error}
                    </div>
                )}


                <div className="analytics-stats">

                    <div className="analytics-stat-card">

                        <div className="analytics-stat-icon">
                            💰
                        </div>

                        <h2>
                            ₹
                            {analytics.totalRevenue.toLocaleString()}
                        </h2>

                        <p>
                            Total Revenue
                        </p>

                        <span className="analytics-growth">
                            Live Data
                        </span>

                    </div>


                    <div className="analytics-stat-card">

                        <div className="analytics-stat-icon">
                            📦
                        </div>

                        <h2>
                            {analytics.totalOrders}
                        </h2>

                        <p>
                            Total Orders
                        </p>

                        <span className="analytics-growth">
                            Live Data
                        </span>

                    </div>


                    <div className="analytics-stat-card">

                        <div className="analytics-stat-icon">
                            📚
                        </div>

                        <h2>
                            {analytics.booksSold}
                        </h2>

                        <p>
                            Books Sold
                        </p>

                        <span className="analytics-growth">
                            Live Data
                        </span>

                    </div>


                    <div className="analytics-stat-card">

                        <div className="analytics-stat-icon">
                            🛒
                        </div>

                        <h2>
                            ₹
                            {analytics.averageOrderValue.toLocaleString()}
                        </h2>

                        <p>
                            Average Order Value
                        </p>

                        <span className="analytics-growth">
                            Live Data
                        </span>

                    </div>

                </div>


                <div className="analytics-content">


                    <div className="sales-chart-card">

                        <div className="analytics-card-header">

                            <div>

                                <h2>
                                    Sales Overview
                                </h2>

                                <p>
                                    Monthly revenue performance
                                </p>

                            </div>

                            <span>
                                Live Data
                            </span>

                        </div>


                        {analytics.monthlySales.length === 0 ? (

                            <div className="no-analytics-data">
                                No monthly sales data available
                            </div>

                        ) : (

                            <div className="sales-chart">

                                <div className="chart-y-axis">

                                    <span>
                                        ₹
                                        {Math.round(
                                            Math.max(
                                                ...analytics.monthlySales.map(
                                                    item =>
                                                        Number(item.sales) || 0
                                                )
                                            ) / 1000
                                        )}K
                                    </span>

                                    <span>
                                        ₹0
                                    </span>

                                </div>


                                <div className="chart-area">

                                    <div className="chart-grid">

                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>


                                    <div className="chart-bars">

                                        {analytics.monthlySales.map(
                                            (item, index) => {

                                                const sales =
                                                    Number(item.sales) || 0

                                                const maxSales =
                                                    Math.max(
                                                        ...analytics.monthlySales.map(
                                                            sale =>
                                                                Number(
                                                                    sale.sales
                                                                ) || 0
                                                        ),
                                                        1
                                                    )

                                                return (

                                                    <div
                                                        className="chart-column"
                                                        key={
                                                            item.month ||
                                                            index
                                                        }
                                                    >

                                                        <div
                                                            className="chart-bar"
                                                            style={{
                                                                height:
                                                                    `${(
                                                                        sales /
                                                                        maxSales
                                                                    ) * 100}%`
                                                            }}
                                                            title={
                                                                `₹${sales.toLocaleString()}`
                                                            }
                                                        >

                                                            <span>
                                                                ₹
                                                                {(
                                                                    sales /
                                                                    1000
                                                                ).toFixed(0)}
                                                                K
                                                            </span>

                                                        </div>

                                                        <p>
                                                            {item.month}
                                                        </p>

                                                    </div>

                                                )
                                            }
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    <div className="top-books-card">

                        <div className="analytics-card-header">

                            <div>

                                <h2>
                                    Top Selling Books
                                </h2>

                                <p>
                                    Best performing books
                                </p>

                            </div>

                        </div>


                        {analytics.topBooks.length === 0 ? (

                            <div className="no-analytics-data">
                                No book sales available
                            </div>

                        ) : (

                            analytics.topBooks.map(
                                (book, index) => (

                                    <div
                                        className="top-book-item"
                                        key={
                                            book.bookName ||
                                            index
                                        }
                                    >

                                        <div className="book-rank">
                                            {index + 1}
                                        </div>

                                        <div className="book-details">

                                            <h3>
                                                {book.bookName}
                                            </h3>

                                            <p>
                                                {book.author || "Unknown Author"}
                                            </p>

                                        </div>

                                        <strong>
                                            {Number(book.sold) || 0}
                                            {" "}sold
                                        </strong>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                <div className="order-performance-card">

                    <h2>
                        Order Performance
                    </h2>

                    <div className="order-performance-grid">

                        <div className="performance-item">

                            <span className="performance-dot placed"></span>

                            <div>

                                <h3>
                                    Orders
                                </h3>

                                <p>
                                    {analytics.totalOrders}
                                    {" "}Orders
                                </p>

                            </div>

                        </div>


                        <div className="performance-item">

                            <span className="performance-dot processing"></span>

                            <div>

                                <h3>
                                    Books Sold
                                </h3>

                                <p>
                                    {analytics.booksSold}
                                    {" "}Books
                                </p>

                            </div>

                        </div>


                        <div className="performance-item">

                            <span className="performance-dot shipped"></span>

                            <div>

                                <h3>
                                    Revenue
                                </h3>

                                <p>
                                    ₹
                                    {analytics.totalRevenue.toLocaleString()}
                                </p>

                            </div>

                        </div>


                        <div className="performance-item">

                            <span className="performance-dot delivered"></span>

                            <div>

                                <h3>
                                    Average Order
                                </h3>

                                <p>
                                    ₹
                                    {analytics.averageOrderValue.toLocaleString()}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export { SalesAnalytics }