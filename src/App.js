import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import {
    Navbar,
    Toast,
    Home,
    Shop,
    ProductPage,
    Login,
    Signup,
    Wishlist,
    Cart,
    Orders
} from "./index"

import { Profile } from "./Pages/Profile/Profile"
import { Admin } from "./Pages/Admin/Admin"
import { AdminLogin } from "./Pages/Admin/AdminLogin"
import { AdminOrders } from "./Pages/Admin/AdminOrders"
import { AdminBooks } from "./Pages/Admin/AdminBooks"
import { AdminUsers } from "./Pages/Admin/AdminUsers"
import { SalesAnalytics } from "./Pages/Admin/SalesAnalytics"
import { AdminProtectedRoute } from "./Pages/Admin/AdminProtectedRoute"

function App() {
    return (
        <Router>
            <div className="App">

                <Navbar />

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/shop"
                        element={<Shop />}
                    />

                    <Route
                        path="/shop/:id"
                        element={<ProductPage />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/signup"
                        element={<Signup />}
                    />

                    <Route
                        path="/wishlist"
                        element={<Wishlist />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/orders"
                        element={<Orders />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/admin/login"
                        element={<AdminLogin />}
                    />

                    <Route element={<AdminProtectedRoute />}>

                        <Route
                            path="/admin"
                            element={<Admin />}
                        />

                        <Route
                            path="/admin/orders"
                            element={<AdminOrders />}
                        />

                        <Route
                            path="/admin/books"
                            element={<AdminBooks />}
                        />

                        <Route
                            path="/admin/users"
                            element={<AdminUsers />}
                        />

                        <Route
                            path="/admin/analytics"
                            element={<SalesAnalytics />}
                        />

                    </Route>

                </Routes>

                <Toast position="bottom-right" />

            </div>
        </Router>
    )
}

export default App