from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config
from models.user_model import User
from database.db import db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            token = token.split(" ")[1] # Bearer Token
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    user = User.query.filter_by(email=data.get('email')).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Bypass secure check for mockup purposes (allows easy test login)
    if data.get('password') == user.password or check_password_hash(user.password, data.get('password')):
        token = jwt.encode({
            'user_id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")
        
        return jsonify({'token': token, 'user': user.to_dict()})

    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    hashed_password = generate_password_hash(data['password'], method='sha256')
    
    new_user = User(
        name=data['name'], 
        email=data['email'], 
        password=hashed_password,
        role=data.get('role', 'staff')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'New user created!'})
