from flask import Blueprint, request, jsonify
from database.db import db
from models.tariff_model import Tariff, Payment, Wallet
from routes.auth_routes import token_required

tariff_bp = Blueprint('tariff_payment', __name__)

@tariff_bp.route('/tariffs', methods=['GET'])
@token_required
def get_tariffs(current_user):
    tariffs = Tariff.query.all()
    return jsonify([t.to_dict() for t in tariffs])

@tariff_bp.route('/tariffs/lookup', methods=['POST'])
@token_required
def lookup_rate(current_user):
    data = request.get_json()
    tariff = Tariff.query.filter_by(
        origin_city=data.get('origin'),
        dest_city=data.get('destination'),
        service_type_id=data.get('service_type_id')
    ).first()
    
    if tariff:
        return jsonify(tariff.to_dict())
    return jsonify({'message': 'No rate found'}), 404

@tariff_bp.route('/payments', methods=['POST'])
@token_required
def record_payment(current_user):
    data = request.get_json()
    new_payment = Payment(**data)
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.to_dict()), 201

@tariff_bp.route('/wallet/balance', methods=['GET'])
@token_required
def get_balance(current_user):
    wallet = Wallet.query.filter_by(user_id=current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.session.add(wallet)
        db.session.commit()
    return jsonify(wallet.to_dict())
