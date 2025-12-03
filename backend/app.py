from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from flask_cors import CORS
import joblib
import numpy as np
from PIL import Image
import mysql.connector
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from ecommerce import register_ecom, db as ecom_db
import io

# --- Initialization & Configuration ---
load_dotenv()
API_KEY = os.environ.get("WEATHER_API_KEY")
MARKET_API_KEY = os.environ.get("MARKET_API_KEY")

# NOTE: Assuming these utility files exist in your project
# from utils import prepare_features, send_email_notification
# from db_utils import save_prediction
# from weather_api import get_weather 
# The implementations of prepare_features, send_email_notification, save_prediction, and get_weather 
# are assumed to be correct and available.

print("🔑 API Key:", API_KEY)


app = Flask(__name__)

# configure DB file (SQLite demo)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'data', 'ecom.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

ecom_db.init_app(app)
register_ecom(app)
CORS(app)
# IMPORTANT: Replace with a secure, random key in production
app.config["JWT_SECRET_KEY"] = "#1352007" 

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Fallback Crop Labels (MUST match your training data index order) ---
# This list is used if loading the labels from the .pkl files fails.
FALLBACK_CLASSES = np.array([
    "apple", "banana", "blackgram", "chickpea", "coconut", "coffee",
    "cotton", "grapes", "jute", "kidneybeans", "lentil", "maize",
    "mango", "mothbeans", "mungbean", "muskmelon", "orange", "papaya",
    "pigeonpeas", "pomegranate", "rice", "watermelon"
])


# --- Model Loading ---
try:
    # Load crop prediction model
    crop_model = joblib.load("xgb_crop_model.pkl")
    crop_encoder = joblib.load("crop_encoder.pkl")
    print("✓ Crop prediction model loaded successfully")
except Exception as e:
    print(f"✗ Error loading crop model: {str(e)}. Setting models to None.")
    crop_model = None
    crop_encoder = None

try:
    # Load CNN model 
    cnn_model = load_model("disease_cnn_model.h5")
    class_labels = joblib.load("labels.pkl")
    idx_to_label = {v: k for k, v in class_labels.items()}
    print("✅ Disease CNN model loaded successfully")
except Exception as e:
    print(f"✗ Error loading CNN model: {e}. Setting models to None.")
    cnn_model = None
    class_labels = {}
    idx_to_label = {}

# --- Database Connection ---
def get_db():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='omesh',  # Replace with your actual password
        database='agri_app'
    )

# ----------------------------------------------------
# --- E-commerce: Products ---
# ----------------------------------------------------
@app.route("/products", methods=["GET"])
def get_products():
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT p.*, u.username as seller_username FROM products p JOIN users u ON p.seller_id = u.id")
    products = c.fetchall()
    conn.close()
    return jsonify(products)

@app.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    data = request.get_json()
    name = data["name"]
    type_ = data["type"]
    price = data["price"]
    description = data.get("description", "")
    image = data.get("image", "")

    seller_username = get_jwt_identity()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = %s", (seller_username,))
    seller_row = c.fetchone()
    seller_id = seller_row[0] if seller_row else None
    if not seller_id:
        conn.close()
        return jsonify({"msg": "Seller not found"}), 404

    c.execute("INSERT INTO products (name, type, price, description, image, seller_id) VALUES (%s, %s, %s, %s, %s, %s)",
              (name, type_, price, description, image, seller_id))
    conn.commit()
    conn.close()
    return jsonify({"msg": "Product added"}), 201

@app.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    username = get_jwt_identity()
    conn = get_db()
    c = conn.cursor(dictionary=True)
    # Get user info
    c.execute("SELECT id, username FROM users WHERE username = %s", (username,))
    user_row = c.fetchone()
    if not user_row:
        conn.close()
        return jsonify({"msg": "Unauthorized"}), 401

    # Get product's seller_id
    c.execute("SELECT seller_id FROM products WHERE id = %s", (product_id,))
    prod_row = c.fetchone()
    if not prod_row:
        conn.close()
        return jsonify({"msg": "Product not found"}), 404

    # Check: user is seller or admin
    is_admin = user_row.get("username") == "admin"
    is_seller = user_row.get("id") == prod_row.get("seller_id")
    if not (is_admin or is_seller):
        conn.close()
        return jsonify({"msg": "You are not allowed to delete this product"}), 403

    # Delete related order_items first
    c.execute("DELETE FROM order_items WHERE product_id = %s", (product_id,))
    # Now delete product
    c.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    conn.close()
    return jsonify({"msg": "Product deleted"})

# ----------------------------------------------------
# --- E-commerce: Orders ---
# ----------------------------------------------------
@app.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    data = request.get_json()
    buyer_username = get_jwt_identity()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username = %s", (buyer_username,))
    buyer_row = c.fetchone()
    buyer_id = buyer_row[0] if buyer_row else None
    if not buyer_id:
        conn.close()
        return jsonify({"msg": "Buyer not found"}), 404
    
    items = data.get("items", [])
    if not items:
        conn.close()
        return jsonify({"msg": "Order must contain items"}), 400
        
    total = 0
    
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 0)
        if product_id and quantity > 0:
            c.execute("SELECT price FROM products WHERE id = %s", (product_id,))
            price_row = c.fetchone()
            if price_row:
                total += price_row[0] * quantity
                
    # Insert order
    c.execute("INSERT INTO orders (buyer_id, total, status) VALUES (%s, %s, %s)", (buyer_id, total, "Placed"))
    order_id = c.lastrowid
    
    # Insert order items
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 0)
        if product_id and quantity > 0:
            c.execute("SELECT price FROM products WHERE id = %s", (product_id,))
            price_row = c.fetchone()
            if price_row:
                c.execute("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                          (order_id, product_id, quantity, price_row[0]))

    conn.commit()
    conn.close()
    return jsonify({"msg": "Order placed", "order_id": order_id})

@app.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    username = get_jwt_identity()
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT id FROM users WHERE username = %s", (username,))
    user_row = c.fetchone()
    if not user_row:
        conn.close()
        return jsonify({"orders": []})
    user_id = user_row["id"]
    
    c.execute("SELECT * FROM orders WHERE buyer_id = %s", (user_id,))
    orders = c.fetchall()
    
    result = []
    for order in orders:
        c.execute("SELECT oi.id, oi.quantity, oi.price, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = %s", (order["id"],))
        items = c.fetchall()
        result.append({
            "id": order["id"],
            "status": order["status"],
            "total": order["total"],
            "items": items
        })
    conn.close()
    return jsonify({"orders": result})

# Add this after your existing /orders routes (around line 200)

@app.route("/api/checkout", methods=["POST"])
@jwt_required()
def checkout():
    """
    Place order with buyer shipping details.
    Payload: {
        "buyer_id": "username",
        "items": [{"product_id": "prod-id", "qty": 2}],
        "shipping": {
            "fullName": "John Doe",
            "email": "john@example.com",
            "phone": "9876543210",
            "address": "123 Main St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001"
        },
        "payment_method": "cod"
    }
    """
    data = request.get_json()
    buyer_username = get_jwt_identity()
    
    conn = get_db()
    c = conn.cursor(dictionary=True)
    
    # Get buyer id from username
    c.execute("SELECT id FROM users WHERE username = %s", (buyer_username,))
    buyer_row = c.fetchone()
    
    if not buyer_row:
        conn.close()
        return jsonify({"error": "Buyer not found"}), 404
    
    buyer_id = buyer_row["id"]
    
    items = data.get("items", [])
    shipping = data.get("shipping", {})
    payment_method = data.get("payment_method", "cod")
    
    if not items:
        conn.close()
        return jsonify({"error": "Order must contain items"}), 400
    
    if not shipping or not shipping.get("fullName"):
        conn.close()
        return jsonify({"error": "Shipping details required"}), 400
    
    # Calculate total
    total = 0
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("qty", 0)
        
        if product_id and quantity > 0:
            c.execute("SELECT price FROM products WHERE id = %s", (product_id,))
            price_row = c.fetchone()
            if price_row:
                total += price_row["price"] * quantity
    
    try:
        # Insert order with shipping details
        c.execute("""
            INSERT INTO orders 
            (buyer_id, total, status, shipping_name, shipping_email, shipping_phone, 
             shipping_address, shipping_city, shipping_state, shipping_pincode, payment_method, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            buyer_id, total, "Placed",
            shipping.get("fullName"),
            shipping.get("email"),
            shipping.get("phone"),
            shipping.get("address"),
            shipping.get("city"),
            shipping.get("state"),
            shipping.get("pincode"),
            payment_method
        ))
        
        order_id = c.lastrowid
        
        # Insert order items
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("qty", 0)
            
            if product_id and quantity > 0:
                c.execute("SELECT price FROM products WHERE id = %s", (product_id,))
                price_row = c.fetchone()
                if price_row:
                    c.execute("""
                        INSERT INTO order_items 
                        (order_id, product_id, quantity, price) 
                        VALUES (%s, %s, %s, %s)
                    """, (order_id, product_id, quantity, price_row["price"]))
        
        conn.commit()
        
        return jsonify({
            "success": True,
            "order": {
                "id": order_id,
                "total": total,
                "status": "Placed",
                "items_count": len(items),
                "shipping": {
                    "name": shipping.get("fullName"),
                    "address": shipping.get("address"),
                    "city": shipping.get("city"),
                    "state": shipping.get("state"),
                    "pincode": shipping.get("pincode")
                }
            }
        }), 201
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Checkout error: {str(e)}")
        return jsonify({"error": f"Checkout failed: {str(e)}"}), 500
    finally:
        conn.close()

@app.route("/api/orders", methods=["GET"])
@jwt_required()
def get_all_orders():
    """Get all orders for logged-in buyer"""
    username = get_jwt_identity()
    conn = get_db()
    c = conn.cursor(dictionary=True)
    
    # Get user id
    c.execute("SELECT id FROM users WHERE username = %s", (username,))
    user_row = c.fetchone()
    
    if not user_row:
        conn.close()
        return jsonify({"orders": []})
    
    user_id = user_row["id"]
    
    # Get all orders for this buyer
    c.execute("SELECT * FROM orders WHERE buyer_id = %s ORDER BY created_at DESC", (user_id,))
    orders = c.fetchall()
    
    result = []
    for order in orders:
        # Get items for this order
        c.execute("""
            SELECT oi.id, oi.quantity, oi.price, p.name as product_name, p.id as product_id
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = %s
        """, (order["id"],))
        items = c.fetchall()
        
        result.append({
            "id": order["id"],
            "status": order["status"],
            "total": order["total"],
            "created_at": str(order.get("created_at", "")),
            "shipping": {
                "name": order.get("shipping_name"),
                "email": order.get("shipping_email"),
                "phone": order.get("shipping_phone"),
                "address": order.get("shipping_address"),
                "city": order.get("shipping_city"),
                "state": order.get("shipping_state"),
                "pincode": order.get("shipping_pincode")
            },
            "payment_method": order.get("payment_method"),
            "items": items
        })
    
    conn.close()
    return jsonify({"orders": result}), 200

# ----------------------------------------------------
# --- News ---
# ----------------------------------------------------
@app.route("/news", methods=["GET"])
def get_news():
    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "country": "in",
        "q": "agriculture",
        "apiKey": "adb519ca1f444d55a6fd04db744865a9" 
    }
    try:
        resp = requests.get(url, params=params)
        data = resp.json()
        articles = [
            {
                "title": art.get("title"),
                "description": art.get("description"),
                "link": art.get("url")
            }
            for art in data.get("articles", [])
        ]
        return jsonify({"news": articles})
    except Exception as e:
        return jsonify({"news": [], "error": str(e)}), 500

# ----------------------------------------------------
# --- Crop Prediction (FIXED) ---
# ----------------------------------------------------
@app.route('/api/predict-crop', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        required = ["N","P","K","temperature","humidity","ph","rainfall"]
        for k in required:
            if k not in data:
                return jsonify({'error': f'Missing field: {k}'}), 400

        X = np.array([[ 
            float(data["N"]), float(data["P"]), float(data["K"]),
            float(data["temperature"]), float(data["humidity"]),
            float(data["ph"]), float(data["rainfall"])
        ]])

        if crop_model is None:
            return jsonify({'error': 'Crop model not loaded'}), 500

        preds = crop_model.predict(X)
        probs = crop_model.predict_proba(X)[0]

        # Use crop_encoder to decode indices to crop names
        if crop_encoder is not None:
            try:
                # preds[0] is numeric index; decode it to crop name
                best_crop = crop_encoder.inverse_transform([int(preds[0])])[0]
                print(f"✅ Decoded crop: {best_crop}")
            except Exception as e:
                print(f"⚠️ Encoder decode error: {e}")
                best_crop = f"Crop_{int(preds[0])}"
        else:
            best_crop = f"Crop_{int(preds[0])}"

        best_confidence = round(float(np.max(probs)) * 100, 2)
        
        # Top-5 recommendations
        top5 = []
        top_indices = np.argsort(probs)[-5:][::-1]
        for idx in top_indices:
            try:
                if crop_encoder is not None:
                    crop_name = crop_encoder.inverse_transform([int(idx)])[0]
                else:
                    crop_name = f"Crop_{int(idx)}"
                top5.append({
                    "crop": crop_name,
                    "confidence": round(float(probs[idx]) * 100, 2)
                })
            except Exception as e:
                print(f"⚠️ Error decoding crop {idx}: {e}")

        return jsonify({
            "success": True,
            "suggested_crop": best_crop,
            "confidence": best_confidence,
            "recommendations": top5,
            "water_needs": "Moderate",
            "pest_warning": "No immediate warning"
        }), 200

    except Exception as e:
        print(f"🔥 Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
# ----------------------------------------------------
# --- Disease Detection ---
# ----------------------------------------------------
@app.route("/detect-disease", methods=["POST"])
@jwt_required()
def detect_disease():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    try:
        # Load + preprocess image
        img = Image.open(file.stream).convert("RGB")
        img = img.resize((224, 224)) 
        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        if cnn_model is None or not idx_to_label:
             return jsonify({"error": "Disease model not loaded or labels missing"}), 500

        # Predict
        prediction = cnn_model.predict(img)
        predicted_class = np.argmax(prediction)
        
        result = idx_to_label.get(predicted_class, "Unknown Disease")

        return jsonify({
            "disease": result,
            "confidence": float(np.max(prediction))
        })

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500
        
# ----------------------------------------------------
# --- User Auth ---
# ----------------------------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data["username"]
    password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
        conn.commit()
        # Optional: Add code to send confirmation email here (using utils.send_email_notification)
        return jsonify({"msg": "User created"}), 201
    except mysql.connector.errors.IntegrityError:
        return jsonify({"msg": "Username already exists"}), 409
    finally:
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username = %s", (username,))
    row = c.fetchone()
    conn.close()
    if row and bcrypt.check_password_hash(row[0], password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Bad username or password"}), 401

# ----------------------------------------------------
# --- Crop Info ---
# ----------------------------------------------------
@app.route("/crop-info/<crop_name>", methods=["GET"])
def get_crop_info(crop_name):
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT name, details FROM crops WHERE name=%s", (crop_name,))
    result = c.fetchone()
    conn.close()
    if result:
        return jsonify({
            "name": result["name"],
            "details": result["details"]
        })
    else:
        return jsonify({"error": "Crop not found"}), 404

# ----------------------------------------------------
# --- Weather & Market ---
# ----------------------------------------------------
@app.route("/weather-forecast", methods=["GET"])
def weather_forecast():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City is required"}), 400
        
    try:
        # Step 1: Geocoding (City Name -> Lat/Lon)
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
        geo_res = requests.get(geo_url).json()

        if not geo_res or len(geo_res) == 0:
            return jsonify({"error": "City not found"}), 404

        lat = geo_res[0]["lat"]
        lon = geo_res[0]["lon"]

        # Step 2: 5-day / 3-hour forecast (16 entries = ~48 hours)
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
        forecast_res = requests.get(forecast_url).json()

        if "list" not in forecast_res:
            return jsonify({"error": "Forecast not available"}), 500

        forecast = [
            {
                "datetime": entry["dt_txt"],
                "temp": entry["main"]["temp"],
                "humidity": entry["main"]["humidity"],
                "weather": entry["weather"][0]["description"]
            }
            for entry in forecast_res["list"][:16] 
        ]

        return jsonify({"forecast": forecast})
    except Exception as e:
        print("🔥 Exception in /weather-forecast:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/weather", methods=["GET"])
def weather():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City is required"}), 400
    try:
        # NOTE: Assuming get_weather is correctly implemented in weather_api.py
        from weather_api import get_weather 
        weather = get_weather(city)
        return jsonify(weather)
    except ImportError:
        return jsonify({"error": "weather_api.py not found. Cannot fetch current weather."}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to fetch weather data: {str(e)}"}), 500

@app.route("/market-price", methods=["GET"])
def market_price():
    crop = request.args.get("crop", "Wheat")
    state = request.args.get("state", "Maharashtra")
    period = request.args.get("period", "week")
    
    # Calculate date filter
    today = datetime.today()
    if period == "week":
        start_date = (today - timedelta(days=7)).strftime("%d/%m/%Y")
    elif period == "month":
        start_date = (today - timedelta(days=30)).strftime("%d/%m/%Y")
    elif period == "year":
        start_date = (today - timedelta(days=365)).strftime("%d/%m/%Y")
    else:
        start_date = "01/01/2020" 

    url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={MARKET_API_KEY}&format=json&filters[commodity]={crop}&filters[state]={state}&limit=1000&offset=0"
    
    try:
        res = requests.get(url)
        res.raise_for_status() 
        data = res.json()
        
        prices = []
        filter_date = datetime.strptime(start_date, "%d/%m/%Y")
        
        for item in data.get("records", []):
            arrival_date_str = item.get("arrival_date")
            if arrival_date_str:
                try:
                    arrival_date = datetime.strptime(arrival_date_str, "%d/%m/%Y")

                    if arrival_date >= filter_date:
                        prices.append({
                            "market": item["market"],
                            "modal_price": float(item.get("modal_price", 0)),
                            "min_price": float(item.get("min_price", 0)),
                            "max_price": float(item.get("max_price", 0)),
                            "date": arrival_date_str
                        })
                except ValueError:
                    continue # Skip records with badly formatted dates
        
        # Sort by date
        prices.sort(key=lambda x: datetime.strptime(x["date"], "%d/%m/%Y"), reverse=True)
        return jsonify({"prices": prices})

    except requests.exceptions.RequestException as re:
        return jsonify({"error": f"API request failed: {str(re)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Internal error fetching market price: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)