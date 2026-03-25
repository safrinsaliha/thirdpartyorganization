from database.db import db

class Branch(db.Model):
    __tablename__ = 'branches'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text)
    contact_no = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'city': self.city,
            'address': self.address,
            'contact_no': self.contact_no,
            'is_active': self.is_active
        }

class Hub(db.Model):
    __tablename__ = 'hubs'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    manager_name = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'location': self.location,
            'manager_name': self.manager_name
        }

class Staff(db.Model):
    __tablename__ = 'staff'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    designation = db.Column(db.String(50))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    hub_id = db.Column(db.Integer, db.ForeignKey('hubs.id'))
    mobile = db.Column(db.String(20))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'employee_id': self.employee_id,
            'designation': self.designation,
            'branch_id': self.branch_id,
            'hub_id': self.hub_id,
            'mobile': self.mobile
        }

class ServiceType(db.Model):
    __tablename__ = 'service_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }
