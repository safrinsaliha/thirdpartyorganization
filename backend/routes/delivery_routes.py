from flask import Blueprint, request, jsonify
from models.delivery_model import HubItem
from models.booking_model import Booking
from database.db import db
from routes.auth_routes import token_required

delivery_bp = Blueprint('delivery', __name__)

@delivery_bp.route('/hub-items', methods=['GET'])
@token_required
def get_hub_items(current_user):
    items = HubItem.query.all()
    return jsonify([item.to_dict() for item in items])

@delivery_bp.route('/hub-items', methods=['POST'])
@token_required
def create_hub_item(current_user):
    data = request.get_json()
    new_item = HubItem(
        invoice_no=data.get('invoice_no'),
        client_name=data.get('client_name'),
        weight=data.get('weight'),
        origin_hub=data.get('origin_hub'),
        destination=data.get('destination'),
        employee_name=data.get('employee_name')
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@delivery_bp.route('/tracking/<string:consignment_no>', methods=['GET'])
def track_shipment(consignment_no):
    # Public tracking endpoint - no token required
    booking = Booking.query.filter_by(consignment_no=consignment_no).first()
    if not booking:
        return jsonify({'message': 'Consignment not found'}), 404
        
    return jsonify(booking.to_dict())
