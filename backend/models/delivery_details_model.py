from database.db import db
from datetime import datetime

class DeliveryStatus(db.Model):
    __tablename__ = 'delivery_statuses'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False) # e.g., 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'
    location = db.Column(db.String(100))
    remarks = db.Column(db.Text)
    updated_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Proof of Delivery fields
    pod_receiver_name = db.Column(db.String(100))
    pod_receiver_phone = db.Column(db.String(20))
    pod_image_url = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'status': self.status,
            'location': self.location,
            'remarks': self.remarks,
            'updated_by_id': self.updated_by_id,
            'updated_at': self.updated_at.isoformat(),
            'pod_receiver_name': self.pod_receiver_name,
            'pod_receiver_phone': self.pod_receiver_phone,
            'pod_image_url': self.pod_image_url
        }

class OFD(db.Model):
    __tablename__ = 'ofd_assignments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    vehicle_no = db.Column(db.String(20))
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Assigned') # Assigned, Completed, Returned

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'staff_id': self.staff_id,
            'vehicle_no': self.vehicle_no,
            'assigned_at': self.assigned_at.isoformat(),
            'status': self.status
        }
