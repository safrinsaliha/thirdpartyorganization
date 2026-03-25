from flask import Blueprint, request, jsonify
from database.db import db
from models.master_model import Branch, Hub, Staff, ServiceType
from routes.auth_routes import token_required

master_bp = Blueprint('master', __name__)

# Branch Routes
@master_bp.route('/master/branches', methods=['GET'])
@token_required
def get_branches(current_user):
    branches = Branch.query.all()
    return jsonify([b.to_dict() for b in branches])

@master_bp.route('/master/branches', methods=['POST'])
@token_required
def create_branch(current_user):
    data = request.get_json()
    new_branch = Branch(**data)
    db.session.add(new_branch)
    db.session.commit()
    return jsonify(new_branch.to_dict()), 201

# Hub Routes
@master_bp.route('/master/hubs', methods=['GET'])
@token_required
def get_hubs(current_user):
    hubs = Hub.query.all()
    return jsonify([h.to_dict() for h in hubs])

@master_bp.route('/master/hubs', methods=['POST'])
@token_required
def create_hub(current_user):
    data = request.get_json()
    new_hub = Hub(**data)
    db.session.add(new_hub)
    db.session.commit()
    return jsonify(new_hub.to_dict()), 201

# Staff Routes
@master_bp.route('/master/staff', methods=['GET'])
@token_required
def get_staff(current_user):
    staff_list = Staff.query.all()
    return jsonify([s.to_dict() for s in staff_list])

@master_bp.route('/master/staff', methods=['POST'])
@token_required
def create_staff(current_user):
    data = request.get_json()
    new_staff = Staff(**data)
    db.session.add(new_staff)
    db.session.commit()
    return jsonify(new_staff.to_dict()), 201

# Service Type Routes
@master_bp.route('/master/service-types', methods=['GET'])
@token_required
def get_service_types(current_user):
    types = ServiceType.query.all()
    return jsonify([t.to_dict() for t in types])
