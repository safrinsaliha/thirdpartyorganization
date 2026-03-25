from database.db import db
from datetime import datetime

class Tariff(db.Model):
    __tablename__ = 'tariffs'
    id = db.Column(db.Integer, primary_key=True)
    origin_city = db.Column(db.String(100), nullable=False)
    dest_city = db.Column(db.String(100), nullable=False)
    service_type_id = db.Column(db.Integer, db.ForeignKey('service_types.id'), nullable=False)
    rate_per_kg = db.Column(db.Float, nullable=False)
    min_weight = db.Column(db.Float, default=1.0)
    min_amount = db.Column(db.Float, default=0.0)
    effective_from = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'origin_city': self.origin_city,
            'dest_city': self.dest_city,
            'service_type_id': self.service_type_id,
            'rate_per_kg': self.rate_per_kg,
            'min_weight': self.min_weight,
            'min_amount': self.min_amount,
            'effective_from': self.effective_from.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    amount = db.Column(db.Float, nullable=False)
    payment_mode = db.Column(db.String(50), nullable=False) # CASH, WALLET, CARD, UPI
    transaction_id = db.Column(db.String(100), unique=True)
    status = db.Column(db.String(20), default='Success')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': self.amount,
            'payment_mode': self.payment_mode,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class Wallet(db.Model):
    __tablename__ = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    balance = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'balance': self.balance,
            'updated_at': self.updated_at.isoformat()
        }
