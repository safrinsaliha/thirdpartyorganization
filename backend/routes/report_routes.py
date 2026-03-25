from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from database.db import db
from models.booking_model import Booking, BillingDetail
from models.pickup_model import Pickup
from routes.auth_routes import token_required

report_bp = Blueprint('report', __name__)

@report_bp.route('/reports/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    total_bookings = Booking.query.count()
    total_revenue = db.session.query(func.sum(BillingDetail.net_total)).scalar() or 0
    pending_pickups = Pickup.query.filter_by(pickup_status='Pending').count()
    delivered_count = Booking.query.filter_by(status='Delivered').count()
    in_transit_count = Booking.query.filter_by(status='In Transit').count()

    return jsonify({
        'totalBookings': total_bookings,
        'totalRevenue': total_revenue,
        'pendingPickups': pending_pickups,
        'delivered': delivered_count,
        'inTransit': in_transit_count
    })

@report_bp.route('/reports/daily-bookings', methods=['GET'])
@token_required
def get_daily_bookings(current_user):
    # Last 7 days
    date_limit = datetime.utcnow() - timedelta(days=7)
    
    results = db.session.query(
        func.date(Booking.booking_date).label('date'),
        func.count(Booking.id).label('count')
    ).filter(Booking.booking_date >= date_limit)\
     .group_by(func.date(Booking.booking_date))\
     .order_by(func.date(Booking.booking_date)).all()

    return jsonify([{'date': str(r.date), 'count': r.count} for r in results])

@report_bp.route('/reports/service-revenue', methods=['GET'])
@token_required
def get_service_revenue(current_user):
    results = db.session.query(
        Booking.service_type,
        func.sum(BillingDetail.net_total).label('revenue')
    ).join(BillingDetail)\
     .group_by(Booking.service_type).all()

    return jsonify([{'service': r.service_type, 'revenue': r.revenue} for r in results])

@report_bp.route('/reports/status-distribution', methods=['GET'])
@token_required
def get_status_distribution(current_user):
    results = db.session.query(
        Booking.status,
        func.count(Booking.id).label('count')
    ).group_by(Booking.status).all()

    return jsonify([{'status': r.status, 'count': r.count} for r in results])
