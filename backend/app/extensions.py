from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()
bcrypt = Bcrypt()

# In-memory token blocklist for revoked JWTs
TOKEN_BLOCKLIST = set()


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload.get("jti")
    return jti in TOKEN_BLOCKLIST
