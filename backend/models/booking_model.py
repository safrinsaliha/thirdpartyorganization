from database.db import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    consignment_no = db.Column(db.String(50), unique=True, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    invoice_number = db.Column(db.String(50))
    invoice_value = db.Column(db.Float)
    product_category = db.Column(db.String(100))
    status = db.Column(db.String(50), default='Booked')
    manual_auto_cd = db.Column(db.String(20), default='Auto')
    consignor_name = db.Column(db.String(100))
    consignor_city = db.Column(db.String(100))
    consignor_pincode = db.Column(db.String(20))
    consignor_address = db.Column(db.Text)
    consignor_mobile = db.Column(db.String(20))
    consignor_state = db.Column(db.String(100))
    consignee_name = db.Column(db.String(100))
    consignee_city = db.Column(db.String(100))
    consignee_address = db.Column(db.Text)
    consignee_mobile = db.Column(db.String(20))
    consignee_state = db.Column(db.String(100))
    eway_bill_no = db.Column(db.String(50))
    company_name = db.Column(db.String(100), default='KB Cargo')
    doc_type = db.Column(db.String(50))
    delivery_type = db.Column(db.String(50))
    billing_branch = db.Column(db.String(100))
    freight_charge_by = db.Column(db.String(50))
    invoice_currency = db.Column(db.String(20), default='INR')
    booked_by = db.Column(db.String(100))
    staff_name = db.Column(db.String(100))

    shipment = db.relationship('ShipmentDetail', backref='booking', uselist=False, cascade='all, delete-orphan')
    billing = db.relationship('BillingDetail', backref='booking', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'consignment_no': self.consignment_no,
            'manual_auto_cd': self.manual_auto_cd,
            'customer_name': self.customer_name,
            'origin': self.origin,
            'destination': self.destination,
            'service_type': self.service_type,
            'pincode': self.pincode,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'invoice_number': self.invoice_number,
            'invoice_value': self.invoice_value,
            'product_category': self.product_category,
            'eway_bill_no': self.eway_bill_no,
            'status': self.status,
            'consignor': {
                'name': self.consignor_name,
                'city': self.consignor_city,
                'pincode': self.consignor_pincode,
                'address': self.consignor_address,
                'mobile': self.consignor_mobile,
                'state': self.consignor_state
            },
            'consignee': {
                'name': self.consignee_name,
                'city': self.consignee_city,
                'address': self.consignee_address,
                'mobile': self.consignee_mobile,
                'state': self.consignee_state
            },
            'info': {
                'company_name': self.company_name,
                'doc_type': self.doc_type,
                'delivery_type': self.delivery_type,
                'billing_branch': self.billing_branch,
                'freight_charge_by': self.freight_charge_by,
                'invoice_currency': self.invoice_currency,
                'booked_by': self.booked_by,
                'staff_name': self.staff_name
            },
            'shipment': self.shipment.to_dict() if self.shipment else None,
            'billing': self.billing.to_dict() if self.billing else None
        }

class ShipmentDetail(db.Model):
    __tablename__ = 'shipment_details'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    total_pcs = db.Column(db.Integer, nullable=False)
    actual_weight = db.Column(db.Float, nullable=False)
    volumetric_weight = db.Column(db.Float, nullable=False)
    chargeable_weight = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'total_pcs': self.total_pcs,
            'actual_weight': self.actual_weight,
            'volumetric_weight': self.volumetric_weight,
            'chargeable_weight': self.chargeable_weight
        }

class BillingDetail(db.Model):
    __tablename__ = 'billing_details'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    payment_mode = db.Column(db.String(50), nullable=False)
    rate_per_kg = db.Column(db.Float, nullable=False)
    freight_amt = db.Column(db.Float, nullable=False)
    fsc_amt = db.Column(db.Float, nullable=False)
    other_charges = db.Column(db.Float, default=0.0)
    cgst = db.Column(db.Float, nullable=False)
    sgst = db.Column(db.Float, nullable=False)
    igst = db.Column(db.Float, nullable=False)
    net_total = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'payment_mode': self.payment_mode,
            'rate_per_kg': self.rate_per_kg,
            'freight_amt': self.freight_amt,
            'fsc_amt': self.fsc_amt,
            'other_charges': self.other_charges,
            'cgst': self.cgst,
            'sgst': self.sgst,
            'igst': self.igst,
            'net_total': self.net_total
        }
