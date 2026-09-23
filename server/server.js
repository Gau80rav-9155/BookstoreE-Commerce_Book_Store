const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const path = require("path")

const Order = require("./models/Order")
const Review = require("./models/Review")
const Book = require("./models/Book")
const User = require("./models/User")

require("dotenv").config({
    path: path.join(__dirname, ".env")
})

const app = express()

app.use(cors())
app.use(express.json())


/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully")
    })
    .catch(error => {
        console.log("MongoDB connection failed")
        console.log(error.message)
    })


/* =========================
   USER AUTH
========================= */

function verifyUser(req, res, next) {

    try {

        const token =
            req.headers["x-access-token"]

        if (!token) {

            return res.status(401).json({
                status: "error",
                message: "Login required"
            })

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            )

        req.user = decoded

        next()

    }
    catch (error) {

        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token"
        })

    }

}


/* =========================
   ADMIN AUTH
========================= */

/* =========================
   ADMIN AUTH
========================= */

function verifyAdmin(req, res, next) {

    try {

        const token =
            req.headers["x-access-token"]

        if (!token) {

            return res.status(401).json({
                status: "error",
                message: "Admin login required"
            })

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            )

        if (decoded.role !== "admin") {

            return res.status(403).json({
                status: "error",
                message: "Admin access denied"
            })

        }

        req.admin = decoded

        next()

    }
    catch (error) {

        return res.status(401).json({
            status: "error",
            message: "Invalid or expired admin token"
        })

    }

}


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

    res.json({
        status: "ok",
        message: "BookStore backend is running"
    })

})


/* =========================
   SIGNUP
========================= */

app.post("/api/signup", async (req, res) => {

    try {

        const {
            newUserName,
            newUserEmail,
            newUserPassword
        } = req.body


        if (
            !newUserName ||
            !newUserEmail ||
            !newUserPassword
        ) {

            return res.status(400).json({
                status: "error",
                message: "All fields are required"
            })

        }


        const email =
            newUserEmail
                .toLowerCase()
                .trim()


        const existingUser =
            await User.findOne({
                userEmail: email
            })


        if (existingUser) {

            return res.status(400).json({
                status: "error",
                message:
                    "User with this email already exists"
            })

        }


        const hashedPassword =
            await bcrypt.hash(
                newUserPassword,
                10
            )


        const newUser =
            await User.create({

                userName:
                    newUserName.trim(),

                userEmail:
                    email,

                password:
                    hashedPassword,

                role:
                    "user",

                wishlist:
                    [],

                cart:
                    [],

                orders:
                    []

            })


        res.status(201).json({

            status: "ok",

            message:
                "User created successfully",

            user: {

                _id:
                    newUser._id,

                userName:
                    newUser.userName,

                userEmail:
                    newUser.userEmail,

                role:
                    newUser.role

            }

        })

    }
    catch (error) {

        console.log(error)

        res.status(500).json({

            status: "error",

            message:
                error.message

        })

    }

})


/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {

    try {

        const {
            userEmail,
            userPassword
        } = req.body


        if (
            !userEmail ||
            !userPassword
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Email and password are required"

            })

        }


        const email =
            userEmail
                .toLowerCase()
                .trim()


        const user =
            await User.findOne({
                userEmail: email
            })


        if (!user) {

            return res.status(401).json({

                status: "error",

                message:
                    "Invalid email or password"

            })

        }


        let passwordMatch = false


        try {

            passwordMatch =
                await bcrypt.compare(
                    userPassword,
                    user.password
                )

        }
        catch (error) {

            passwordMatch = false

        }


        if (
            !passwordMatch &&
            user.password === userPassword
        ) {

            passwordMatch = true

            user.password =
                await bcrypt.hash(
                    userPassword,
                    10
                )

            await user.save()

        }


        if (!passwordMatch) {

            return res.status(401).json({

                status: "error",

                message:
                    "Invalid email or password"

            })

        }


        const token =
            jwt.sign(

                {

                    userId:
                        user._id.toString(),

                    userEmail:
                        user.userEmail,

                    userName:
                        user.userName,

                    role:
                        user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            )


        res.json({

            status: "ok",

            message:
                "Login successful",

            token,

            user: {

                _id:
                    user._id,

                userName:
                    user.userName,

                userEmail:
                    user.userEmail,

                wishlist:
                    user.wishlist || [],

                cart:
                    user.cart || [],

                orders:
                    user.orders || [],

                role:
                    user.role

            }

        })

    }
    catch (error) {

        console.log(error)

        res.status(500).json({

            status: "error",

            message:
                error.message

        })

    }

})


/* =========================
   CURRENT USER
========================= */

app.get(
    "/api/user",
    verifyUser,
    async (req, res) => {

        try {

            const user =
                await User
                    .findById(
                        req.user.userId
                    )
                    .select("-password")


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            res.json({

                status: "ok",

                user

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADD CART
========================= */

app.patch(
    "/api/cart",
    verifyUser,
    async (req, res) => {

        try {

            const {
                productdetails
            } = req.body


            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            const productId =
                String(
                    productdetails._id
                )


            const existingIndex =
                (user.cart || [])
                    .findIndex(
                        item =>
                            String(item._id) ===
                            productId
                    )


            if (existingIndex !== -1) {

                user.cart[
                    existingIndex
                ].quantity =
                    (
                        Number(
                            user.cart[
                                existingIndex
                            ].quantity
                        ) || 1
                    ) + 1

            }
            else {

                user.cart.push({

                    ...productdetails,

                    quantity: 1

                })

            }


            user.markModified("cart")

            await user.save()


            res.json({

                status: "ok",

                user: {

                    cart:
                        user.cart || []

                }

            })

        }
        catch (error) {

            console.log(
                "Cart Error:",
                error
            )

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   UPDATE CART QUANTITY
========================= */

app.patch(
    "/api/cart/quantity",
    verifyUser,
    async (req, res) => {

        try {

            const {
                productId,
                quantity
            } = req.body


            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            const item =
                (user.cart || [])
                    .find(
                        product =>
                            String(
                                product._id
                            ) ===
                            String(
                                productId
                            )
                    )


            if (!item) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "Cart item not found"

                })

            }


            const newQuantity =
                Number(quantity)


            if (
                !Number.isInteger(
                    newQuantity
                ) ||
                newQuantity < 1
            ) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Invalid quantity"

                })

            }


            item.quantity =
                newQuantity


            user.markModified("cart")

            await user.save()


            res.json({

                status: "ok",

                user: {

                    cart:
                        user.cart || []

                }

            })

        }
        catch (error) {

            console.log(error)

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   REMOVE CART
========================= */

app.patch(
    "/api/cart/remove",
    verifyUser,
    async (req, res) => {

        try {

            const {
                productId,
                bookName
            } = req.body


            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            user.cart =
                (user.cart || [])
                    .filter(item => {

                        const sameId =
                            productId &&
                            String(item._id) ===
                            String(productId)


                        const sameBook =
                            bookName &&
                            String(
                                item.bookName
                            )
                                .trim()
                                .toLowerCase() ===
                            String(
                                bookName
                            )
                                .trim()
                                .toLowerCase()


                        return !sameId && !sameBook

                    })


            user.markModified("cart")

            await user.save()


            res.json({

                status: "ok",

                message:
                    "Item removed from cart",

                user: {

                    cart:
                        user.cart || []

                }

            })

        }
        catch (error) {

            console.log(error)

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   EMPTY CART
========================= */

app.patch(
    "/api/cart/empty/all",
    verifyUser,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            user.cart = []

            user.markModified("cart")

            await user.save()


            res.json({

                status: "ok",

                user: {

                    cart: []

                }

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADD WISHLIST
========================= */

app.patch(
    "/api/wishlist",
    verifyUser,
    async (req, res) => {

        try {

            const {
                productdetails
            } = req.body


            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            const productId =
                String(
                    productdetails._id
                )


            const exists =
                (user.wishlist || [])
                    .some(
                        item =>
                            String(
                                item._id
                            ) ===
                            productId
                    )


            if (!exists) {

                user.wishlist.push(
                    productdetails
                )

                user.markModified(
                    "wishlist"
                )

                await user.save()

            }


            res.json({

                status: "ok",

                user: {

                    wishlist:
                        user.wishlist || []

                }

            })

        }
        catch (error) {

            console.log(error)

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   REMOVE WISHLIST
========================= */

app.patch(
    "/api/wishlist/remove",
    verifyUser,
    async (req, res) => {

        try {

            const {
                productId,
                bookName
            } = req.body


            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            user.wishlist =
                (user.wishlist || [])
                    .filter(item => {

                        const sameId =
                            productId &&
                            String(item._id) ===
                            String(productId)


                        const sameBook =
                            bookName &&
                            String(
                                item.bookName
                            )
                                .trim()
                                .toLowerCase() ===
                            String(
                                bookName
                            )
                                .trim()
                                .toLowerCase()


                        return !sameId && !sameBook

                    })


            user.markModified(
                "wishlist"
            )


            await user.save()


            res.json({

                status: "ok",

                message:
                    "Item removed from wishlist",

                user: {

                    wishlist:
                        user.wishlist || []

                }

            })

        }
        catch (error) {

            console.log(
                "Wishlist Remove Error:",
                error
            )

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   OLD DELETE WISHLIST ROUTE
========================= */

app.delete(
    "/api/wishlist/:productId",
    verifyUser,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                )


            if (!user) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "User not found"

                })

            }


            user.wishlist =
                (user.wishlist || [])
                    .filter(
                        item =>
                            String(
                                item._id
                            ) !==
                            String(
                                req.params.productId
                            )
                    )


            user.markModified(
                "wishlist"
            )


            await user.save()


            res.json({

                status: "ok",

                user: {

                    wishlist:
                        user.wishlist || []

                }

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN LOGIN
========================= */

app.post(
    "/api/admin/login",
    (req, res) => {

        try {

            const {
                email,
                password
            } = req.body


            if (
                email !==
                    process.env.ADMIN_EMAIL ||
                password !==
                    process.env.ADMIN_PASSWORD
            ) {

                return res.status(401).json({

                    status: "error",

                    message:
                        "Invalid admin credentials"

                })

            }


            const token =
                jwt.sign(

                    {
                        email,

                        role:
                            "admin"

                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            "1d"
                    }

                )


            res.json({

                status: "ok",

                token

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN VERIFY
========================= */

app.get(
    "/api/admin/verify",
    verifyAdmin,
    (req, res) => {

        res.json({

            status: "ok",

            admin:
                req.admin

        })

    }
)


/* =========================
   ADMIN STATS
========================= */

app.get(
    "/api/admin/stats",
    verifyAdmin,
    async (req, res) => {

        try {

            const totalBooks =
                await Book.countDocuments()


            const totalUsers =
                await User.countDocuments()


            const totalOrders =
                await Order.countDocuments()


            const orders =
                await Order.find()


            const totalRevenue =
                orders.reduce(

                    (total, order) =>

                        total +
                        (
                            Number(order.price) *
                            Number(order.quantity)
                        ),

                    0

                )


            res.json({

                status: "ok",

                totalBooks,

                totalUsers,

                totalOrders,

                totalRevenue

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN USERS
========================= */

app.get(
    "/api/admin/users",
    verifyAdmin,
    async (req, res) => {

        try {

            const users =
                await User
                    .find()
                    .select("-password")
                    .sort({
                        createdAt: -1
                    })


            const formattedUsers =
                users.map(user => ({

                    _id:
                        user._id,

                    userName:
                        user.userName ||
                        "User",

                    userEmail:
                        user.userEmail ||
                        "Email not available",

                    role:
                        user.role ||
                        "user",

                    cart:
                        user.cart || [],

                    orders:
                        user.orders || [],

                    wishlist:
                        user.wishlist || [],

                    createdAt:
                        user.createdAt

                }))


            res.json({

                status: "ok",

                users:
                    formattedUsers

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN ORDERS
========================= */

app.get(
    "/api/admin/orders",
    verifyAdmin,
    async (req, res) => {

        try {

            const orders =
                await Order
                    .find()
                    .sort({
                        createdAt: -1
                    })


            res.json({

                status: "ok",

                orders

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ORDER STATUS
========================= */

app.patch(
    "/api/admin/orders/:id/status",
    verifyAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body


            const allowedStatuses = [

                "Order Placed",

                "Processing",

                "Shipped",

                "Delivered"

            ]


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Invalid order status"

                })

            }


            const order =
                await Order.findByIdAndUpdate(

                    req.params.id,

                    {
                        status
                    },

                    {
                        new: true
                    }

                )


            if (!order) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "Order not found"

                })

            }


            res.json({

                status: "ok",

                order

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN BOOKS GET
========================= */

app.get(
    "/api/admin/books",
    verifyAdmin,
    async (req, res) => {

        try {

            const books =
                await Book
                    .find()
                    .sort({
                        createdAt: -1
                    })


            res.json({

                status: "ok",

                books

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN ADD BOOK
========================= */

app.post(
    "/api/admin/books",
    verifyAdmin,
    async (req, res) => {

        try {

            const {
                name,
                author,
                price,
                category,
                stock
            } = req.body


            const book =
                await Book.create({

                    name,

                    author,

                    price:
                        Number(price),

                    category,

                    stock:
                        Number(stock)

                })


            res.status(201).json({

                status: "ok",

                book

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN UPDATE BOOK
========================= */

app.patch(
    "/api/admin/books/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            const {
                name,
                author,
                price,
                category,
                stock
            } = req.body


            const book =
                await Book.findByIdAndUpdate(

                    req.params.id,

                    {

                        name,

                        author,

                        price:
                            Number(price),

                        category,

                        stock:
                            Number(stock)

                    },

                    {
                        new: true,
                        runValidators: true
                    }

                )


            if (!book) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "Book not found"

                })

            }


            res.json({

                status: "ok",

                book

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ADMIN DELETE BOOK
========================= */

app.delete(
    "/api/admin/books/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            const book =
                await Book.findByIdAndDelete(
                    req.params.id
                )


            if (!book) {

                return res.status(404).json({

                    status: "error",

                    message:
                        "Book not found"

                })

            }


            res.json({

                status: "ok",

                message:
                    "Book deleted successfully"

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   CREATE ORDER
========================= */

app.post(
    "/api/orders",
    verifyUser,
    async (req, res) => {

        try {

            const {
                orderId,
                bookName,
                author,
                imgSrc,
                imgAlt,
                badgeText,
                quantity,
                price
            } = req.body


            const userId =
                req.user.userId


            const order =
                await Order.create({

                    orderId,

                    userId,

                    bookName,

                    author:
                        author || "",

                    imgSrc:
                        imgSrc || "",

                    imgAlt:
                        imgAlt || bookName || "Book",

                    badgeText:
                        badgeText || "",

                    quantity:
                        Number(quantity) || 1,

                    price:
                        Number(price) || 0,

                    status:
                        "Order Placed"

                })


            await User.findByIdAndUpdate(

                userId,

                {
                    $push: {

                        orders:
                            order.toObject()

                    }
                }

            )


            res.status(201).json({

                status: "ok",

                order

            })

        }
        catch (error) {

            console.log(error)

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)

/* =========================
   USER ORDERS
========================= */

app.get(
    "/api/user/orders",
    verifyUser,
    async (req, res) => {

        try {

            const orders =
                await Order
                    .find({
                        userId:
                            req.user.userId
                    })
                    .sort({
                        createdAt: -1
                    })


            res.json({

                status: "ok",

                orders

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   REVIEWS
========================= */

app.post(
    "/api/reviews",
    async (req, res) => {

        try {

            const {
                productId,
                userId,
                userName,
                rating,
                review
            } = req.body


            const newReview =
                await Review.create({

                    productId,

                    userId,

                    userName,

                    rating:
                        Number(rating),

                    review

                })


            res.status(201).json({

                status: "ok",

                review:
                    newReview

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


app.get(
    "/api/reviews/:productId",
    async (req, res) => {

        try {

            const reviews =
                await Review
                    .find({
                        productId:
                            req.params.productId
                    })
                    .sort({
                        createdAt: -1
                    })


            res.json({

                status: "ok",

                reviews

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


/* =========================
   ANALYTICS
========================= */

app.get(
    "/api/analytics",
    async (req, res) => {

        try {

            const orders =
                await Order.find()


            const totalOrders =
                orders.length


            const booksSold =
                orders.reduce(

                    (total, order) =>

                        total +
                        Number(
                            order.quantity
                        ),

                    0

                )


            const totalRevenue =
                orders.reduce(

                    (total, order) =>

                        total +
                        (
                            Number(
                                order.price
                            ) *
                            Number(
                                order.quantity
                            )
                        ),

                    0

                )


            const averageOrderValue =
                totalOrders > 0

                    ? Math.round(
                        totalRevenue /
                        totalOrders
                    )

                    : 0


            const bookMap = {}


            orders.forEach(order => {

                if (!bookMap[order.bookName]) {

                    bookMap[
                        order.bookName
                    ] = {

                        bookName:
                            order.bookName,

                        author:
                            order.author,

                        sold: 0

                    }

                }


                bookMap[
                    order.bookName
                ].sold +=
                    Number(
                        order.quantity
                    )

            })


            const topBooks =
                Object.values(
                    bookMap
                )
                .sort(
                    (a, b) =>
                        b.sold - a.sold
                )
                .slice(0, 5)


            res.json({

                status: "ok",

                totalRevenue,

                totalOrders,

                booksSold,

                averageOrderValue,

                topBooks

            })

        }
        catch (error) {

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)


app.get(
    "/api/admin/analytics",
    verifyAdmin,
    async (req, res) => {

        try {

            const orders = await Order.find()

            const totalOrders = orders.length

            const booksSold = orders.reduce(
                (total, order) =>
                    total + (Number(order.quantity) || 0),
                0
            )

            const totalRevenue = orders.reduce(
                (total, order) =>
                    total +
                    (
                        (Number(order.price) || 0) *
                        (Number(order.quantity) || 0)
                    ),
                0
            )

            const averageOrderValue =
                totalOrders > 0
                    ? Math.round(
                        totalRevenue / totalOrders
                    )
                    : 0


            const bookMap = {}

            orders.forEach(order => {

                const bookName =
                    order.bookName || "Unknown Book"

                if (!bookMap[bookName]) {

                    bookMap[bookName] = {
                        bookName: bookName,
                        author:
                            order.author ||
                            "Unknown Author",
                        sold: 0
                    }

                }

                bookMap[bookName].sold +=
                    Number(order.quantity) || 0

            })


            const topBooks =
                Object.values(bookMap)
                    .sort(
                        (a, b) =>
                            b.sold - a.sold
                    )
                    .slice(0, 5)


            const monthMap = {}

            orders.forEach(order => {

                const date =
                    new Date(order.createdAt)

                if (isNaN(date.getTime())) {
                    return
                }

                const year =
                    date.getFullYear()

                const monthNumber =
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0")

                const monthName =
                    date.toLocaleString(
                        "en-US",
                        {
                            month: "short"
                        }
                    )

                const key =
                    `${year}-${monthNumber}`

                if (!monthMap[key]) {

                    monthMap[key] = {
                        month:
                            `${monthName} ${year}`,
                        sales: 0
                    }

                }

                monthMap[key].sales +=
                    (
                        (Number(order.price) || 0) *
                        (Number(order.quantity) || 0)
                    )

            })


            const monthlySales =
                Object.keys(monthMap)
                    .sort()
                    .map(key => ({
                        month:
                            monthMap[key].month,
                        sales:
                            monthMap[key].sales
                    }))


            res.json({

                status: "ok",

                totalRevenue:

                    totalRevenue,

                totalOrders:

                    totalOrders,

                booksSold:

                    booksSold,

                averageOrderValue:

                    averageOrderValue,

                topBooks:

                    topBooks,

                monthlySales:

                    monthlySales

            })

        }
        catch (error) {

            console.log(
                "Admin Analytics Error:",
                error
            )

            res.status(500).json({

                status: "error",

                message:
                    error.message

            })

        }

    }
)



/* =========================
   START SERVER
========================= */

const PORT = 5000

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        )

    }
)