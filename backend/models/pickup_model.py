from database.db import db
from datetime import datetime

class Pickup(db.Model):
    __tablename__ = 'pickups'
    id = db.Column(db.Integer, primary_key=True)
    consignment_no = db.Column(db.String(50), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    payment_status = db.Column(db.String(50), default='Pending')
    pickup_status = db.Column(db.String(50), default='Pending')
    assign_branch = db.Column(db.String(100))
    delivery_status = db.Column(db.String(50), default='Not Dispatched')
    staff = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sender = db.Column(db.String(100))
    receiver = db.Column(db.String(100))
    pcs_weight = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'consignment_no': self.consignment_no,
            'client_name': self.client_name,
            'payment_status': self.payment_status,
            'pickup_status': self.pickup_status,
            'assign_branch': self.assign_branch,
            'delivery_status': self.delivery_status,
            'staff': self.staff,
            'sender': self.sender,
            'receiver': self.receiver,
            'pcs_weight': self.pcs_weight,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
