import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from database.db import db

# Import routes (will be created soon)
from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.pickup_routes import pickup_bp
from routes.delivery_routes import delivery_bp
from routes.master_routes import master_bp
from routes.tariff_routes import tariff_bp
from routes.delivery_ops_routes import delivery_ops_bp
from routes.report_routes import report_bp
from routes.inventory_routes import inventory_bp

from models.user_model import User
from models.booking_model import Booking, ShipmentDetail, BillingDetail
from models.pickup_model import Pickup
from models.master_model import Branch, Hub, Staff, ServiceType
from models.tariff_model import Tariff, Payment, Wallet
from models.delivery_details_model import DeliveryStatus, OFD

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist/frontend/browser', static_url_path='/')
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)

    with app.app_context():
        # Import models so SQLAlchemy creates them
        import models.user_model
        import models.booking_model
        import models.pickup_model
        import models.delivery_model
        import models.master_model
        import models.tariff_model
        import models.delivery_details_model
        import models.inventory_model
        
        db.create_all()

        # Seed Admin User if not exists
        if not User.query.filter_by(email='admin@cargo.com').first():
            admin = User(
                name='Admin User',
                email='admin@cargo.com',
                password='adminpassword', # In production, use hashed passwords
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()

        # Seed Service Types if none exist
        if not ServiceType.query.first():
            st1 = ServiceType(name='Surface', description='Ground transportation')
            st2 = ServiceType(name='Expedited', description='Priority air/ground')
            db.session.add_all([st1, st2])
            db.session.commit()

        # Seed Sample Bookings if none exist
        if not Booking.query.first():
            # Sample 1: New York to San Francisco
            b1 = Booking(
                consignment_no='CN-552144',
                customer_name='Acme Corp',
                origin='New York',
                destination='San Francisco',
                service_type='Surface',
                pincode='10001',
                product_category='Electronics',
                status='Delivered'
            )
            s1 = ShipmentDetail(booking=b1, total_pcs=5, actual_weight=12.5, volumetric_weight=10.0, chargeable_weight=12.5)
            bi1 = BillingDetail(booking=b1, payment_mode='CASH', rate_per_kg=15, freight_amt=187.5, fsc_amt=18.75, cgst=16.88, sgst=16.88, igst=0, net_total=240.01)
            
            # Sample 2: Chicago to Los Angeles
            b2 = Booking(
                consignment_no='CN-887412',
                customer_name='Global Tech',
                origin='Chicago',
                destination='Los Angeles',
                service_type='Expedited',
                pincode='60601',
                product_category='Medical',
                status='In Transit'
            )
            s2 = ShipmentDetail(booking=b2, total_pcs=2, actual_weight=4.0, volumetric_weight=5.5, chargeable_weight=5.5)
            bi2 = BillingDetail(booking=b2, payment_mode='PREPAID', rate_per_kg=25, freight_amt=137.5, fsc_amt=13.75, cgst=12.38, sgst=12.38, igst=0, net_total=176.01)
            
            db.session.add_all([b1, s1, bi1, b2, s2, bi2])
            db.session.commit()

        # Seed Sample Pickups if none exist
        if not Pickup.query.first():
            p1 = Pickup(
                consignment_no='CN-552144',
                client_name='Acme Corp',
                payment_status='Paid',
                pickup_status='Accepted',
                assign_branch='Main Hub',
                delivery_status='Delivered'
            )
            p2 = Pickup(
                consignment_no='CN-887412',
                client_name='Global Tech',
                payment_status='Pending',
                pickup_status='Pending',
                assign_branch='Chicago Branch',
                delivery_status='Not Dispatched'
            )
            db.session.add_all([p1, p2])
            db.session.commit()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(booking_bp, url_prefix='/api')
    app.register_blueprint(pickup_bp, url_prefix='/api')
    app.register_blueprint(delivery_bp, url_prefix='/api')
    app.register_blueprint(master_bp, url_prefix='/api')
    app.register_blueprint(tariff_bp, url_prefix='/api')
    app.register_blueprint(delivery_ops_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(inventory_bp, url_prefix='/api')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
