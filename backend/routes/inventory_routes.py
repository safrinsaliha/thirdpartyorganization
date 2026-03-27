from flask import Blueprint, request, jsonify
from models.inventory_model import InventoryItem
from database.db import db

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory', methods=['GET'])
def get_inventory():
    items = InventoryItem.query.all()
    return jsonify([item.to_dict() for item in items])

@inventory_bp.route('/inventory', methods=['POST'])
def add_inventory():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'message': 'Invalid data'}), 400
    
    new_item = InventoryItem(
        name=data['name'],
        category=data.get('category', 'General'),
        quantity=data.get('quantity', 0),
        location=data.get('location', 'Main Warehouse'),
        status=data.get('status', 'In Stock')
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({'message': 'Item added successfully', 'item': new_item.to_dict()}), 201
