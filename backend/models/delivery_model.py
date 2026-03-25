from database.db import db
from datetime import datetime

class HubItem(db.Model):
    __tablename__ = 'hub_items'
    id = db.Column(db.Integer, primary_key=True)
    invoice_no = db.Column(db.String(50), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Float)
    employee_name = db.Column(db.String(100))
    origin_hub = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    delivery_status = db.Column(db.String(50), default='In Transit')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Received')

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_no': self.invoice_no,
            'client_name': self.client_name,
            'weight': self.weight,
            'employee_name': self.employee_name,
            'origin_hub': self.origin_hub,
            'destination': self.destination,
            'delivery_status': self.delivery_status,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
