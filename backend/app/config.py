import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'hemora-secret-key-change-in-production-2024')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'hemora-jwt-secret-key-change-in-production-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@hemora.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Admin@123')


class DevelopmentConfig(Config):
    """Development configuration with SQLite fallback."""
    DEBUG = True
    ENV = 'development'

    # Support SQLite fallback if MySQL is not available or if USE_SQLITE is True
    database_url = os.getenv('DATABASE_URL')
    sqlite_url = os.getenv('SQLITE_URL', 'sqlite:///hemora_dev.db')
    use_sqlite = os.getenv('USE_SQLITE', 'True').lower() in ('true', '1', 't')

    if use_sqlite or not database_url:
        SQLALCHEMY_DATABASE_URI = sqlite_url
    else:
        SQLALCHEMY_DATABASE_URI = database_url


class TestingConfig(Config):
    """Testing configuration with in-memory SQLite."""
    TESTING = True
    DEBUG = True
    ENV = 'testing'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'hemora-test-jwt-secret-key'
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    ENV = 'production'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///hemora_prod.db')


config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
