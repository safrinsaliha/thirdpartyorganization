from flask import Blueprint, request, jsonify
from models.booking_model import Booking, ShipmentDetail, BillingDetail
from models.pickup_model import Pickup
from models.delivery_model import HubItem
from database.db import db
from routes.auth_routes import token_required

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/bookings', methods=['GET'])
@token_required
def get_bookings(current_user):
    bookings = Booking.query.all()
    return jsonify([booking.to_dict() for booking in bookings])

@booking_bp.route('/bookings/<int:id>', methods=['GET'])
@token_required
def get_booking(current_user, id):
    booking = Booking.query.get_or_404(id)
    return jsonify(booking.to_dict())

@booking_bp.route('/bookings/track/<string:consignment_no>', methods=['GET'])
def track_booking(consignment_no):
    booking = Booking.query.filter_by(consignment_no=consignment_no).first()
    if not booking:
        return jsonify({'message': 'Shipment not found'}), 404
    return jsonify(booking.to_dict())

@booking_bp.route('/bookings', methods=['POST'])
@token_required
def create_booking(current_user):
    data = request.get_json()
    
    consignor_data = data.get('consignor', {})
    consignee_data = data.get('consignee', {})
    info_data = data.get('info', {})
    shipment_data = data.get('shipment', {})
    billing_data = data.get('billing', {})

    # Create Booking
    new_booking = Booking(
        consignment_no=data.get('consignment_no'),
        manual_auto_cd=data.get('manual_auto_cd', 'Auto'),
        customer_name=data.get('customer_name'),
        origin=data.get('origin'),
        destination=data.get('destination'),
        service_type=data.get('service_type'),
        pincode=data.get('pincode'),
        invoice_number=shipment_data.get('invoice_number'),
        invoice_value=shipment_data.get('invoice_value'),
        product_category=shipment_data.get('product_category'),
        eway_bill_no=shipment_data.get('eway_bill_no'),
        consignor_name=consignor_data.get('name'),
        consignor_city=consignor_data.get('city'),
        consignor_pincode=consignor_data.get('pincode'),
        consignor_address=consignor_data.get('address'),
        consignor_mobile=consignor_data.get('mobile'),
        consignor_state=consignor_data.get('state'),
        consignee_name=consignee_data.get('name'),
        consignee_city=consignee_data.get('city'),
        consignee_address=consignee_data.get('address'),
        consignee_mobile=consignee_data.get('mobile'),
        consignee_state=consignee_data.get('state'),
        company_name=info_data.get('company_name', 'KB Cargo'),
        doc_type=info_data.get('doc_type'),
        delivery_type=info_data.get('delivery_type'),
        billing_branch=info_data.get('billing_branch'),
        freight_charge_by=info_data.get('freight_charge_by'),
        invoice_currency=info_data.get('invoice_currency', 'INR'),
        booked_by=info_data.get('booked_by'),
        staff_name=info_data.get('staff_name')
    )
    db.session.add(new_booking)
    db.session.flush() # To get the booking ID

    # Create Shipment
    new_shipment = ShipmentDetail(
        booking_id=new_booking.id,
        total_pcs=shipment_data.get('total_pcs', 0),
        actual_weight=shipment_data.get('actual_weight', 0.0),
        volumetric_weight=shipment_data.get('volumetric_weight', 0.0),
        chargeable_weight=shipment_data.get('chargeable_weight', 0.0)
    )
    db.session.add(new_shipment)

    # Create Billing
    new_billing = BillingDetail(
        booking_id=new_booking.id,
        payment_mode=billing_data.get('payment_mode', 'CASH'),
        rate_per_kg=billing_data.get('rate_per_kg', 0.0),
        freight_amt=billing_data.get('freight_amt', 0.0),
        fsc_amt=billing_data.get('fsc_amt', 0.0),
        other_charges=billing_data.get('other_charges', 0.0),
        cgst=billing_data.get('cgst', 0.0),
        sgst=billing_data.get('sgst', 0.0),
        igst=billing_data.get('igst', 0.0),
        net_total=billing_data.get('net_total', 0.0)
    )
    db.session.add(new_billing)

    db.session.commit()

    # Auto-create a Pickup record so the booking shows in New Pickup module
    auto_pickup = Pickup(
        consignment_no=new_booking.consignment_no,
        client_name=new_booking.customer_name or new_booking.consignor_name or 'N/A',
        sender=new_booking.consignor_name,
        receiver=new_booking.consignee_name,
        pcs_weight=f"{shipment_data.get('total_pcs', 0)} pcs / {shipment_data.get('chargeable_weight', 0)} kg",
        payment_status=billing_data.get('payment_mode', 'Pending'),
        pickup_status='Pending',
        delivery_status='Not Dispatched'
    )
    db.session.add(auto_pickup)

    # Auto-create a HubItem so booking shows in Hub Direct module
    auto_hub_item = HubItem(
        invoice_no=new_booking.consignment_no,
        client_name=new_booking.customer_name or new_booking.consignor_name or 'N/A',
        weight=shipment_data.get('chargeable_weight', 0.0),
        origin_hub=new_booking.origin or 'Origin Hub',
        destination=new_booking.destination or 'Destination Hub',
        status='Received',
        delivery_status='In Transit'
    )
    db.session.add(auto_hub_item)
    db.session.commit()

    return jsonify({'message': 'Booking created successfully', 'booking': new_booking.to_dict()}), 201

@booking_bp.route('/bookings/<int:id>', methods=['PUT'])
@token_required
def update_booking(current_user, id):
    booking = Booking.query.get_or_404(id)
    data = request.get_json()
    
    # Update status or other fields
    if 'status' in data:
        booking.status = data['status']
        
    db.session.commit()
    return jsonify({'message': 'Booking updated successfully', 'booking': booking.to_dict()})

@booking_bp.route('/bookings/<int:id>', methods=['DELETE'])
@token_required
def delete_booking(current_user, id):
    booking = Booking.query.get_or_404(id)
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'message': 'Booking deleted successfully'})
