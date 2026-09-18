const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: String,
            required: true
        },

        bookName: {
            type: String,
            required: true
        },

        author: {
            type: String,
            default: ""
        },

        imgSrc: {
            type: String,
            default: ""
        },

        imgAlt: {
            type: String,
            default: ""
        },

        badgeText: {
            type: String,
            default: ""
        },

        quantity: {
            type: Number,
            required: true,
            default: 1
        },

        price: {
            type: Number,
            required: true,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "Order Placed",
                "Processing",
                "Shipped",
                "Delivered"
            ],
            default: "Order Placed"
        }
    },
    {
        timestamps: true
    }
)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order