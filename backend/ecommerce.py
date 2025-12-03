from flask import Blueprint, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os, io, uuid, json

bp = Blueprint("ecom", __name__, url_prefix="/api")

# ⚠️ IMPORTANT: Create db instance WITHOUT calling init_app here
# app.py will handle db.init_app(app)
db = SQLAlchemy()

# Models
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=True)
    children = db.relationship("Category")

class Product(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False, default=0.0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=True)
    category = db.relationship("Category")
    variants = db.Column(db.Text, default="{}")
    images = db.Column(db.Text, default="[]")
    seller_id = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(36), db.ForeignKey("product.id"))
    rating = db.Column(db.Integer, default=5)
    title = db.Column(db.String(255))
    body = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    buyer_id = db.Column(db.String(120), nullable=False)
    total = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), default="Ordered")
    payment_method = db.Column(db.String(50), default="cod")
    shipping = db.Column(db.Text, default="{}")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(36), db.ForeignKey("order.id"))
    product_id = db.Column(db.String(36))
    title = db.Column(db.String(255))
    qty = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, default=0.0)

def init_db(app):
    """Initialize database tables and seed sample data"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        # Seed sample data if no products exist
        if db.session.query(Product).count() == 0:
            cat = Category(name="Fertilizers")
            db.session.add(cat)
            db.session.commit()
            p1 = Product(
                id="prod-demo-urea",
                title="Urea Fertilizer 50kg",
                description="Nitrogen rich urea for higher yields.",
                price=2200.0,
                stock=120,
                category_id=cat.id,
                variants=json.dumps({"pack": ["50kg", "25kg"]})
            )
            p2 = Product(
                id="prod-demo-compost",
                title="Organic Compost 25kg",
                description="Improve soil structure and organic matter.",
                price=600.0,
                stock=60,
                category_id=cat.id,
                variants=json.dumps({"pack": ["25kg"]})
            )
            db.session.add_all([p1, p2])
            db.session.commit()

# Routes
@bp.route("/products", methods=["GET"])
def list_products():
    q = request.args.get("q", "").strip()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    
    query = db.session.query(Product)
    if q:
        query = query.filter(Product.title.ilike(f"%{q}%"))
    
    total = query.count()
    prods = query.order_by(Product.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    
    def serialize(p):
        return {
            "id": p.id, "title": p.title, "description": p.description,
            "price": p.price, "stock": p.stock, "variants": json.loads(p.variants or "{}"),
            "images": json.loads(p.images or "[]"), "category_id": p.category_id
        }
    return jsonify({"products": [serialize(p) for p in prods], "total": total}), 200

@bp.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    p = db.session.query(Product).get(product_id)
    if not p:
        return jsonify({"error": "Not found"}), 404
    reviews = db.session.query(Review).filter_by(product_id=product_id).all()
    fbt = db.session.query(Product).filter(Product.category_id==p.category_id, Product.id!=p.id).limit(3).all()
    return jsonify({
        "id": p.id, "title": p.title, "description": p.description, "price": p.price, "stock": p.stock,
        "variants": json.loads(p.variants or "{}"), "images": json.loads(p.images or "[]"),
        "reviews": [{"rating": r.rating, "title": r.title, "body": r.body} for r in reviews],
        "frequently_bought_together": [{"id": x.id, "title": x.title, "price": x.price} for x in fbt]
    }), 200

@bp.route("/search-autosuggest", methods=["GET"])
def autosuggest():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"suggestions": []})
    items = db.session.query(Product).filter(Product.title.ilike(f"{q}%")).limit(10).all()
    return jsonify({"suggestions": [{"id": it.id, "title": it.title} for it in items]}), 200

@bp.route("/cart/validate", methods=["POST"])
def validate_cart():
    data = request.get_json() or {}
    items = data.get("items", [])
    resp_items = []
    total = 0.0
    for it in items:
        p = db.session.query(Product).get(it.get("product_id"))
        if not p:
            return jsonify({"error": f"Product not found"}), 404
        qty = int(it.get("qty", 1))
        if qty > p.stock:
            return jsonify({"error": f"Not enough stock for {p.title}"}), 400
        line = round(p.price * qty, 2)
        resp_items.append({"product_id": p.id, "qty": qty, "price": p.price, "line_total": line})
        total += line
    return jsonify({"items": resp_items, "total": round(total, 2)}), 200

@bp.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json() or {}
    buyer_id = data.get("buyer_id") or "guest"
    items = data.get("items", [])
    payment_method = data.get("payment_method", "cod")
    shipping = data.get("shipping", {})
    
    order_total = 0.0
    order_items = []
    for it in items:
        p = db.session.query(Product).get(it["product_id"])
        if not p or p.stock < it["qty"]:
            return jsonify({"error": "out_of_stock"}), 400
        p.stock -= it["qty"]
        line = round(p.price * it["qty"], 2)
        order_items.append({"product_id": p.id, "title": p.title, "qty": it["qty"], "price": p.price})
        order_total += line
    
    order = Order(buyer_id=buyer_id, total=round(order_total, 2), payment_method=payment_method, shipping=json.dumps(shipping), status="Ordered")
    db.session.add(order)
    db.session.flush()
    
    for it in order_items:
        oi = OrderItem(order_id=order.id, product_id=it["product_id"], title=it["title"], qty=it["qty"], price=it["price"])
        db.session.add(oi)
    
    db.session.commit()
    return jsonify({"order": {"id": order.id, "total": order.total, "status": order.status}}), 201

@bp.route("/orders", methods=["GET"])
def list_orders():
    buyer_id = request.args.get("buyer_id")
    query = db.session.query(Order)
    if buyer_id:
        query = query.filter_by(buyer_id=buyer_id)
    orders = query.order_by(Order.created_at.desc()).all()
    out = []
    for o in orders:
        items = db.session.query(OrderItem).filter_by(order_id=o.id).all()
        out.append({
            "id": o.id, "buyer_id": o.buyer_id, "total": o.total, "status": o.status,
            "created_at": o.created_at.isoformat(), "items": [{"title": it.title, "qty": it.qty, "price": it.price} for it in items]
        })
    return jsonify({"orders": out}), 200

@bp.route("/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json() or {}
    status = data.get("status")
    o = db.session.query(Order).get(order_id)
    if not o:
        return jsonify({"error": "order_not_found"}), 404
    o.status = status
    db.session.commit()
    return jsonify({"order_id": o.id, "status": o.status}), 200

@bp.route("/invoice/<order_id>", methods=["GET"])
def invoice(order_id):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:
        return jsonify({"error": "reportlab not installed"}), 500
    
    o = db.session.query(Order).get(order_id)
    if not o:
        return jsonify({"error": "not_found"}), 404
    items = db.session.query(OrderItem).filter_by(order_id=o.id).all()
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, 800, f"Invoice - Order {o.id}")
    c.setFont("Helvetica", 11)
    c.drawString(40, 780, f"Buyer: {o.buyer_id}")
    y = 740
    c.drawString(40, y, "Item")
    c.drawString(360, y, "Qty")
    c.drawString(420, y, "Price")
    for it in items:
        y -= 20
        c.drawString(40, y, it.title[:50])
        c.drawString(360, y, str(it.qty))
        c.drawString(420, y, f"₹{it.price}")
    y -= 30
    c.drawString(360, y, "Total:")
    c.drawString(420, y, f"₹{o.total}")
    c.showPage()
    c.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"invoice_{o.id}.pdf", mimetype="application/pdf")

# ...existing code...
def register_ecom(app):
    """Register blueprint, ensure DB tables exist and seed sample data if empty."""
    # register blueprint so routes are active
    app.register_blueprint(bp)

    # If SQLAlchemy already initialized in app (app.py called ecom_db.init_app),
    # just create tables and seed if needed. Otherwise init_db will init and create.
    if app.extensions.get("sqlalchemy"):
        with app.app_context():
            db.create_all()
            # seed if no products
            try:
                if db.session.query(Product).count() == 0:
                    cat = Category(name="Fertilizers")
                    db.session.add(cat)
                    db.session.commit()
                    p1 = Product(
                        id="prod-demo-urea",
                        title="Urea Fertilizer 50kg",
                        description="Nitrogen rich urea for higher yields.",
                        price=2200.0,
                        stock=120,
                        category_id=cat.id,
                        variants=json.dumps({"pack": ["50kg", "25kg"]})
                    )
                    p2 = Product(
                        id="prod-demo-compost",
                        title="Organic Compost 25kg",
                        description="Improve soil structure and organic matter.",
                        price=600.0,
                        stock=60,
                        category_id=cat.id,
                        variants=json.dumps({"pack": ["25kg"]})
                    )
                    db.session.add_all([p1, p2])
                    db.session.commit()
            except Exception:
                # avoid crashing startup on seed errors
                db.session.rollback()
    else:
        # init_db will call db.init_app(app) then create_all + seed
        init_db(app)
# ...existing code...