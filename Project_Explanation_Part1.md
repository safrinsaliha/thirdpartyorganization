# LOGISTICS MANAGEMENT SYSTEM
# Step-by-Step Project Explanation — Part 1 of 2

**Project:** Logistics & Courier Management Platform
**Stack:** Angular 17 | Python Flask | SQLite | Render.com
---

## ═══════════════════════════════════════════
## STEP 1: UNDERSTANDING THE PROJECT GOAL
## ═══════════════════════════════════════════

Before writing a single line of code, we must clearly understand WHY this system is being built.

### The Real-World Problem
Imagine a courier company. Every day, they receive hundreds of shipments. Staff write details on paper:
- Who is the sender?
- Who is the receiver?
- How heavy is the package?
- How much should we charge?
- Which truck is taking it?
- Has it been delivered?

This manual process causes MANY problems:
1. Papers get lost
2. Calculations are wrong (incorrect billing)
3. Customers call asking "Where is my package?" — nobody knows
4. Managers cannot see total daily revenue
5. Staff in different offices cannot see each other's data

### The Solution We Built
A **web application** that:
- Stores ALL shipment data in a database
- Calculates charges automatically
- Shows live tracking status
- Gives management a real-time dashboard
- Works from any computer/browser anywhere in the world

---

## ═══════════════════════════════════════════
## STEP 2: PLANNING THE SYSTEM ARCHITECTURE
## ═══════════════════════════════════════════

Before coding, we planned how the system would be structured.

### The 3-Tier Architecture

We divided the system into 3 separate layers:

```
LAYER 1: FRONTEND (User Interface)
   ↕ HTTP Requests (JSON data)
LAYER 2: BACKEND (Business Logic)
   ↕ SQL Queries
LAYER 3: DATABASE (Data Storage)
```

### Why 3 Layers?

| Layer | Technology | Job |
|---|---|---|
| Frontend | Angular 17 | Shows screens, handles forms, displays data |
| Backend | Python Flask | Processes requests, applies business rules, security |
| Database | SQLite | Stores all data permanently |

### The Single-URL Decision

A key architectural decision was the Single-URL pattern.

**Normal approach (problematic):**
- Frontend runs at: `http://localhost:4200`
- Backend runs at: `http://localhost:5000`
- Problem: CORS errors block communication

**Our approach (elegant):**
- Both run at: `http://localhost:5000`
- Flask serves Angular's compiled files
- No CORS conflict at all

---

## ═══════════════════════════════════════════
## STEP 3: SETTING UP THE BACKEND (FLASK)
## ═══════════════════════════════════════════

### Step 3.1 — Create the Folder Structure

First, we created the backend folder structure:

```
backend/
├── app.py             ← Main application file
├── config.py          ← Settings (database URL, secret key)
├── requirements.txt   ← List of Python packages needed
├── database/
│   └── db.py          ← Database connection setup
├── models/            ← Database table definitions
│   ├── user_model.py
│   ├── booking_model.py
│   └── inventory_model.py
└── routes/            ← API endpoint definitions
    ├── auth_routes.py
    ├── booking_routes.py
    └── inventory_routes.py
```

### Step 3.2 — Install Python Packages

We created `requirements.txt` listing all needed packages:
```
Flask==3.0.0
Flask-Cors==4.0.0
Flask-SQLAlchemy==3.1.1
PyJWT==2.8.0
Werkzeug==3.0.1
gunicorn==21.2.0
```

Install command:
```bash
pip install -r requirements.txt
```

### Step 3.3 — Configure the Database Connection

In `database/db.py`:
```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
```

In `config.py`:
```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///logistics.db'   # Local development database
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

This uses an environment variable in production (Render.com), but falls back to a local SQLite file during development.

### Step 3.4 — Create the Application Factory

In `app.py`, we used the Application Factory Pattern:
```python
import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from database.db import db

def create_app():
    # Point Flask to Angular's compiled output folder
    app = Flask(__name__,
        static_folder='../frontend/dist/frontend/browser',
        static_url_path='/')
    
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    
    with app.app_context():
        # Auto-create database tables
        db.create_all()
    
    # Serve Angular's index.html for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        if path and os.path.exists(
            os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    return app
```

---

## ═══════════════════════════════════════════
## STEP 4: DESIGNING THE DATABASE MODELS
## ═══════════════════════════════════════════

Each database table is defined as a Python class using SQLAlchemy ORM.

### Step 4.1 — User Model (users table)

File: `backend/models/user_model.py`
```python
from database.db import db

class User(db.Model):
    __tablename__ = 'users'
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(100), nullable=False)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Hashed
    role     = db.Column(db.String(50), default='staff')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name,
            'email': self.email, 'role': self.role
        }
```

### Step 4.2 — Booking Model (bookings table)

File: `backend/models/booking_model.py`
```python
class Booking(db.Model):
    __tablename__ = 'bookings'
    id               = db.Column(db.Integer, primary_key=True)
    consignment_no   = db.Column(db.String(50), unique=True)
    customer_name    = db.Column(db.String(100))
    origin           = db.Column(db.String(100))
    destination      = db.Column(db.String(100))
    service_type     = db.Column(db.String(50))
    status           = db.Column(db.String(50), default='Pending')
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Related data (1-to-1)
    shipment_detail  = db.relationship('ShipmentDetail', backref='booking',
                                        uselist=False)
    billing_detail   = db.relationship('BillingDetail', backref='booking',
                                        uselist=False)
```

### Step 4.3 — Inventory Model (inventory_items table)

File: `backend/models/inventory_model.py`
```python
class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    category   = db.Column(db.String(50), default='General')
    quantity   = db.Column(db.Integer, default=0)
    location   = db.Column(db.String(100), default='Main Warehouse')
    status     = db.Column(db.String(20), default='In Stock')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Summary of All Tables

| Table Name | Purpose | Key Columns |
|---|---|---|
| `users` | Login accounts | email, password, role |
| `bookings` | Shipment records | consignment_no, origin, destination, status |
| `shipment_details` | Weight & pieces info | actual_weight, chargeable_weight |
| `billing_details` | Invoice amounts | freight_amt, cgst, sgst, net_total |
| `pickups` | Pickup scheduling | consignment_no, pickup_status |
| `inventory_items` | Warehouse stock | name, quantity, status |
| `branches` | Office locations | name, city, code |
| `staff` | Staff profiles | name, branch, role |
| `tariffs` | Freight rate matrix | origin_zone, destination_zone, rate_per_kg |

---

## ═══════════════════════════════════════════
## STEP 5: BUILDING THE AUTHENTICATION API
## ═══════════════════════════════════════════

Authentication is the door to the system. Without it, anyone could access sensitive freight and billing data.

### Step 5.1 — The Registration Endpoint

File: `backend/routes/auth_routes.py`

```python
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config
from models.user_model import User
from database.db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Step 1: Hash the password (NEVER store plain text)
    hashed_password = generate_password_hash(data['password'])
    
    # Step 2: Create the new user record
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=data.get('role', 'staff')
    )
    
    # Step 3: Save to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'New user created!'}), 201
```

**What happens when you register:**
1. Browser sends: `{ name, email, password }`
2. Flask receives the data
3. Werkzeug hashes the password (e.g., `pbkdf2:sha256:600000$xyz$abc123...`)
4. New record saved to `users` table
5. Flask responds: `{ "message": "New user created!" }`

### Step 5.2 — The Login Endpoint

```python
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Step 1: Find user by email
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Step 2: Verify password against stored hash
    if check_password_hash(user.password, data.get('password')):
        
        # Step 3: Generate JWT token valid for 24 hours
        token = jwt.encode({
            'user_id': user.id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")
        
        return jsonify({'token': token, 'user': user.to_dict()})
    
    return jsonify({'message': 'Invalid credentials'}), 401
```

**What happens when you log in:**
1. Browser sends: `{ email, password }`
2. Flask finds user record in database
3. Werkzeug compares submitted password with stored hash
4. If correct: PyJWT creates a signed token containing `{user_id, role, exp}`
5. Token is sent back to browser, stored in `localStorage`
6. Every future request includes this token in headers

### Step 5.3 — Protecting Routes with the Token Decorator

```python
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(" ")[1]  # Extract from "Bearer <token>"
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated
```

Add `@token_required` above any route to protect it:
```python
@booking_bp.route('/bookings', methods=['GET'])
@token_required       # ← Only authenticated users can access
def get_bookings(current_user):
    bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings])
```

---

## ═══════════════════════════════════════════
## STEP 6: BUILDING ALL BACKEND API ROUTES
## ═══════════════════════════════════════════

### Step 6.1 — Booking Routes

The most complex route handles creating a complete booking with linked shipment and billing data:

```python
@booking_bp.route('/bookings', methods=['POST'])
@token_required
def create_booking(current_user):
    data = request.get_json()

    booking = Booking(
        consignment_no=data['consignment_no'],
        customer_name=data['customer_name'],
        origin=data['origin'],
        destination=data['destination'],
        service_type=data['service_type']
    )
    
    shipment = ShipmentDetail(
        booking=booking,
        total_pcs=data.get('total_pcs', 1),
        actual_weight=data.get('actual_weight', 0),
        chargeable_weight=data.get('chargeable_weight', 0)
    )
    
    billing = BillingDetail(
        booking=booking,
        freight_amt=data.get('freight_amt', 0),
        cgst=data.get('cgst', 0),
        sgst=data.get('sgst', 0),
        net_total=data.get('net_total', 0)
    )
    
    db.session.add_all([booking, shipment, billing])
    db.session.commit()
    
    return jsonify({'message': 'Booking created!'}), 201
```

### Step 6.2 — Registering All Blueprints in app.py

All route files must be registered in the main app factory:
```python
from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.inventory_routes import inventory_bp
from routes.report_routes import report_bp
# ... all other blueprints

def create_app():
    # ...
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(booking_bp, url_prefix='/api')
    app.register_blueprint(inventory_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    return app
```

**Result:** All API endpoints are prefixed with `/api/`:
- `POST /api/login`
- `GET /api/bookings`
- `POST /api/inventory`
- `GET /api/reports`

---

## ═══════════════════════════════════════════
## STEP 7: SETTING UP THE ANGULAR FRONTEND
## ═══════════════════════════════════════════

### Step 7.1 — Create Angular Project

```bash
cd frontend
ng new frontend --standalone --routing --style css
cd frontend
npm install
```

The `--standalone` flag enables Angular 17's modern architecture without NgModules.

### Step 7.2 — Install Frontend Dependencies

```bash
npm install chart.js bootstrap bootstrap-icons
```

### Step 7.3 — Configure App Entry Points

`src/index.html` — The root HTML file that loads the app:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LogisticsPro — Courier Management</title>
  <!-- Google Fonts for premium typography -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
</head>
<body>
  <app-root></app-root>  <!-- Angular mounts here -->
</body>
</html>
```

`src/app/app.config.ts` — Provides global services:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),      // Enables routing
    provideHttpClient()         // Enables HTTP calls
  ]
};
```

### Step 7.4 — Define All Routes

`src/app/app.routes.ts` — Maps URLs to components:
```typescript
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { Dashboard } from './components/dashboard/dashboard';
import { InventoryComponent } from './components/inventory/inventory';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes (no login needed)
  { path: 'login', component: Login },
  { path: 'signup', component: SignupComponent },
  { path: 'tracking-public', component: TrackingPublic },
  
  // Protected routes (login required)
  {
    path: '',
    component: Layout,          // Navigation shell
    canActivate: [authGuard],  // Guard checks token
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'inventory', component: InventoryComponent },
      { path: 'booking', component: Booking },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  { path: '**', redirectTo: 'login' }  // Catch unknown URLs
];
```

---

## ═══════════════════════════════════════════
## STEP 8: THE AUTH GUARD
## ═══════════════════════════════════════════

File: `src/app/guards/auth.guard.ts`

The auth guard is a function that runs BEFORE any protected route loads. If no valid token is found, it redirects the user to login.

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token) {
    return true;         // Allow navigation
  }
  
  // Redirect to login page
  return router.createUrlTree(['/login']);
};
```

**How it works:**
1. User tries to visit `/dashboard`
2. Angular checks canActivate: `[authGuard]`
3. Guard reads `localStorage.getItem('token')`
4. If token exists → allow access to Dashboard
5. If no token → redirect to `/login` page

---

## ═══════════════════════════════════════════
## STEP 9: BUILDING THE AUTH SERVICE
## ═══════════════════════════════════════════

Services in Angular are singleton classes that share data and logic across components. The `AuthService` handles all communication with the authentication API.

File: `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api';   // Relative path - no hardcoded domain!

  constructor(private http: HttpClient) {}

  // Call POST /api/login
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Call POST /api/register
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Save token to browser storage after login
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get stored token for attaching to requests
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Remove token on logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
```

Why use `/api` instead of `http://localhost:5000/api`?
- Using a relative path means the same code works in development (localhost:5000) and production (yourapp.onrender.com)
- No code changes needed when deploying!

---

## ═══════════════════════════════════════════
## STEP 10: BUILDING THE LOGIN COMPONENT
## ═══════════════════════════════════════════

### Step 10.1 — The TypeScript Logic

File: `src/app/components/login/login.ts`
```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value as any).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Login failed. Please try again.'
        );
      }
    });
  }
}
```

### Step 10.2 — The HTML Template

File: `src/app/components/login/login.html`
```html
<div class="login-wrapper">
  <div class="login-card glass-card">
    <div class="login-header">
      <i class="bi bi-truck-flatbed"></i>
      <h1>LogisticsPro</h1>
      <p>Sign in to your account</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <!-- Error Alert -->
      @if (errorMessage()) {
        <div class="alert alert-danger">{{ errorMessage() }}</div>
      }

      <!-- Email Field -->
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" 
               formControlName="email" 
               class="form-control"
               placeholder="Enter your email">
        @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
          <span class="error-text">Valid email is required</span>
        }
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label>Password</label>
        <input type="password"
               formControlName="password"
               class="form-control"
               placeholder="Enter your password">
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-login" [disabled]="isLoading()">
        {{ isLoading() ? 'Signing in...' : 'Sign In' }}
      </button>

      <p class="register-link">
        Don't have an account? 
        <a routerLink="/signup">Register here</a>
      </p>
    </form>
  </div>
</div>
```
