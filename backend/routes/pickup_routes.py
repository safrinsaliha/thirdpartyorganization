from flask import Blueprint, request, jsonify
from models.pickup_model import Pickup
from database.db import db
from routes.auth_routes import token_required

pickup_bp = Blueprint('pickup', __name__)

@pickup_bp.route('/pickups', methods=['GET'])
@token_required
def get_pickups(current_user):
    pickups = Pickup.query.all()
    return jsonify([pickup.to_dict() for pickup in pickups])

@pickup_bp.route('/pickups', methods=['POST'])
@token_required
def create_pickup(current_user):
    data = request.get_json()
    new_pickup = Pickup(
        consignment_no=data.get('consignment_no'),
        client_name=data.get('client_name'),
        sender=data.get('sender'),
        receiver=data.get('receiver'),
        pcs_weight=data.get('pcs_weight'),
        pickup_status='Pending'
    )
    db.session.add(new_pickup)
    db.session.commit()
    return jsonify(new_pickup.to_dict()), 201

@pickup_bp.route('/pickups/<int:id>', methods=['PUT'])
@token_required
def update_pickup(current_user, id):
    pickup = Pickup.query.get_or_404(id)
    data = request.get_json()
    
    if 'pickup_status' in data:
        pickup.pickup_status = data['pickup_status']
    if 'assign_branch' in data:
        pickup.assign_branch = data['assign_branch']
    if 'staff' in data:
        pickup.staff = data['staff']
    if 'delivery_status' in data:
        pickup.delivery_status = data['delivery_status']
        
    db.session.commit()
    return jsonify(pickup.to_dict())
