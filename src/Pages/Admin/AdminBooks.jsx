import React, { useEffect, useState } from "react"
import axios from "axios"
import "./AdminBooks.css"

function AdminBooks() {
    const [books, setBooks] = useState([])
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingBook, setEditingBook] = useState(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        name: "",
        author: "",
        price: "",
        category: "",
        stock: ""
    })

    useEffect(() => {
        loadBooks()
    }, [])

    function getToken() {
        return localStorage.getItem("adminToken")
    }

    function loadBooks() {
        const adminToken = getToken()

        if (!adminToken) {
            window.location.href = "/admin/login"
            return
        }

        setLoading(true)

        axios.get(
            "http://localhost:5000/api/admin/books",
            {
                headers: {
                    "x-access-token": adminToken
                }
            }
        )
        .then(response => {
            if (response.data.status === "ok") {
                setBooks(response.data.books)
            }
        })
        .catch(error => {
            console.log(error)

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("adminToken")
                window.location.href = "/admin/login"
                return
            }

            setMessage(
                error.response?.data?.message ||
                "Unable to load books"
            )
        })
        .finally(() => {
            setLoading(false)
        })
    }

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        })
    }

    function openAddForm() {
        setEditingBook(null)

        setForm({
            name: "",
            author: "",
            price: "",
            category: "",
            stock: ""
        })

        setMessage("")
        setShowForm(true)
    }

    function openEditForm(book) {
        setEditingBook(book)

        setForm({
            name: book.name || "",
            author: book.author || "",
            price: book.price ?? "",
            category: book.category || "",
            stock: book.stock ?? ""
        })

        setMessage("")
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditingBook(null)

        setForm({
            name: "",
            author: "",
            price: "",
            category: "",
            stock: ""
        })
    }

    function saveBook(event) {
        event.preventDefault()

        if (
            !form.name.trim() ||
            !form.author.trim() ||
            form.price === "" ||
            !form.category.trim() ||
            form.stock === ""
        ) {
            setMessage("Please fill all fields")
            return
        }

        const price = Number(form.price)
        const stock = Number(form.stock)

        if (price < 0 || stock < 0) {
            setMessage("Price and stock cannot be negative")
            return
        }

        const adminToken = getToken()

        if (!adminToken) {
            window.location.href = "/admin/login"
            return
        }

        const bookData = {
            name: form.name.trim(),
            author: form.author.trim(),
            price,
            category: form.category.trim(),
            stock
        }

        setSaving(true)
        setMessage("")

        if (editingBook) {
            axios.patch(
                `http://localhost:5000/api/admin/books/${editingBook._id}`,
                bookData,
                {
                    headers: {
                        "x-access-token": adminToken
                    }
                }
            )
            .then(response => {
                if (response.data.status === "ok") {
                    setMessage("Book updated successfully")
                    closeForm()
                    loadBooks()
                }
            })
            .catch(error => {
                console.log(error)

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.removeItem("adminToken")
                    window.location.href = "/admin/login"
                    return
                }

                setMessage(
                    error.response?.data?.message ||
                    "Unable to update book"
                )
            })
            .finally(() => {
                setSaving(false)
            })
        }
        else {
            axios.post(
                "http://localhost:5000/api/admin/books",
                bookData,
                {
                    headers: {
                        "x-access-token": adminToken
                    }
                }
            )
            .then(response => {
                if (response.data.status === "ok") {
                    setMessage("Book added successfully")
                    closeForm()
                    loadBooks()
                }
            })
            .catch(error => {
                console.log(error)

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.removeItem("adminToken")
                    window.location.href = "/admin/login"
                    return
                }

                setMessage(
                    error.response?.data?.message ||
                    "Unable to add book"
                )
            })
            .finally(() => {
                setSaving(false)
            })
        }
    }

    function deleteBook(id) {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this book?"
        )

        if (!confirmDelete) {
            return
        }

        const adminToken = getToken()

        if (!adminToken) {
            window.location.href = "/admin/login"
            return
        }

        axios.delete(
            `http://localhost:5000/api/admin/books/${id}`,
            {
                headers: {
                    "x-access-token": adminToken
                }
            }
        )
        .then(response => {
            if (response.data.status === "ok") {
                setMessage("Book deleted successfully")
                loadBooks()
            }
        })
        .catch(error => {
            console.log(error)

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("adminToken")
                window.location.href = "/admin/login"
                return
            }

            setMessage(
                error.response?.data?.message ||
                "Unable to delete book"
            )
        })
    }

    const filteredBooks = books.filter(book => {
        const text =
            `${book.name} ${book.author} ${book.category}`
                .toLowerCase()

        return text.includes(search.toLowerCase())
    })

    if (loading) {
        return (
            <div className="admin-books-page">
                <div className="admin-books-container">
                    <div className="admin-books-header">
                        <h1>Loading Books...</h1>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-books-page">
            <div className="admin-books-container">

                <div className="admin-books-header">

                    <div>
                        <h1>Book Management</h1>

                        <p>
                            Add, edit and manage books in your Bookztron store
                        </p>
                    </div>

                    <button
                        className="admin-primary-btn"
                        onClick={openAddForm}
                    >
                        + Add New Book
                    </button>

                </div>

                <div className="admin-books-search">

                    <input
                        type="text"
                        placeholder="Search books, authors or categories..."
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                    />

                    <span>
                        {filteredBooks.length} Books
                    </span>

                </div>

                {message && (
                    <div className="admin-books-message">
                        {message}
                    </div>
                )}

                {showForm && (
                    <div className="admin-book-form-card">

                        <h2>
                            {editingBook
                                ? "Edit Book"
                                : "Add New Book"
                            }
                        </h2>

                        <form onSubmit={saveBook}>

                            <input
                                type="text"
                                name="name"
                                placeholder="Book Name"
                                value={form.name}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="author"
                                placeholder="Author"
                                value={form.author}
                                onChange={handleChange}
                            />

                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                min="0"
                                value={form.price}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={form.category}
                                onChange={handleChange}
                            />

                            <input
                                type="number"
                                name="stock"
                                placeholder="Stock"
                                min="0"
                                value={form.stock}
                                onChange={handleChange}
                            />

                            <div className="admin-book-form-actions">

                                <button
                                    type="submit"
                                    className="admin-primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingBook
                                            ? "Update Book"
                                            : "Add Book"
                                    }
                                </button>

                                <button
                                    type="button"
                                    className="admin-secondary-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {filteredBooks.length === 0 ? (

                    <div className="admin-no-books">

                        <div className="admin-no-books-icon">
                            📚
                        </div>

                        <h2>
                            No Books Found
                        </h2>

                        <p>
                            No books match your search.
                        </p>

                    </div>

                ) : (

                    <div className="admin-books-grid">

                        {filteredBooks.map(book => (

                            <div
                                className="admin-book-card"
                                key={book._id}
                            >

                                <div className="admin-book-icon">
                                    📖
                                </div>

                                <h2>
                                    {book.name}
                                </h2>

                                <p className="admin-book-author">
                                    By {book.author}
                                </p>

                                <span className="admin-book-category">
                                    {book.category}
                                </span>

                                <div className="admin-book-info">

                                    <div>
                                        <span>
                                            Price
                                        </span>

                                        <strong>
                                            ₹{book.price}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Stock
                                        </span>

                                        <strong>
                                            {book.stock}
                                        </strong>
                                    </div>

                                </div>

                                <div className="admin-book-actions">

                                    <button
                                        className="admin-secondary-btn"
                                        onClick={() =>
                                            openEditForm(book)
                                        }
                                    >
                                        ✏️ Edit
                                    </button>

                                    <button
                                        className="admin-primary-btn"
                                        onClick={() =>
                                            deleteBook(book._id)
                                        }
                                    >
                                        🗑️ Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>
        </div>
    )
}

export { AdminBooks }