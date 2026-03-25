from flask import Blueprint, request, jsonify
from database.db import db
from models.delivery_details_model import DeliveryStatus, OFD
from models.booking_model import Booking
from routes.auth_routes import token_required

delivery_ops_bp = Blueprint('delivery_ops', __name__)

@delivery_ops_bp.route('/ofd/assign', methods=['POST'])
@token_required
def assign_ofd(current_user):
    data = request.get_json()
    booking_ids = data.get('booking_ids', [])
    staff_id = data.get('staff_id')
    vehicle_no = data.get('vehicle_no')

    assignments = []
    for bid in booking_ids:
        ofd = OFD(booking_id=bid, staff_id=staff_id, vehicle_no=vehicle_no)
        db.session.add(ofd)
        
        # Update booking status
        booking = Booking.query.get(bid)
        if booking:
            booking.status = 'Out for Delivery'
            
        # Add status log
        status_log = DeliveryStatus(
            booking_id=bid,
            status='Out for Delivery',
            location='Branch',
            remarks='Assigned for Delivery',
            updated_by_id=current_user.id
        )
        db.session.add(status_log)
        assignments.append(ofd)

    db.session.commit()
    return jsonify({'message': f'{len(assignments)} bookings assigned for OFD'})

@delivery_ops_bp.route('/delivery/confirm', methods=['POST'])
@token_required
def confirm_delivery(current_user):
    data = request.get_json()
    booking_id = data.get('booking_id')
    status = data.get('status') # Delivered, Failed
    remarks = data.get('remarks')
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
        
    booking.status = status
    
    delivery_status = DeliveryStatus(
        booking_id=booking_id,
        status=status,
        remarks=remarks,
        pod_receiver_name=data.get('receiver_name'),
        pod_receiver_phone=data.get('receiver_phone'),
        updated_by_id=current_user.id
    )
    db.session.add(delivery_status)
    db.session.commit()
    
    return jsonify(delivery_status.to_dict())

@delivery_ops_bp.route('/tracking/<consignment_no>', methods=['GET'])
def public_tracking(consignment_no):
    booking = Booking.query.filter_by(consignment_no=consignment_no).first()
    if not booking:
        return jsonify({'message': 'Consignment not found'}), 404
        
    history = DeliveryStatus.query.filter_by(booking_id=booking.id).order_by(DeliveryStatus.updated_at.desc()).all()
    
    return jsonify({
        'booking': booking.to_dict(),
        'history': [h.to_dict() for h in history]
    })
