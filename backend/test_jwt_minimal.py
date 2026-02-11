#!/usr/bin/env python3
"""
Minimal JWT test to verify Flask-JWT-Extended is working.
"""
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'test-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

jwt = JWTManager(app)

@app.route('/test-create')
def test_create():
    token = create_access_token(identity=123)
    return {'token': token}

@app.route('/test-verify')
@jwt_required()
def test_verify():
    user_id = get_jwt_identity()
    return {'user_id': user_id, 'message': 'JWT works!'}

if __name__ == '__main__':
    with app.test_client() as client:
        # Create token
        print("1. Creating token...")
        resp = client.get('/test-create')
        token = resp.json['token']
        print(f"   Token: {token[:50]}...")

        # Verify token
        print("\n2. Verifying token...")
        resp = client.get('/test-verify', headers={'Authorization': f'Bearer {token}'})
        print(f"   Status: {resp.status_code}")
        print(f"   Response: {resp.json}")

        if resp.status_code == 200:
            print("\n✓ JWT is working correctly!")
        else:
            print(f"\n✗ JWT verification failed!")
