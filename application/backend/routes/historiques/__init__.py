from flask import Blueprint

historiques_bp = Blueprint('historiques', __name__)

from . import get_historiques, create_historique 